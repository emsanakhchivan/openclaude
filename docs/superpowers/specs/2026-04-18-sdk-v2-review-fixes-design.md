# SDK V2 Review Fixes Design

Date: 2026-04-18
Branch: feat/sdk-implementation
Status: Approved
Supersedes: 2026-04-17-sdk-review-fixes-design.md

## Context

Second-round code review of the SDK implementation identified 4 critical bugs (score >= 80) and 5 medium-severity bugs (score 75). This spec covers fixes for all 9 issues.

Approach: Minimal fix per bug + automated type generation for sdk.d.ts.

---

## Critical Bug #1: extractPromptFromUserMessage produces "[object Object]"

**File**: `src/entrypoints/sdk.ts:1192-1203`
**Severity**: Score 85 — runtime data corruption

**Problem**: `SDKUserMessage.message` is typed as `Record<string, unknown> & { role: "user", content: string | Array<unknown> }` (an object per `coreTypes.generated.ts:1565`). The function checks `typeof message === 'string'` (always false) and `Array.isArray(message)` (always false). Falls through to `String(message)` → `"[object Object]"`.

**Solution**: Access `message.content` instead of treating `message` as a string/array.

```typescript
function extractPromptFromUserMessage(
  msg: SDKUserMessage,
): string | Array<{ type: string; text?: string; [key: string]: unknown }> {
  const { message } = msg
  // message is always { role: "user", content: string | Array<unknown> }
  if (typeof message.content === 'string') {
    return message.content
  }
  if (Array.isArray(message.content)) {
    return message.content as Array<{ type: string; text?: string; [key: string]: unknown }>
  }
  return String(message.content ?? '')
}
```

**Files**: `src/entrypoints/sdk.ts`

---

## Critical Bug #2: unstable_v2_resumeSession return type mismatch

**File**: `src/entrypoints/sdk.d.ts:339-342`, `src/entrypoints/sdk.ts:1621`
**Severity**: Score 90 — type-level contract broken

**Problem**: `sdk.d.ts` declares `unstable_v2_resumeSession(...): SDKSession` (synchronous). Implementation at `sdk.ts:1621` returns `Promise<SDKSession>`. Consumers using `.d.ts` types get a Promise where they expect SDKSession.

**Solution**: Update `sdk.d.ts` to `Promise<SDKSession>`.

```typescript
// sdk.d.ts
export function unstable_v2_resumeSession(
  sessionId: string,
  options: SDKSessionOptions,
): Promise<SDKSession>
```

**Files**: `src/entrypoints/sdk.d.ts`

---

## Critical Bug #3: continue option doesn't load prior session messages

**File**: `src/entrypoints/sdk.ts:962-969`
**Severity**: Score 80 — feature broken

**Problem**: The continue path resolves `effectiveSessionId` but never loads messages into the QueryEngine. Fork path (lines 974-1006) correctly calls `this.engine.injectMessages()`. Same bug pattern fixed in commit 1073675 for resumeSession.

**Solution**: Extract shared helper `loadAndInjectSessionMessages()` and use in both continue and fork paths.

```typescript
async function loadAndInjectSessionMessages(
  sessionId: string,
  cwd: string,
  engine: QueryEngine,
): Promise<void> {
  const resolved = await resolveSessionFilePath(sessionId, cwd)
  if (!resolved) return

  const entries = await readJSONLFile<JsonlEntry>(resolved.filePath)
  const messages: unknown[] = entries
    .filter(entry => !entry.isSidechain && (entry.type === 'user' || entry.type === 'assistant'))
    .map(entry => ({ ...entry }))

  if (messages.length > 0) {
    engine.injectMessages(messages as Parameters<QueryEngine['injectMessages']>[0])
  }
}
```

Continue path calls `loadAndInjectSessionMessages(effectiveSessionId, this.cwd, this.engine)` after resolving the session ID. Fork path refactored to use the same helper.

**Files**: `src/entrypoints/sdk.ts`

---

## Critical Bug #4: setMaxThinkingTokens silently discards token budget

**File**: `src/entrypoints/sdk.ts:1177-1182`
**Severity**: Score 90 — feature reduced to boolean toggle

**Problem**: Method only sets `thinkingEnabled: boolean`. Token count never stored. CLI equivalent creates `{ type: 'enabled', budgetTokens }` but SDK discards this.

**Solution**:
1. Add `thinkingBudgetTokens?: number` to AppState (or store on SDKSessionImpl)
2. Update `setMaxThinkingTokens` to store the actual value
3. Use stored value when creating engine or sending messages

```typescript
// In setMaxThinkingTokens:
this.appStateStore.setState(prev => ({
  ...prev,
  thinkingEnabled: tokens > 0,
  thinkingBudgetTokens: tokens > 0 ? tokens : undefined,
}))
```

