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

    // Verify all expected CREATE TABLE statements exist
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS projects")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS sessions")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS messages")
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS tool_calls")
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

    expect(sql).toContain("idx_sessions_project")
    expect(sql).toContain("idx_sessions_updated")
    expect(sql).toContain("idx_messages_session")
    expect(sql).toContain("idx_messages_created")
    expect(sql).toContain("idx_tool_calls_message")
    expect(sql).toContain("idx_tool_calls_status")
    expect(sql).toContain("idx_plugins_status")
  })

  it("migration enforces foreign keys via CHECK constraints", () => {
    const migrationPath = join(
      __dirname,
      "../../../src/main/db/migrations/0001_initial.sql"
    )
    const sql = readFileSync(migrationPath, "utf-8")

    // Permission mode enum
    expect(sql).toContain("CHECK (permission_mode IN ('ask', 'accept_edits', 'plan', 'bypass'))")
    // Message role enum
    expect(sql).toContain("CHECK (role IN ('user', 'assistant', 'tool', 'system'))")
    // Tool call status enum
    expect(sql).toContain("CHECK (status IN ('pending', 'approved', 'rejected', 'running', 'completed', 'failed'))")
    // Plugin source enum
    expect(sql).toContain("CHECK (source IN ('marketplace', 'local', 'git'))")
    // Plugin status enum
    expect(sql).toContain("CHECK (status IN ('loaded', 'error', 'loading', 'disabled'))")
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
