import { relations } from "drizzle-orm"
import { projects } from "./projects"
import { sessions } from "./sessions"
import { messagesJsonl } from "./messages"

export const projectsRelations = relations(projects, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  project: one(projects, {
    fields: [sessions.projectId],
    references: [projects.id],
  }),
  messages: many(messagesJsonl),
}))

export const messagesJsonlRelations = relations(messagesJsonl, ({ one }) => ({
  session: one(sessions, {
    fields: [messagesJsonl.sessionId],
    references: [sessions.id],
  }),
}))