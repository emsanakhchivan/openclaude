import { getDrizzle } from "./client"
import { projects, sessions, messagesJsonl } from "./schema"
import { eq, desc, isNull } from "drizzle-orm"

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
 */
export async function saveMessage(sessionId: string, jsonlLine: string) {
  const db = getDrizzle()

  // Parse minimal metadata (don't modify structure)
  const parsed = JSON.parse(jsonlLine)
  const lineNumber = await getNextLineNumber(sessionId)

  // Extract metadata for indexing
  const metadata = {
    uuid: parsed.uuid,
    parentUuid: parsed.parentUuid ?? null,
    role: parsed.type,
    createdAt: new Date(parsed.timestamp ?? Date.now()),
    toolName: extractToolName(parsed),
  }

  // Insert raw JSONL + metadata
  return db.insert(messagesJsonl).values({
    sessionId,
    lineNumber,
    content: jsonlLine, // RAW - untouched
    ...metadata,
  })
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

/** Search messages by content (uses metadata indexes) */
export async function searchMessages(sessionId: string, query: string) {
  const db = getDrizzle()

  // Query metadata + content
  const rows = await db
    .select()
    .from(messagesJsonl)
    .where(eq(messagesJsonl.sessionId, sessionId))

  // Filter by query (full-text search in content)
  return rows.filter((r) => r.content.includes(query))
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

// Helper: Get next line number for session
async function getNextLineNumber(sessionId: string): Promise<number> {
  const db = getDrizzle()
  const last = await db
    .select({ lineNumber: messagesJsonl.lineNumber })
    .from(messagesJsonl)
    .where(eq(messagesJsonl.sessionId, sessionId))
    .orderBy(desc(messagesJsonl.lineNumber))
    .limit(1)
    .get()

  return last ? last.lineNumber + 1 : 1
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