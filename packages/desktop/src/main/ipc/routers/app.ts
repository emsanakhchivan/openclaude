import { router, publicProcedure } from "../trpc"
import { app } from "electron"
import { getDb } from "../../db/client"

/**
 * IPC Router: App endpoints
 *
 * IMPORTANT: Every CRUD endpoint must use zod input validation before database operations.
 * Never use raw string concatenation in queries - always use Drizzle's query builder.
 */

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
      // Just verify DB is responsive, don't expose internal schema
      db.prepare("SELECT 1").get()
      return { ok: true }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
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