import { router } from "./trpc"
import { appRouter } from "./routers/app"

export function createAppRouter() {
  return router({
    app: appRouter,
  })
}

export type AppRouter = ReturnType<typeof createAppRouter>