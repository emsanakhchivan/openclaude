import { describe, it, expect, vi, beforeEach } from "vitest"

const exposed: Record<string, unknown> = {}

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: (key: string, value: unknown) => {
      exposed[key] = value
    },
  },
}))

const mockExposeTRPC = vi.fn()
vi.mock("trpc-electron/main", () => ({
  exposeElectronTRPC: (...args: unknown[]) => mockExposeTRPC(...args),
}))

describe("Preload tRPC Bridge", () => {
  it("calls exposeElectronTRPC exactly once on import", async () => {
    await import("../../src/preload/index")
    expect(mockExposeTRPC).toHaveBeenCalled()
  })

  it("exposes platform info to main world", async () => {
    await import("../../src/preload/index")
    expect(exposed.platform).toBeDefined()
    const platform = exposed.platform as Record<string, string>
    expect(platform).toHaveProperty("os")
    expect(platform).toHaveProperty("arch")
  })

  it("does not expose Node.js APIs directly", async () => {
    await import("../../src/preload/index")
    const keys = Object.keys(exposed)
    expect(keys).toContain("platform")
    expect(keys).not.toContain("fs")
    expect(keys).not.toContain("path")
    expect(keys).not.toContain("process")
  })
})
