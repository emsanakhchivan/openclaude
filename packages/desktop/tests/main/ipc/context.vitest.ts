import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("electron", () => ({
  app: {
    getVersion: vi.fn(() => "0.1.0"),
    isPackaged: false,
  },
}))

import { createContext, setMainWindow } from "../../../src/main/ipc/createContext"

describe("tRPC Context", () => {
  beforeEach(() => {
    setMainWindow(null)
  })

  it("returns null window when no window is set", async () => {
    const ctx = await createContext()
    expect(ctx.getWindow()).toBeNull()
  })

  it("returns window after setMainWindow is called", async () => {
    const mockWin = { minimize: vi.fn(), isDestroyed: vi.fn(() => false) } as any
    setMainWindow(mockWin)
    const ctx = await createContext()
    expect(ctx.getWindow()).toBe(mockWin)
  })

  it("returns null after window is cleared", async () => {
    const mockWin = { minimize: vi.fn(), isDestroyed: vi.fn(() => false) } as any
    setMainWindow(mockWin)
    setMainWindow(null)
    const ctx = await createContext()
    expect(ctx.getWindow()).toBeNull()
  })

  it("returns null when window is destroyed", async () => {
    const mockWin = { minimize: vi.fn(), isDestroyed: vi.fn(() => true) } as any
    setMainWindow(mockWin)
    const ctx = await createContext()
    expect(ctx.getWindow()).toBeNull()
  })

  it("procedures handle null window gracefully", async () => {
    const { appRouter } = await import("../../../src/main/ipc/routers/app")
    setMainWindow(null)
    const ctx = await createContext()
    const caller = appRouter.createCaller(ctx)

    // Queries should not throw
    const version = await caller.getVersion()
    expect(version.version).toBe("0.1.0")

    // Window mutations should not throw with null window
    await expect(caller.windowMinimize()).resolves.toBeUndefined()
    await expect(caller.windowMaximize()).resolves.toBeUndefined()
    await expect(caller.windowClose()).resolves.toBeUndefined()

    // windowIsMaximized returns false for null window
    const maximized = await caller.windowIsMaximized()
    expect(maximized).toBe(false)
  })
})
