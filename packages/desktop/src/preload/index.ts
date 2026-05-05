import { contextBridge, ipcRenderer } from "electron"
import { exposeElectronTRPC } from "trpc-electron/main"

// Expose tRPC IPC bridge for type-safe communication
exposeElectronTRPC()

// Expose platform info for initial load (before tRPC connects)
contextBridge.exposeInMainWorld("platform", {
  os: process.platform,
  arch: process.arch,
})

// Expose window control methods
contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
})