The thinking config needs to be applied at engine creation time and/or via engine update. Check if `QueryEngine` supports dynamic thinkingConfig updates; if not, store on the session object and apply when building messages.

**Files**: `src/entrypoints/sdk.ts`

---

## Medium Bug #5: Debug console.log statements leak env var values

**File**: `src/entrypoints/sdk.ts:953-959`
**Severity**: Score 75 — security concern

**Problem**: `console.log` statements printing `OPENAI_BASE_URL`, `OPENAI_MODEL` etc. to stdout unconditionally. An SDK library should not pollute stdout.

**Solution**: Remove all `console.log` statements in the `sendMessage`/`[Symbol.asyncIterator]` flow. If debugging is needed, use a conditional debug flag or stderr.

**Files**: `src/entrypoints/sdk.ts`

---

## Medium Bug #6: respondToPermission() is unreachable dead code

**File**: `src/entrypoints/sdk.ts:679, 908, 1076`
**Severity**: Score 75 — API surface is dead

**Problem**: `registerPendingPermission()` is never called from the permission resolution flow, so external callers using `respondToPermission()` have no effect.

**Solution**: Wire `registerPendingPermission()` into the `canUseTool` callback flow. When the engine requests a permission check and `canUseTool` is provided by the consumer, emit the permission request message and call `registerPendingPermission()` to create the pending promise. This connects the public API surface to the internal flow.

**Files**: `src/entrypoints/sdk.ts`

---

## Medium Bug #7: sdk.d.ts types diverge from coreTypes.generated.ts

**File**: `src/entrypoints/sdk.d.ts:163-173`
**Severity**: Score 75 — misleading types

**Problem**: Hand-written `SDKUserMessage` in `sdk.d.ts` defines `message: string | Array<...>` but `coreTypes.generated.ts` defines `message: Record<string, unknown> & { role, content }`. Consumers get wrong type information.

**Solution**: Update `sdk.d.ts` types to match `coreTypes.generated.ts`. Add `npm run generate:sdk-types` script that extracts type definitions from `sdk.ts` and writes `sdk.d.ts`.

**Files**: `src/entrypoints/sdk.d.ts`

---

## Medium Bug #8: ApiKeySource 'none' uses type assertion bypass

**File**: `src/entrypoints/sdk.ts:1173`
**Severity**: Score 75 — type safety violation

**Problem**: `return { apiKeySource: 'none' as ApiKeySource }` uses assertion to bypass the union type. `'none'` is not in `ApiKeySource = 'user' | 'project' | 'org' | 'temporary' | 'oauth'`.

**Solution**: Add `'none'` to the `ApiKeySource` union type in `sdk.d.ts` and the source.

**Files**: `src/entrypoints/sdk.d.ts`, `src/entrypoints/sdk.ts`

---

## Medium Bug #9: getMessages() double-cast without mapping

**File**: `src/entrypoints/sdk.ts:1482`
**Severity**: Score 75 — shape mismatch

**Problem**: `this.engine.getMessages() as unknown as SDKMessage[]` — internal `Message[]` has fundamentally different shape than `SDKMessage[]`.

**Solution**: Write a mapper function that converts `Message[]` to `SDKMessage[]` with correct field mapping. At minimum, map `type`, `uuid`, `message` fields.

```typescript
function mapMessageToSDK(msg: Message): SDKMessage {
  return {
    type: msg.type,
    uuid: msg.uuid,
    message: msg.message,
    // ... other relevant fields
  } as SDKMessage
}
```

**Files**: `src/entrypoints/sdk.ts`

---

## Implementation Order

1. Bug #1 (extractPrompt) — isolated fix, no dependencies
2. Bug #3 (continue path) — shared helper refactoring
3. Bug #2 (resumeSession type) — .d.ts fix
4. Bug #4 (thinkingTokens) — AppState + engine config
5. Bug #5 (console.log cleanup) — simple deletion
6. Bug #8 (ApiKeySource 'none') — type union update
7. Bug #9 (getMessages mapper) — mapper function
8. Bug #7 (sdk.d.ts divergence) — type alignment + gen script
9. Bug #6 (respondToPermission wiring) — most complex, needs careful testing

## Risk Assessment

- Bug #1: High impact, low risk fix. Direct data corruption.
- Bug #2: Type-only change. Will break consumers who don't await — acceptable for `@alpha` API.
- Bug #3: Moderate risk — shared helper must handle edge cases from both paths.
- Bug #4: Moderate risk — depends on how thinkingConfig flows through engine.
- Bug #5: Zero risk — removing debug output.
- Bug #6: Higher risk — wiring into permission flow needs integration testing.
- Bug #7: Type-only change, but gen script is new code.
- Bug #8: Type union expansion, backward compatible.
- Bug #9: Mapper may miss fields — needs testing against real data.
