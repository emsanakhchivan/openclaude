import { contextBridge } from "electron"
import { exposeElectronTRPC } from "trpc-electron/main"

// Expose tRPC IPC bridge for type-safe communication
exposeElectronTRPC()

// Expose platform info for initial load (before tRPC connects)
contextBridge.exposeInMainWorld("platform", {
  os: process.platform,
  arch: process.arch,
})