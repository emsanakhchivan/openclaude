import { relations } from "drizzle-orm"
import { projects } from "./projects"
import { sessions } from "./sessions"
import { messages } from "./messages"
import { toolCalls } from "./tool-calls"

export const projectsRelations = relations(projects, ({ many }) => ({
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  project: one(projects, {
    fields: [sessions.projectId],
    references: [projects.id],
  }),
  messages: many(messages),
}))

export const messagesRelations = relations(messages, ({ one, many }) => ({
  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),
  toolCalls: many(toolCalls),
}))

export const toolCallsRelations = relations(toolCalls, ({ one }) => ({
  message: one(messages, {
    fields: [toolCalls.messageId],
    references: [messages.id],
  }),
}))
