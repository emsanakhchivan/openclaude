# SDK Review Fixes Design

Date: 2026-04-17
Branch: feat/sdk-implementation
Status: Approved

## Context

Code review of the SDK implementation (28 commits, `feat/sdk-implementation` → `main`) identified 2 critical issues and 3 lower-priority findings. This spec covers fixes for all 5.

---

## Fix 1: resumeSession — Real Implementation

**Problem**: `unstable_v2_resumeSession` claims to load messages from disk but creates a fresh engine.

**Solution**: Make the function `async`, load messages from JSONL, and pass them as `initialMessages`.

**Steps**:
1. Change function signature from sync to async
2. Call `resolveSessionFilePath(sessionId)` to locate the JSONL file
3. Call `readJSONLFile()` to read all lines
4. Use existing `getSessionMessages()` to reconstruct the conversation chain via parentUuid
5. Pass `initialMessages: messages` to `createEngineFromOptions`
6. Engine constructor already handles `config.initialMessages` — no QueryEngine changes needed

**Error handling**:
- Session not found → throw descriptive error
- Corrupt JSONL → graceful fallback with warning

**Files**: `src/entrypoints/sdk.ts`

---

## Fix 2: setPermissionMode — Dynamic Tool Update

**Problem**: `setPermissionMode` updates appStateStore but tools are frozen at construction time.

**Solution**: Add `updateTools()` to QueryEngine, call it from `setPermissionMode`.

**Steps**:
1. Add `updateTools(tools: Tool[])` method to `QueryEngine` that replaces `this.config.tools`
2. In `setPermissionMode`:
   - Build new permission context (existing code)
   - Call `getTools(newPermissionContext)` to get updated tool list
   - Call `engine.updateTools(tools)` to apply changes

**Pattern**: Follows existing `injectAgents()` precedent.

**Files**: `src/QueryEngine.ts`, `src/entrypoints/sdk.ts`

---

## Fix 3: Duplicate Agent Loading

**Problem**: `sendMessage()` loads agents on every call.

**Solution**: Cache with a boolean flag.

**Steps**:
1. Add `private agentsLoaded = false` to `SDKSessionImpl`
2. In `sendMessage()`, only load agents when `!this.agentsLoaded`
3. Set `this.agentsLoaded = true` after successful load

**Files**: `src/entrypoints/sdk.ts`

---

## Fix 4: Empty ExitReason Type

**Problem**: `ExitReason` is an empty object type, provides no information.

**Solution**: Define as discriminated union with meaningful exit reasons.

```typescript
export type ExitReason =
  | { type: 'end_turn' }
  | { type: 'tool_use'; toolName: string }
  | { type: 'max_tokens' }
  | { type: 'stop_sequence'; sequence: string }
  | { type: 'interrupted' }
  | { type: 'error'; error: string }
```

**Files**: `src/entrypoints/agentSdkTypes.ts`

---

## Fix 5: Type Generation TODOs

**Problem**: Three TODO comments in `sdk.ts` about replacing with generated types.

**Solution**:
- Check `coreTypes.generated.ts` for available types
- Import and use existing generated types where available, remove TODOs
- For missing types, convert TODO to explicit `FIXME` with pointer to `scripts/generate-sdk-types.ts`

**Files**: `src/entrypoints/sdk.ts`, `src/entrypoints/sdk/coreTypes.generated.ts`

---

## Risk Assessment

- Fix 1: API signature change (sync → async). Acceptable for `@alpha` API.
- Fix 2: New public method on QueryEngine. Low risk — follows existing pattern.
- Fix 3: Minimal change, no API impact.
- Fix 4: Type-only change, no runtime impact.
- Fix 5: Type-only change, no runtime impact.
