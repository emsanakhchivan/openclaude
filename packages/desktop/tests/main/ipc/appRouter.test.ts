import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock Electron APIs
const mockWindow = {
  minimize: vi.fn(),
  maximize: vi.fn(),
  unmaximize: vi.fn(),
  close: vi.fn(),
  isMaximized: vi.fn(() => false),
}

vi.mock("electron", () => ({
  app: {
    getVersion: vi.fn(() => "0.1.0"),
    isPackaged: false,
  },
}))

// Import router after mocks
import { appRouter } from "../../../src/main/ipc/routers/app"

describe("App Router", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getVersion", () => {
    it("returns app version and name", async () => {
      const caller = appRouter.createCaller({ getWindow: () => null })
      const result = await caller.getVersion()
      expect(result.version).toBe("0.1.0")
      expect(result.name).toBe("OpenClaude Desktop")
    })
  })

  describe("getPlatform", () => {
    it("returns platform info", async () => {
      const caller = appRouter.createCaller({ getWindow: () => null })
      const result = await caller.getPlatform()
      expect(result.os).toBe(process.platform)
      expect(result.arch).toBe(process.arch)
      expect(result.isPackaged).toBe(false)
    })
  })

  describe("window controls", () => {
    it("windowMinimize calls window.minimize", async () => {
      const caller = appRouter.createCaller({ getWindow: () => mockWindow as any })
      await caller.windowMinimize()
      expect(mockWindow.minimize).toHaveBeenCalled()
    })

    it("windowMaximize toggles maximize state", async () => {
      mockWindow.isMaximized.mockReturnValue(false)
      const caller = appRouter.createCaller({ getWindow: () => mockWindow as any })
      await caller.windowMaximize()
      expect(mockWindow.maximize).toHaveBeenCalled()

      // Test unmaximize when already maximized
      mockWindow.isMaximized.mockReturnValue(true)
      await caller.windowMaximize()
      expect(mockWindow.unmaximize).toHaveBeenCalled()
    })

    it("windowClose calls window.close", async () => {
      const caller = appRouter.createCaller({ getWindow: () => mockWindow as any })
      await caller.windowClose()
      expect(mockWindow.close).toHaveBeenCalled()
    })

    it("windowIsMaximized returns correct state", async () => {
      mockWindow.isMaximized.mockReturnValue(true)
      const caller = appRouter.createCaller({ getWindow: () => mockWindow as any })
      const result = await caller.windowIsMaximized()
      expect(result).toBe(true)

      mockWindow.isMaximized.mockReturnValue(false)
      const result2 = await caller.windowIsMaximized()
      expect(result2).toBe(false)
    })
  })
})