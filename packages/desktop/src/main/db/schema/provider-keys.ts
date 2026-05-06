import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const providerKeys = sqliteTable("provider_keys", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull().unique(),
  encryptedKey: text("encrypted_key").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
})
