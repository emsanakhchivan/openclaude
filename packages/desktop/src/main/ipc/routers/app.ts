import { router, publicProcedure } from "../trpc"
import { app } from "electron"
import { getDb } from "../../db/client"

export const appRouter = router({
  /** Get app version */
  getVersion: publicProcedure.query(() => {
    return { version: app.getVersion(), name: "OpenClaude Desktop" }
  }),

  /** Get platform info */
  getPlatform: publicProcedure.query(() => {
    return {
      os: process.platform,
      arch: process.arch,
      isPackaged: app.isPackaged,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
    }
  }),

  /** Check database health */
  dbHealth: publicProcedure.query(() => {
    try {
      const db = getDb()
      const tables = db
        .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_%'")
        .all() as { name: string }[]
      return {
        ok: true,
        tableCount: tables.length,
        tables: tables.map((t) => t.name),
      }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        tableCount: 0,
        tables: [],
      }
    }
  }),

  /** Window controls */
  windowMinimize: publicProcedure.mutation(({ ctx }) => {
    ctx.getWindow()?.minimize()
  }),

  windowMaximize: publicProcedure.mutation(({ ctx }) => {
    const win = ctx.getWindow()
    if (!win) return
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }),

  windowClose: publicProcedure.mutation(({ ctx }) => {
    ctx.getWindow()?.close()
  }),

  windowIsMaximized: publicProcedure.query(({ ctx }) => {
    return ctx.getWindow()?.isMaximized() ?? false
  }),
})