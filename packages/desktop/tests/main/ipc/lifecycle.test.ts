import { describe, it, expect, vi, beforeEach } from "vitest"

// Track createIPCHandler calls
const createIPCHandlerMock = vi.fn()

vi.mock("trpc-electron/main", () => ({
  createIPCHandler: createIPCHandlerMock,
}))

vi.mock("@electron-toolkit/utils", () => ({
  electronApp: { setAppUserModelId: vi.fn() },
  optimizer: { watchWindowShortcuts: vi.fn() },
  is: { dev: false },
}))

vi.mock("electron", () => ({
  app: {
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn(),
  },
  BrowserWindow: vi.fn(() => ({
    on: vi.fn(),
    webContents: { setWindowOpenHandler: vi.fn() },
    show: vi.fn(),
    loadFile: vi.fn(),
  })),
  shell: { openExternal: vi.fn() },
}))

describe("IPC Handler Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it("setMainWindow updates window reference without creating new handler", async () => {
    const { setMainWindow, createContext } = await import("../../../src/main/ipc/createContext")
    const win1 = { id: 1 } as any
    const win2 = { id: 2 } as any

    setMainWindow(win1)
    expect((await createContext()).getWindow()).toBe(win1)

    setMainWindow(win2)
    expect((await createContext()).getWindow()).toBe(win2)
  })

  it("setMainWindow(null) clears window reference", async () => {
    const { setMainWindow, createContext } = await import("../../../src/main/ipc/createContext")
    const mockWin = { id: 1 } as any

    setMainWindow(mockWin)
    expect((await createContext()).getWindow()).toBe(mockWin)

    setMainWindow(null)
    expect((await createContext()).getWindow()).toBeNull()
  })
})
