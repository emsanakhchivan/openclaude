import { app, BrowserWindow, shell } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import { createIPCHandler } from "trpc-electron/main"
import { createAppRouter } from "./ipc"

let mainWindow: BrowserWindow | null = null

function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: "OpenClaude Desktop",
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: "deny" }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
  }

  return mainWindow
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("dev.openclaude.desktop")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create window first
  const win = createWindow()

  // Initialize tRPC IPC handler after window creation
  if (win) {
    const appRouter = createAppRouter()
    createIPCHandler({
      router: appRouter,
      windows: [win],
    })
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow()
      if (newWin) {
        createIPCHandler({
          router: createAppRouter(),
          windows: [newWin],
        })
      }
    }
  })
})

/** Get the main window for tRPC context (exported for ipc module) */
export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})