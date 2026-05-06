import { getDrizzle } from "./client"
import { projects, sessions, messagesJsonl } from "./schema"
import { eq, desc, isNull, sql } from "drizzle-orm"

/**
 * Query helpers for common database operations
 * Hybrid storage: messages_jsonl contains raw SDK JSONL + extracted metadata
 */

/** Get a project with all its sessions */
export async function getProjectWithSessions(projectId: string) {
  const db = getDrizzle()

  const project = await db.select().from(projects).where(eq(projects.id, projectId)).get()
  if (!project) return null

  const projectSessions = await db.select().from(sessions).where(eq(sessions.projectId, projectId))

  return {
    project,
    sessions: projectSessions,
  }
}

/** Get recent active sessions for a project (not archived), ordered by update time (most recent first) */
export async function getRecentSessions(projectId: string, limit = 5) {
  const db = getDrizzle()

  return db
    .select()
    .from(sessions)
    .where(eq(sessions.projectId, projectId))
    .where(isNull(sessions.archivedAt)) // Only active sessions
    .orderBy(desc(sessions.updatedAt))
    .limit(limit)
}

/** Get a project by its path (unique constraint) */
export async function getProjectByPath(path: string) {
  const db = getDrizzle()

  return db.select().from(projects).where(eq(projects.path, path)).get()
}

/** Archive a session (soft delete) */
export async function archiveSession(sessionId: string) {
  const db = getDrizzle()

  return db
    .update(sessions)
    .set({ archivedAt: new Date() })
    .where(eq(sessions.id, sessionId))
}

/** Unarchive a session (restore) */
export async function unarchiveSession(sessionId: string) {
  const db = getDrizzle()

  return db
    .update(sessions)
    .set({ archivedAt: null })
    .where(eq(sessions.id, sessionId))
}

/**
 * Save SDK JSONL message line (hybrid storage)
 * Extracts metadata for queries, preserves raw content
 *
 * SDK entry handling:
 * - Skip entries without uuid (metadata: custom-title, tag, etc.)
 * - Skip sidechain entries (isSidechain=true)
 * - Map type → role: user, assistant, summary→system, system
 * - Return null if not a conversational message
 */
export async function saveMessage(sessionId: string, jsonlLine: string) {
  const db = getDrizzle()

  // Parse with error handling
  let parsed: any
  try {
    parsed = JSON.parse(jsonlLine)
  } catch (e) {
    throw new Error(`Invalid JSONL line: ${jsonlLine.slice(0, 100)}...`)
  }

  // Skip metadata entries (no uuid) — custom-title, tag, etc.
  if (!parsed.uuid) {
    return null
  }

  // Skip sidechain entries
  if (parsed.isSidechain) {
    return null
  }

  // Map SDK type → role (SDK's entryToRole logic)
  const role = mapSdkTypeToRole(parsed.type)
  if (!role) {
    // Not a conversational message, skip
    return null
  }

  // Insert with atomic line_number via subquery
  const result = await db.run(sql`
    INSERT INTO messages_jsonl (session_id, line_number, content, uuid, parent_uuid, role, created_at, tool_name)
    SELECT ${sessionId}, COALESCE(MAX(line_number), 0) + 1, ${jsonlLine}, ${parsed.uuid},
           ${parsed.parentUuid ?? null}, ${role}, ${parsed.timestamp ?? Date.now()},
           ${extractToolName(parsed)}
    FROM messages_jsonl WHERE session_id = ${sessionId}
  `)

  return result
}

/** Load all messages for a session (returns raw JSONL array for SDK) */
export async function loadSessionMessages(sessionId: string) {
  const db = getDrizzle()

  // Query raw content only (zero conversion)
  const rows = await db
    .select({ content: messagesJsonl.content })
    .from(messagesJsonl)
    .where(eq(messagesJsonl.sessionId, sessionId))
    .orderBy(messagesJsonl.lineNumber)

  // Return JSONL array directly to SDK
  return rows.map((r) => r.content)
}

/** Search messages by content (uses LIKE query, not in-memory filter) */
export async function searchMessages(sessionId: string, query: string) {
  const db = getDrizzle()

  return db
    .select()
    .from(messagesJsonl)
    .where(eq(messagesJsonl.sessionId, sessionId))
    .where(sql`content LIKE ${'%' + query + '%'}`)
}

/** Filter messages by tool name */
export async function getToolCalls(sessionId: string, toolName: string) {
  const db = getDrizzle()

  return db
    .select()
    .from(messagesJsonl)
    .where(eq(messagesJsonl.sessionId, sessionId))
    .where(eq(messagesJsonl.toolName, toolName))
    .orderBy(messagesJsonl.createdAt)
}

// Helper: Map SDK type → role (SDK's entryToRole logic)
function mapSdkTypeToRole(type: string): "user" | "assistant" | "system" | null {
  switch (type) {
    case "user":
      return "user"
    case "assistant":
      return "assistant"
    case "summary":
      return "system" // SDK maps summary → system
    case "system":
      return "system"
    default:
      return null // tool_progress, permission_request, etc. — not conversational
  }
}

// Helper: Extract tool name from SDK JSONL
function extractToolName(parsed: any): string | null {
  // Check for tool_use in message.content array
  if (parsed.message?.content && Array.isArray(parsed.message.content)) {
    const toolUse = parsed.message.content.find((part: any) => part.type === "tool_use")
    return toolUse?.name ?? null
  }
  return null
}