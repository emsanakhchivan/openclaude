import { app, BrowserWindow, shell } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import { createIPCHandler } from "trpc-electron/main"
import { createAppRouter, createContext, setMainWindow } from "./ipc"

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
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
    mainWindow.show()
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

let ipcHandlerAttached = false
let ipcHandler: ReturnType<typeof createIPCHandler> | null = null

function attachIPCHandler(win: BrowserWindow): void {
  setMainWindow(win)
  if (!ipcHandlerAttached) {
    const appRouter = createAppRouter()
    ipcHandler = createIPCHandler({
      router: appRouter,
      createContext,
      windows: [win],
    })
    ipcHandlerAttached = true
  } else {
    ipcHandler?.attachWindow(win)
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("dev.openclaude.desktop")

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const win = createWindow()
  attachIPCHandler(win)

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWin = createWindow()
      attachIPCHandler(newWin)
    }
  })
}).catch((err) => {
  console.error("Failed to start app:", err)
  app.quit()
})

app.on("window-all-closed", () => {
  setMainWindow(null)
  if (process.platform !== "darwin") {
    app.quit()
  }
})
