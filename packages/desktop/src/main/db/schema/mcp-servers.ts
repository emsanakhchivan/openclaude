import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const mcpServers = sqliteTable("mcp_servers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  command: text("command").notNull(),
  args: text("args", { mode: "json" }),
  env: text("env", { mode: "json" }),
  status: text("status", { enum: ["stopped", "running", "error", "starting"] }).notNull().default("stopped"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
