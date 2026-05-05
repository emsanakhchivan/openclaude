import { describe, it, expect } from "vitest"
import {
  projects,
  sessions,
  messages,
  toolCalls,
  settings,
  mcpServers,
  providerKeys,
  plugins,
} from "../../../src/main/db/schema"

describe("Database Schema", () => {
  it("exports all 8 tables", () => {
    expect(projects).toBeDefined()
    expect(sessions).toBeDefined()
    expect(messages).toBeDefined()
    expect(toolCalls).toBeDefined()
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
  })

  it("messages table has required columns", () => {
    const columns = Object.keys(messages)
    expect(columns).toContain("id")
    expect(columns).toContain("sessionId")
    expect(columns).toContain("role")
    expect(columns).toContain("content")
    expect(columns).toContain("metadata")
    expect(columns).toContain("tokenCount")
    expect(columns).toContain("createdAt")
  })

  it("toolCalls table has required columns", () => {
    const columns = Object.keys(toolCalls)
    expect(columns).toContain("id")
    expect(columns).toContain("messageId")
    expect(columns).toContain("toolName")
    expect(columns).toContain("input")
    expect(columns).toContain("output")
    expect(columns).toContain("status")
    expect(columns).toContain("createdAt")
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
