import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { projects } from "./projects"

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title"),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  permissionMode: text("permission_mode", { enum: ["ask", "accept_edits", "plan", "bypass"] })
    .notNull()
    .default("ask"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
