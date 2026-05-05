import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const plugins = sqliteTable("plugins", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  source: text("source", { enum: ["marketplace", "local", "git"] }).notNull(),
  path: text("path").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  status: text("status", { enum: ["loaded", "error", "loading", "disabled"] })
    .notNull()
    .default("loading"),
  manifest: text("manifest", { mode: "json" }),
  installedAt: integer("installed_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastError: text("last_error"),
})
