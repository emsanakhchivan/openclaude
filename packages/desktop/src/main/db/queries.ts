import { getDrizzle } from "./client"
import { projects, sessions, messages } from "./schema"
import { eq, desc, isNull } from "drizzle-orm"

/**
 * Query helpers for common database operations
 * These provide typed, reusable functions for Drizzle queries
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

/** Get all messages for a session, ordered by creation time */
export async function getSessionMessages(sessionId: string) {
  const db = getDrizzle()

  return db
    .select()
    .from(messages)
    .where(eq(messages.sessionId, sessionId))
    .orderBy(messages.createdAt)
}

/** Get a project by its path (unique constraint) */
export async function getProjectByPath(path: string) {
  const db = getDrizzle()

  return db.select().from(projects).where(eq(projects.path, path)).get()
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