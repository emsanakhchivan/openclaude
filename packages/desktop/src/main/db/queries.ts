import { getDrizzle } from "./client"
import { projects, sessions, messages } from "./schema"
import { eq, desc } from "drizzle-orm"

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

/** Get recent sessions for a project, ordered by update time (most recent first) */
export async function getRecentSessions(projectId: string, limit = 10) {
  const db = getDrizzle()

  return db
    .select()
    .from(sessions)
    .where(eq(sessions.projectId, projectId))
    .orderBy(desc(sessions.updatedAt))
    .limit(limit)
}