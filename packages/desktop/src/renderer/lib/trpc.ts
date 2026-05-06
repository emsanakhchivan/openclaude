import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../main/ipc"

/** React hooks for tRPC */
export const trpc = createTRPCReact<AppRouter>()
