# SDK Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 issues from code review: resumeSession, setPermissionMode, duplicate agent loading, empty ExitReason, and type generation TODOs.

**Architecture:** All fixes target the SDK layer (`src/entrypoints/sdk.ts`) and its dependencies. Two fixes require changes to `QueryEngine.ts` and `agentSdkTypes.ts`. Each fix is independent and can be implemented sequentially.

**Tech Stack:** TypeScript, Node.js

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/entrypoints/sdk.ts` | Modify | Fix 1 (resumeSession), Fix 3 (agent loading), Fix 5 (TODOs) |
| `src/QueryEngine.ts` | Modify | Fix 2 (add `updateTools()` method) |
| `src/entrypoints/agentSdkTypes.ts` | Modify | Fix 4 (ExitReason type) |

---

### Task 1: Add `updateTools()` to QueryEngine

**Files:**
- Modify: `src/QueryEngine.ts:1191-1193` (after `injectAgents`)

- [ ] **Step 1: Add the `updateTools` method to QueryEngine**

Insert after the `injectAgents` method (after line 1193):

```typescript
  /**
   * Update the engine's tool list dynamically.
   * Used by SDK setPermissionMode to refresh tools when permission mode changes.
   */
  updateTools(tools: Tools): void {
    this.config.tools = tools
  }
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `updateTools`

- [ ] **Step 3: Commit**

```bash
git add src/QueryEngine.ts
git commit -m "feat(sdk): add updateTools() to QueryEngine for dynamic tool refresh"
```

---

### Task 2: Fix `setPermissionMode` to update tools dynamically

**Files:**
- Modify: `src/entrypoints/sdk.ts:1075-1084`

- [ ] **Step 1: Update the `setPermissionMode` implementation in SDKSessionImpl (v1 Query)**

Replace the method at line 1075:

```typescript
  async setPermissionMode(mode: QueryPermissionMode): Promise<void> {
    const newPermissionContext = buildPermissionContext({
      ...({ cwd: '' } as QueryOptions),
      permissionMode: mode,
    })
    this.appStateStore.setState(prev => ({
      ...prev,
      toolPermissionContext: newPermissionContext,
    }))
    // Refresh the engine's tool list to reflect new permissions
    const updatedTools = getTools(newPermissionContext)
    this.engine.updateTools(updatedTools)
  }
```

Note: The import for `getTools` already exists at line 27.

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `setPermissionMode`

- [ ] **Step 3: Commit**

```bash
git add src/entrypoints/sdk.ts
git commit -m "fix(sdk): setPermissionMode now dynamically updates available tools"
```

---

### Task 3: Fix `resumeSession` to actually load messages

**Files:**
- Modify: `src/entrypoints/sdk.ts:1631-1656`

- [ ] **Step 1: Rewrite `unstable_v2_resumeSession` as async with real message loading**

Replace lines 1631-1656 with:

```typescript
/**
 * V2 API - UNSTABLE
 * Resume an existing session by ID. Loads the session's prior messages
 * from disk and passes them to the QueryEngine so the conversation
 * continues from where it left off.
 *
 * @alpha
 *
 * @param sessionId - UUID of the session to resume
 * @param options - Session options (cwd is required)
 * @returns SDKSession with prior conversation history loaded
 *
 * @example
 * ```typescript
 * const session = await unstable_v2_resumeSession(sessionId, { cwd: '/my/project' })
 * for await (const msg of session.sendMessage('Continue where we left off')) {
 *   console.log(msg)
 * }
 * ```
 */
export async function unstable_v2_resumeSession(
  sessionId: string,
  options: SDKSessionOptions,
): Promise<SDKSession> {
  assertValidSessionId(sessionId)

  // Load prior messages from the session's JSONL transcript
  const priorMessages = await getSessionMessages(sessionId, {
    dir: options.cwd,
    includeSystemMessages: false,
  })

  // Convert SessionMessage[] to the format QueryEngine expects
  // Each SessionMessage has { role, content, ... } which maps to Message
  const initialMessages = priorMessages.map((msg): Record<string, unknown> => ({
    role: msg.role,
    content: msg.content,
    ...(msg as Record<string, unknown>),
  }))

  const { engine, appStateStore } = createEngineFromOptions(
    options,
    initialMessages as any[],
  )
  return new SDKSessionImpl(engine, sessionId, options, appStateStore)
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `resumeSession`

- [ ] **Step 3: Commit**

```bash
git add src/entrypoints/sdk.ts
git commit -m "fix(sdk): unstable_v2_resumeSession now loads messages from disk"
```

---

### Task 4: Fix duplicate agent loading in `sendMessage`

**Files:**
- Modify: `src/entrypoints/sdk.ts:1467-1510`

- [ ] **Step 1: Add `agentsLoaded` flag and guard to SDKSessionImpl**

In the `SDKSessionImpl` class, add the flag after line 1471 (after `private appStateStore`):

```typescript
  private agentsLoaded = false
