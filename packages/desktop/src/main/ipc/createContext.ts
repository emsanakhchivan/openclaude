import type { BrowserWindow } from "electron"
import type { Context } from "./trpc"

let mainWindow: BrowserWindow | null = null

/** Set the window reference — called from main process */
export function setMainWindow(win: BrowserWindow | null): void {
  mainWindow = win
}

/** Create tRPC context for each request */
export async function createContext(_opts?: { event?: unknown }): Promise<Context> {
  return {
    getWindow: () => {
      if (mainWindow && !mainWindow.isDestroyed()) return mainWindow
      return null
    },
  }
}
