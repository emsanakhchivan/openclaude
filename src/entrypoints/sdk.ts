/**
 * SDK entry point — session management functions.
 *
 * This file is bundled as `dist/sdk.mjs` separately from the CLI.
 * It must NOT import React, Ink, or any CLI/TUI code.
 *
 * All session data is read from JSONL files on disk using existing portable
 * utilities that have no heavy dependencies.
 */

import { randomUUID } from 'crypto'
import type { UUID } from 'crypto'
import { appendFile, mkdir, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import {
  listSessionsImpl,
  parseSessionInfoFromLite,
  type SessionInfo,
} from '../utils/listSessionsImpl.js'
import {
  readSessionLite,
  resolveSessionFilePath,
  validateUuid,
} from '../utils/sessionStoragePortable.js'
import { readJSONLFile } from '../utils/json.js'

/**
 * Validate sessionId is a proper UUID to prevent path traversal.
 * Throws if invalid.
 */
function assertValidSessionId(sessionId: string): void {
  if (!validateUuid(sessionId)) {
    throw new Error(`Invalid session ID: ${sessionId}`)
  }
}

// ============================================================================
// SDK Types — snake_case public interface
// ============================================================================

/**
 * Session metadata returned by listSessions and getSessionInfo.
 * Uses snake_case field names matching the public SDK contract.
 */
export type SDKSessionInfo = {
  session_id: string
  summary: string
  last_modified: number
  file_size?: number
  custom_title?: string
  first_prompt?: string
  git_branch?: string
  cwd?: string
  tag?: string
  created_at?: number
}

/** Options for listSessions. */
export type ListSessionsOptions = {
  /** Project directory. When omitted, returns sessions across all projects. */
  dir?: string
  /** Maximum number of sessions to return. */
  limit?: number
  /** Number of sessions to skip (pagination). */
  offset?: number
  /** Include git worktree sessions (default true). */
  includeWorktrees?: boolean
}

/** Options for getSessionInfo. */
export type GetSessionInfoOptions = {
  /** Project directory. When omitted, searches all project directories. */
  dir?: string
}

/** Options for getSessionMessages. */
export type GetSessionMessagesOptions = {
  /** Project directory. When omitted, searches all project directories. */
  dir?: string
  /** Maximum number of messages to return. */
  limit?: number
  /** Number of messages to skip (pagination). */
  offset?: number
  /** Include system messages in the output. Default false. */
  includeSystemMessages?: boolean
}

/** Options for renameSession and tagSession. */
export type SessionMutationOptions = {
  /** Project directory. When omitted, searches all project directories. */
  dir?: string
}

/** Options for forkSession. */
export type ForkSessionOptions = {
  /** Project directory. When omitted, searches all project directories. */
  dir?: string
  /** Fork up to (and including) this message UUID. */
  upToMessageId?: string
  /** Title for the forked session. */
  title?: string
}

/** Result of forkSession. */
export type ForkSessionResult = {
  /** UUID of the newly created forked session. */
  session_id: string
}

/**
 * A single message in a session conversation.
 * Returned by getSessionMessages.
 */
export type SessionMessage = {
  role: 'user' | 'assistant' | 'system'
  content: unknown
  timestamp?: string
  uuid?: string
  parent_uuid?: string | null
  [key: string]: unknown
}

// ============================================================================
// Error class
// ============================================================================

/**
 * Error thrown when an SDK operation is aborted via AbortController.
 */
export class AbortError extends Error {
  override readonly name = 'AbortError'
}

// ============================================================================
// Internal: SessionInfo → SDKSessionInfo mapping
// ============================================================================

function toSDKSessionInfo(info: SessionInfo): SDKSessionInfo {
  return {
    session_id: info.sessionId,
    summary: info.summary,
    last_modified: info.lastModified,
    file_size: info.fileSize,
    custom_title: info.customTitle,
    first_prompt: info.firstPrompt,
    git_branch: info.gitBranch,
    cwd: info.cwd,
    tag: info.tag,
    created_at: info.createdAt,
  }
}

// ============================================================================
// Session functions
// ============================================================================

/**
 * List sessions with metadata.
 *
 * When `dir` is provided, returns sessions for that project directory
 * and its git worktrees. When omitted, returns sessions across all projects.
 *
 * Use `limit` and `offset` for pagination.
 */
export async function listSessions(
  options?: ListSessionsOptions,
): Promise<SDKSessionInfo[]> {
  const sessions = await listSessionsImpl(options)
  return sessions.map(toSDKSessionInfo)
}

/**
 * Reads metadata for a single session by ID.
 * Returns undefined if the session file is not found, is a sidechain session,
 * or has no extractable summary.
 *
 * @param sessionId - UUID of the session
 * @param options - Optional dir to narrow the search
 */
export async function getSessionInfo(
  sessionId: string,
  options?: GetSessionInfoOptions,
): Promise<SDKSessionInfo | undefined> {
  assertValidSessionId(sessionId)
  const resolved = await resolveSessionFilePath(sessionId, options?.dir)
  if (!resolved) return undefined

  const lite = await readSessionLite(resolved.filePath)
  if (!lite) return undefined

  const info = parseSessionInfoFromLite(
    sessionId,
    lite,
    resolved.projectPath,
  )
  if (!info) return undefined

  return toSDKSessionInfo(info)
}

// ============================================================================
// Internal: JSONL line types used by getSessionMessages and forkSession
// ============================================================================

type JsonlEntry = {
  type: string
  uuid?: string
  parentUuid?: string | null
  sessionId?: string
  timestamp?: string
  message?: {
    role?: string
    content?: unknown
    [key: string]: unknown
  }
  isSidechain?: boolean
  [key: string]: unknown
}

/**
 * Reads a session's conversation messages from its JSONL transcript file.
 *
 * Parses the transcript, builds the conversation chain via parentUuid links,
 * and returns user/assistant messages in chronological order. Set
 * `includeSystemMessages: true` in options to also include system messages.
 *
 * @param sessionId - UUID of the session to read
 * @param options - Optional dir, limit, offset, and includeSystemMessages
 * @returns Array of messages, or empty array if session not found
 */
export async function getSessionMessages(
  sessionId: string,
  options?: GetSessionMessagesOptions,
): Promise<SessionMessage[]> {
  assertValidSessionId(sessionId)
  const resolved = await resolveSessionFilePath(sessionId, options?.dir)
  if (!resolved) return []

  const entries = await readJSONLFile<JsonlEntry>(resolved.filePath)
  if (entries.length === 0) return []

  // Build map of uuid → entry, filter non-message entries
  const byUuid = new Map<string, JsonlEntry>()
  for (const entry of entries) {
    if (!entry.uuid) continue
    // Skip sidechain entries
    if (entry.isSidechain) continue
    // Only include entries with a meaningful type
    const role = entryToRole(entry)
    if (role === null) continue
    byUuid.set(entry.uuid, entry)
  }

  if (byUuid.size === 0) return []

  // Find the leaf (last entry that has a uuid and valid role)
  let leaf: JsonlEntry | undefined
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i]
    if (entry?.uuid && byUuid.has(entry.uuid)) {
      leaf = entry
      break
    }
  }
  if (!leaf) return []

  // Build conversation chain by walking parentUuid from leaf to root
  const chain: JsonlEntry[] = []
  const seen = new Set<string>()
  let current: JsonlEntry | undefined = leaf
  while (current) {
    if (!current.uuid || seen.has(current.uuid)) break
    seen.add(current.uuid)
    chain.push(current)
    const parentRef: string | null | undefined = current.parentUuid
    current = parentRef ? byUuid.get(parentRef) : undefined
  }
  chain.reverse()

  // Map to SessionMessage
  const includeSystem = options?.includeSystemMessages ?? false
  let messages: SessionMessage[] = chain
    .filter(entry => {
      const role = entryToRole(entry)
      if (role === 'system') return includeSystem
      return role !== null
    })
    .map(entry => entryToSessionMessage(entry))

  // Apply offset/limit
  const offset = options?.offset ?? 0
  if (offset > 0) messages = messages.slice(offset)
  const limit = options?.limit
  if (limit !== undefined && limit > 0) messages = messages.slice(0, limit)

  return messages
}

