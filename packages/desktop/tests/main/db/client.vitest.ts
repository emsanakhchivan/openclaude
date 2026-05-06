import { describe, it, expect } from "vitest"
import { readFileSync } from "fs"
import { join } from "path"

describe("Database Client", () => {
  it("initial migration file is valid SQL", () => {
    const migrationPath = join(
      __dirname,
      "../../../src/main/db/migrations/0001_initial.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    // Verify all expected CREATE TABLE statements exist (messages_jsonl hybrid)
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS projects")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS sessions")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS messages_jsonl") // Hybrid storage
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS settings")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS mcp_servers")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS provider_keys")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS plugins")
  })

  it("migration creates indexes for common queries", () => {
    const migrationPath = join(
      __dirname,
      "../../../src/main/db/migrations/0001_initial.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    // Sessions indexes
    expect(sql).toContain("idx_sessions_project")
    expect(sql).toContain("idx_sessions_updated")
    expect(sql).toContain("idx_sessions_provider")

    // messages_jsonl indexes (metadata columns)
    expect(sql).toContain("idx_messages_session")
    expect(sql).toContain("idx_messages_role")
    expect(sql).toContain("idx_messages_time")
    expect(sql).toContain("idx_messages_tool")
    expect(sql).toContain("idx_messages_uuid")

    // Other indexes
    expect(sql).toContain("idx_mcp_servers_status")
    expect(sql).toContain("idx_plugins_status")
    expect(sql).toContain("idx_provider_keys_provider")
  })

  it("migration enforces enums via CHECK constraints", () => {
    const migrationPath = join(
      __dirname,
      "../../../src/main/db/migrations/0001_initial.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    // Permission mode enum
    expect(sql).toContain("CHECK (permission_mode IN ('ask', 'accept_edits', 'plan', 'bypass'))")
    // Message role enum (messages_jsonl)
    expect(sql).toContain("CHECK (role IN ('user', 'assistant', 'tool', 'system'))")
    // MCP server status enum
    expect(sql).toContain("CHECK (status IN ('stopped', 'running', 'error', 'starting'))")
    // Plugin source enum
    expect(sql).toContain("CHECK (source IN ('marketplace', 'local', 'git'))")
    // Plugin status enum
    expect(sql).toContain("CHECK (status IN ('loaded', 'error', 'loading', 'disabled'))")
  })

  it("messages_jsonl has hybrid storage columns", () => {
    const migrationPath = join(
      __dirname,
      "../../../src/main/db/migrations/0001_initial.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    // Hybrid columns: raw content + metadata
    expect(sql).toContain("content TEXT NOT NULL") // RAW JSONL
    expect(sql).toContain("line_number INTEGER NOT NULL") // Order
    expect(sql).toContain("uuid TEXT NOT NULL") // Metadata
    expect(sql).toContain("parent_uuid TEXT") // Tree structure
    expect(sql).toContain("tool_name TEXT") // Extracted if tool_use
  })

  it("sessions has archived_at for soft delete", () => {
    const migrationPath = join(
      __dirname,
      "../../../src/main/db/migrations/0001_initial.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    expect(sql).toContain("archived_at INTEGER") // Soft delete column
  })

  it("client module exports initDb, getDb, closeDb", async () => {
    const client = await import("../../../src/main/db/client")
    expect(client.initDb).toBeDefined()
    expect(client.getDb).toBeDefined()
    expect(client.closeDb).toBeDefined()
    expect(typeof client.initDb).toBe("function")
    expect(typeof client.getDb).toBe("function")
    expect(typeof client.closeDb).toBe("function")
  })
})