```

Then replace the `sendMessage` method (lines 1489-1510) with:

```typescript
  async *sendMessage(content: string): AsyncIterable<SDKMessage> {
    await init()

    // Load agent definitions once (not on every sendMessage call)
    if (!this.agentsLoaded) {
      try {
        const agentDefs = await getAgentDefinitionsWithOverrides(this.options.cwd)
        console.log(`[sdk] sendMessage: Loaded ${agentDefs.activeAgents.length} agents`)
        this.appStateStore.setState(prev => ({
          ...prev,
          agentDefinitions: agentDefs,
        }))
        if (agentDefs.activeAgents.length > 0) {
          this.engine.injectAgents(agentDefs.activeAgents)
        }
      } catch (err) {
        console.log(`[sdk] Failed to load agents:`, err)
      }
      this.agentsLoaded = true
    }

    yield* this.engine.submitMessage(content)
  }
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/entrypoints/sdk.ts
git commit -m "fix(sdk): cache agent definitions to avoid reloading on every sendMessage"
```

---

### Task 5: Fix empty `ExitReason` type

**Files:**
- Modify: `src/entrypoints/agentSdkTypes.ts:255-258`

- [ ] **Step 1: Replace empty ExitReason with values from generated types**

The generated `coreTypes.generated.ts` already defines:
```typescript
export type ExitReason = "clear" | "resume" | "logout" | "prompt_input_exit" | "other" | "bypass_permissions_disabled"
```

Replace lines 255-258 in `agentSdkTypes.ts`:

```typescript
// add exit reason types for removing the error within gracefulShutdown file
export type ExitReason =
  | 'clear'
  | 'resume'
  | 'logout'
  | 'prompt_input_exit'
  | 'other'
  | 'bypass_permissions_disabled'
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/entrypoints/agentSdkTypes.ts
git commit -m "fix(sdk): populate ExitReason type with actual exit reasons"
```

---

### Task 6: Resolve type generation TODOs

**Files:**
- Modify: `src/entrypoints/sdk.ts:84-97` (SDKMessage)
- Modify: `src/entrypoints/sdk.ts:99-118` (SDKUserMessage)
- Modify: `src/entrypoints/sdk.ts:1423-1442` (SDKResultMessage)

- [ ] **Step 1: Replace manual SDKMessage type with import from generated types**

The generated file already has `SDKMessage` (line 2044) and `SDKUserMessage` (line 1563) and `SDKResultMessage` (line 1713).

Add import at the top of the file (after existing imports, around line 69):

```typescript
import type {
  SDKMessage as GeneratedSDKMessage,
  SDKUserMessage as GeneratedSDKUserMessage,
  SDKResultMessage as GeneratedSDKResultMessage,
} from './sdk/coreTypes.generated.js'
```

Then replace the SDKMessage type (lines 84-97) with:

```typescript
/**
 * A message emitted by the query engine during a conversation.
 * Re-exports the full generated type from coreTypes.generated.ts.
 */
export type SDKMessage = GeneratedSDKMessage
```

Replace the SDKUserMessage type (lines 99-118) with:

```typescript
/**
 * A user message fed into query() via AsyncIterable.
 * Re-exports the full generated type from coreTypes.generated.ts.
 */
export type SDKUserMessage = GeneratedSDKUserMessage
```

Replace the SDKResultMessage type (lines 1423-1442) with:

```typescript
/**
 * An SDKResultMessage is the final message emitted by a query turn,
 * containing the result text, usage stats, and cost information.
 * Re-exports the full generated type from coreTypes.generated.ts.
 */
export type SDKResultMessage = GeneratedSDKResultMessage
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors. If there are type incompatibilities, the manual types may have been used in ways that differ from the generated shapes — inspect and fix.

- [ ] **Step 3: Commit**

```bash
git add src/entrypoints/sdk.ts
git commit -m "fix(sdk): replace manual type stubs with generated types from coreTypes"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit --pretty`
Expected: Zero errors

- [ ] **Step 2: Run existing tests if available**

Run: `npx vitest run --reporter=verbose 2>&1 | tail -30`
Expected: All tests pass (or at minimum, no new failures)

- [ ] **Step 3: Review all changes**

Run: `git log --oneline -10`
Verify 7 clean commits with descriptive messages.
