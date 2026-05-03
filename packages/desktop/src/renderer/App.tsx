import { TRPCProvider } from "./contexts/TRPCProvider"
import { trpc } from "./lib/trpc"
import "./styles/globals.css"

export function App() {
  return (
    <TRPCProvider>
      <AppShell />
    </TRPCProvider>
  )
}

function AppShell() {
  const version = trpc.app.getVersion.useQuery()
  const platform = trpc.app.getPlatform.useQuery()

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>OpenClaude Desktop</h1>
        {version.data && (
          <span className="version">v{version.data.version}</span>
        )}
      </header>
      <main className="app-main">
        {version.isLoading || platform.isLoading ? (
          <p>Connecting...</p>
        ) : (
          <div className="connected">
            <p>tRPC connected</p>
            {platform.data && (
              <p className="platform-info">
                {platform.data.os} {platform.data.arch}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}