/**
 * Determine the role of a JSONL entry, or null if it's not a conversational message.
 */
function entryToRole(entry: JsonlEntry): 'user' | 'assistant' | 'system' | null {
  switch (entry.type) {
    case 'user':
      return 'user'
    case 'assistant':
      return 'assistant'
    case 'summary':
    case 'system':
      return 'system'
    default:
      return null
  }
}

/**
 * Convert a JSONL entry to a SessionMessage.
 */
function entryToSessionMessage(entry: JsonlEntry): SessionMessage {
  const role = entryToRole(entry) ?? 'system'
  return {
    role,
    content: entry.message?.content,
    timestamp: entry.timestamp,
    uuid: entry.uuid,
    parent_uuid: entry.parentUuid,
  }
}

// ============================================================================
// Internal: append a JSONL entry to a session file (portable, no heavy deps)
// ============================================================================

async function appendJsonlEntry(
  filePath: string,
  entry: Record<string, unknown>,
): Promise<void> {
  const line = JSON.stringify(entry) + '\n'
  try {
    await appendFile(filePath, line, { mode: 0o600 })
  } catch {
    await mkdir(dirname(filePath), { mode: 0o700, recursive: true })
    await appendFile(filePath, line, { mode: 0o600 })
  }
}

// ============================================================================
// Session mutation functions
// ============================================================================

/**
 * Rename a session. Appends a custom-title entry to the session's JSONL file.
 *
 * @param sessionId - UUID of the session
 * @param title - New title
 * @param options - Optional dir to narrow the search
 */
