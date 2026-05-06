import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull().unique(),
  gitBranch: text("git_branch"),
  gitRemoteUrl: text("git_remote_url"),
  gitProvider: text("git_provider", { enum: ["github", "gitlab", "bitbucket"] }),
  gitOwner: text("git_owner"),
  gitRepo: text("git_repo"),
  lastOpenedAt: integer("last_opened_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
