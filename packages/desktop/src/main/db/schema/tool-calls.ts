import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { messages } from "./messages"

export const toolCalls = sqliteTable("tool_calls", {
  id: text("id").primaryKey(),
  messageId: text("message_id")
    .notNull()
    .references(() => messages.id),
  toolName: text("tool_name").notNull(),
  input: text("input", { mode: "json" }),
  output: text("output", { mode: "json" }),
  status: text("status", {
    enum: ["pending", "approved", "rejected", "running", "completed", "failed"],
  })
    .notNull()
    .default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
