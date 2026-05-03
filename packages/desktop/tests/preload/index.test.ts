import { describe, it, expect, vi } from "vitest"

// Mock Electron contextBridge and trpc-electron
const exposed: Record<string, unknown> = {}

vi.mock("electron", () => ({
  contextBridge: {
    exposeInMainWorld: (key: string, value: unknown) => {
      exposed[key] = value
    },
  },
}))

vi.mock("trpc-electron/main", () => ({
  exposeElectronTRPC: vi.fn(),
}))

describe("Preload", () => {
  it("calls exposeElectronTRPC", async () => {
    const { exposeElectronTRPC } = await import("trpc-electron/main")
    await import("../../src/preload/index")
    expect(exposeElectronTRPC).toHaveBeenCalled()
  })

  it("exposes platform info", async () => {
    await import("../../src/preload/index")
    expect(exposed.platform).toBeDefined()
    expect((exposed.platform as { os: string }).os).toBe(process.platform)
    expect((exposed.platform as { arch: string }).arch).toBe(process.arch)
  })

  it("does not expose Node.js APIs directly", async () => {
    await import("../../src/preload/index")
    const keys = Object.keys(exposed)
    expect(keys).toEqual(["platform"])
    expect(keys).not.toContain("fs")
    expect(keys).not.toContain("path")
    expect(keys).not.toContain("process")
  })
})