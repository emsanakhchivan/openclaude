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
  exposeElectronTRPC: mockExposeTRPC,
}))

describe("Preload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(exposed)) {
      delete exposed[key]
    }
  })

  describe("tRPC Bridge", () => {
    it("calls exposeElectronTRPC exactly once on import", async () => {
      vi.resetModules()
      await import("../../src/preload/index")
      expect(mockExposeTRPC).toHaveBeenCalledTimes(1)
    })
  })

  describe("Platform Info", () => {
    it("exposes platform info to main world", async () => {
      vi.resetModules()
      await import("../../src/preload/index")
      expect(exposed.platform).toBeDefined()
      const platform = exposed.platform as Record<string, string>
      expect(platform).toHaveProperty("os")
      expect(platform).toHaveProperty("arch")
      expect(platform.os).toBe(process.platform)
      expect(platform.arch).toBe(process.arch)
    })
  })

  describe("Security", () => {
    it("does not expose Node.js APIs directly", async () => {
      vi.resetModules()
      await import("../../src/preload/index")
      const keys = Object.keys(exposed)
      expect(keys).toContain("platform")
      expect(keys).not.toContain("fs")
      expect(keys).not.toContain("path")
      expect(keys).not.toContain("process")
    })

    it("exposes only platform (minimal API surface)", async () => {
      vi.resetModules()
      await import("../../src/preload/index")
      const keys = Object.keys(exposed)
      // Only platform should be exposed - tRPC bridge is handled separately
      expect(keys.length).toBe(1)
      expect(keys[0]).toBe("platform")
    })
  })
})