export async function renameSession(
  sessionId: string,
  title: string,
  options?: SessionMutationOptions,
): Promise<void> {
  assertValidSessionId(sessionId)
  const resolved = await resolveSessionFilePath(sessionId, options?.dir)
  if (!resolved) {
    throw new Error(`Session not found: ${sessionId}`)
  }

  await appendJsonlEntry(resolved.filePath, {
    type: 'custom-title',
    customTitle: title,
    sessionId,
  })
}

/**
 * Tag a session. Pass null to clear the tag.
 *
 * @param sessionId - UUID of the session
 * @param tag - Tag string, or null to clear
 * @param options - Optional dir to narrow the search
 */
export async function tagSession(
  sessionId: string,
  tag: string | null,
  options?: SessionMutationOptions,
): Promise<void> {
  assertValidSessionId(sessionId)
  const resolved = await resolveSessionFilePath(sessionId, options?.dir)
  if (!resolved) {
    throw new Error(`Session not found: ${sessionId}`)
  }

  await appendJsonlEntry(resolved.filePath, {
    type: 'tag',
    tag: tag ?? '',
    sessionId,
  })
}

// ============================================================================
// forkSession
// ============================================================================

/**
 * Fork a session into a new branch with fresh UUIDs.
 *
 * Copies transcript messages from the source session into a new session file,
 * remapping every message UUID and preserving the parentUuid chain. Supports
 * `upToMessageId` for branching from a specific point in the conversation.
 *
 * Forked sessions start without undo history (file-history snapshots are not
 * copied).
 *
 * @param sessionId - UUID of the source session
 * @param options - Optional dir, upToMessageId, title
 * @returns Object with the new session_id
 */
export async function forkSession(
  sessionId: string,
  options?: ForkSessionOptions,
): Promise<ForkSessionResult> {
  assertValidSessionId(sessionId)
  const resolved = await resolveSessionFilePath(sessionId, options?.dir)
  if (!resolved) {
    throw new Error(`Session not found: ${sessionId}`)
  }

  // Read all JSONL entries
  const entries = await readJSONLFile<JsonlEntry>(resolved.filePath)
  if (entries.length === 0) {
    throw new Error(`Session is empty: ${sessionId}`)
  }

  // Generate new session ID and UUID remapping
  const forkSessionId = randomUUID() as UUID

  // Determine the target directory: same as source
  const targetDir = dirname(resolved.filePath)
  const forkPath = join(targetDir, `${forkSessionId}.jsonl`)

  // UUID remapping: old UUID → new UUID
  const uuidMap = new Map<string, UUID>()

  // Filter to main conversation entries only (no sidechains)
  // If upToMessageId is specified, stop at that message
  const mainEntries: JsonlEntry[] = []
  let hitUpTo = false
  for (const entry of entries) {
    if (entry.isSidechain) continue
    if (!entry.uuid) continue

    // Only include conversational entries
    const role = entryToRole(entry)
    if (role === null) {
      // Include metadata entries (custom-title, tag, etc.) but don't track them in chain
      continue
    }

    // Remap UUID upfront
    const newUuid = randomUUID() as UUID
    uuidMap.set(entry.uuid, newUuid)

    mainEntries.push(entry)

    if (options?.upToMessageId && entry.uuid === options.upToMessageId) {
      hitUpTo = true
      break
    }
  }

  if (mainEntries.length === 0) {
    throw new Error(`No conversational messages to fork in session: ${sessionId}`)
  }

  if (options?.upToMessageId && !hitUpTo) {
    throw new Error(
      `upToMessageId ${options.upToMessageId} not found in session ${sessionId}`,
    )
  }

  // Build forked entries with remapped UUIDs
  const lines: string[] = []
  let parentUuid: UUID | null = null

  for (const entry of mainEntries) {
    const oldUuid = entry.uuid!
    const newUuid = uuidMap.get(oldUuid)!
    const oldParent = entry.parentUuid ?? null
    const newParent = oldParent ? (uuidMap.get(oldParent) ?? null) : null

    const forkedEntry: JsonlEntry & {
      sessionId: string
      forkedFrom: { sessionId: string; messageUuid: string }
    } = {
      ...entry,
      uuid: newUuid,
      parentUuid: newParent,
      sessionId: forkSessionId,
      isSidechain: false,
      forkedFrom: {
        sessionId,
        messageUuid: oldUuid,
      },
    }

    lines.push(JSON.stringify(forkedEntry))
    parentUuid = newUuid
  }

  // Write fork session file
  await writeFile(forkPath, lines.join('\n') + '\n', {
    encoding: 'utf8',
    mode: 0o600,
  })

  // Apply title if provided
  if (options?.title) {
    await appendJsonlEntry(forkPath, {
      type: 'custom-title',
      customTitle: options.title,
      sessionId: forkSessionId,
    })
  }

  return { session_id: forkSessionId }
}
