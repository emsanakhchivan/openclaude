import { createTRPCReact } from "@trpc/react-query"
import { createTRPCProxyClient } from "@trpc/client"
import { ipcLink } from "trpc-electron/renderer"
import type { AppRouter } from "../../main/ipc"
import superjson from "superjson"

/** React hooks for tRPC */
export const trpc = createTRPCReact<AppRouter>()

/** Vanilla client for use outside React components */
export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [ipcLink({ transformer: superjson })],
})