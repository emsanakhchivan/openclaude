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

  const isLoading = version.isLoading || platform.isLoading
  const hasError = version.error || platform.error

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>OpenClaude Desktop</h1>
        {version.data && (
          <span className="version">v{version.data.version}</span>
        )}
      </header>
      <main className="app-main">
        {hasError ? (
          <div className="error-state">
            <p>Connection failed</p>
            <p className="error-detail">
              {version.error?.message || platform.error?.message || "Unknown error"}
            </p>
            <button
              className="retry-btn"
              onClick={() => {
                version.refetch()
                platform.refetch()
              }}
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <p>Loading...</p>
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
