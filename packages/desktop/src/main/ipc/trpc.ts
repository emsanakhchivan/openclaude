import { initTRPC } from "@trpc/server"
import type { BrowserWindow } from "electron"
import superjson from "superjson"

/** Context passed to all tRPC procedures */
export interface Context {
  getWindow: () => BrowserWindow | null
}

/** Initialize tRPC */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    }
  },
})

export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware