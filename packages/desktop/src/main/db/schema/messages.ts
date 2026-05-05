import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sessions } from "./sessions"

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id),
  role: text("role", { enum: ["user", "assistant", "tool", "system"] }).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata", { mode: "json" }),
  tokenCount: integer("token_count"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
