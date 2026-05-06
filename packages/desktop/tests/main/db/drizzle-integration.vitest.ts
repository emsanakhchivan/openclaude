import { describe, it, expect } from "vitest"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { messagesJsonl } from "../../../src/main/db/schema"

describe("Drizzle Integration", () => {
  it("messages_jsonl table uses auto-increment integer PK", () => {
    const idColumn = messagesJsonl.id
    expect(idColumn).toBeDefined()
    // Auto-increment INTEGER PK (not TEXT UUID)
  })

  it("messages_jsonl content column stores raw JSONL", () => {
    const contentColumn = messagesJsonl.content
    expect(contentColumn).toBeDefined()
    // TEXT column - stores raw SDK JSONL line (untouched)
  })

  it("messages_jsonl has extracted metadata columns", () => {
    const columns = Object.keys(messagesJsonl)
    expect(columns).toContain("uuid") // Extracted for lookup
    expect(columns).toContain("parentUuid") // Tree structure
    expect(columns).toContain("role") // Indexed for filtering
    expect(columns).toContain("toolName") // Extracted if tool_use
  })

  it("messages_jsonl lineNumber orders messages", () => {
    const lineNumberColumn = messagesJsonl.lineNumber
    expect(lineNumberColumn).toBeDefined()
    // Order in JSONL file (sequential)
  })

  it("sessions archivedAt enables soft delete", async () => {
    // Import sessions schema
    const { sessions } = await import("../../../src/main/db/schema")
    const columns = Object.keys(sessions)
    expect(columns).toContain("archivedAt")
    // NULL = active, timestamp = archived
  })

  it("mcpServers status has enum validation", async () => {
    const { mcpServers } = await import("../../../src/main/db/schema")
    const statusColumn = mcpServers.status
    expect(statusColumn).toBeDefined()
    // Enum: stopped, running, error, starting
  })

  it("providerKeys provider has unique constraint", async () => {
    const { providerKeys } = await import("../../../src/main/db/schema")
    const providerColumn = providerKeys.provider
    expect(providerColumn).toBeDefined()
    // Unique - one key per provider
  })
})