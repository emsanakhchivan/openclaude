import { describe, it, expect } from "vitest"
import {
  projects,
  sessions,
  messagesJsonl,
  settings,
  mcpServers,
  providerKeys,
  plugins,
} from "../../../src/main/db/schema"

describe("Database Schema", () => {
  it("exports all 7 tables (messages + tool_calls merged into messages_jsonl)", () => {
    expect(projects).toBeDefined()
    expect(sessions).toBeDefined()
    expect(messagesJsonl).toBeDefined() // Hybrid storage
    expect(settings).toBeDefined()
    expect(mcpServers).toBeDefined()
    expect(providerKeys).toBeDefined()
    expect(plugins).toBeDefined()
  })

  it("projects table has required columns", () => {
    const columns = Object.keys(projects)
    expect(columns).toContain("id")
    expect(columns).toContain("name")
    expect(columns).toContain("path")
    expect(columns).toContain("gitBranch")
    expect(columns).toContain("lastOpenedAt")
    expect(columns).toContain("createdAt")
  })

  it("sessions table has required columns", () => {
    const columns = Object.keys(sessions)
    expect(columns).toContain("id")
    expect(columns).toContain("projectId")
    expect(columns).toContain("title")
    expect(columns).toContain("provider")
    expect(columns).toContain("model")
    expect(columns).toContain("permissionMode")
    expect(columns).toContain("createdAt")
    expect(columns).toContain("updatedAt")
    expect(columns).toContain("archivedAt") // Soft delete column added
  })

  it("messages_jsonl table has hybrid storage columns", () => {
    const columns = Object.keys(messagesJsonl)
    expect(columns).toContain("id")
    expect(columns).toContain("sessionId")
    expect(columns).toContain("lineNumber") // Order in file
    expect(columns).toContain("content") // RAW JSONL (untouched)
    expect(columns).toContain("uuid") // Extracted metadata
    expect(columns).toContain("parentUuid") // Tree structure
    expect(columns).toContain("role")
    expect(columns).toContain("createdAt")
    expect(columns).toContain("toolName") // Extracted if tool_use
  })

  it("settings table has key-value structure", () => {
    const columns = Object.keys(settings)
    expect(columns).toContain("key")
    expect(columns).toContain("value")
    expect(columns).toContain("updatedAt")
  })

  it("mcpServers table has required columns", () => {
    const columns = Object.keys(mcpServers)
    expect(columns).toContain("id")
    expect(columns).toContain("name")
    expect(columns).toContain("command")
    expect(columns).toContain("args")
    expect(columns).toContain("env")
    expect(columns).toContain("status")
  })

  it("plugins table has required columns", () => {
    const columns = Object.keys(plugins)
    expect(columns).toContain("id")
    expect(columns).toContain("name")
    expect(columns).toContain("version")
    expect(columns).toContain("source")
    expect(columns).toContain("enabled")
    expect(columns).toContain("status")
    expect(columns).toContain("manifest")
    expect(columns).toContain("lastError")
  })
})