import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sessions } from "./sessions"

/**
 * Hybrid message storage - SDK-compatible JSONL format
 *
 * Why hybrid approach:
 * - SDK uses JSONL + parentUuid tree structure for conversations
 * - Relational tables break forkSession support + add conversion overhead
 * - Hybrid preserves SDK format (content = raw JSONL) + metadata for queries
 *
 * Workflow:
 * - Save: append JSONL line + extract metadata → single insert
 * - Load: read content → return JSONL array to SDK (zero conversion)
 * - Search: query metadata indexes → fast results
 * - Fork: copy JSONL lines → remap UUIDs → insert new session
 */
export const messagesJsonl = sqliteTable("messages_jsonl", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  lineNumber: integer("line_number").notNull(), // Order in JSONL file
  content: text("content").notNull(), // RAW SDK JSONL line - never modify

  // Extracted metadata for indexed queries
  uuid: text("uuid").notNull(), // Message UUID for lookup
  parentUuid: text("parent_uuid"), // Tree structure (null = root)
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  toolName: text("tool_name"), // Extracted if tool_use present (null for text)
})