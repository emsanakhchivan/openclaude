import { Outlet } from "react-router"
import { Sidebar } from "./Sidebar"
import { Minus, Square, X } from "lucide-react"

// Access window controls exposed via preload
const wc = (window as any).windowControls as {
  minimize: () => void
  maximize: () => void
  close: () => void
} | undefined

function WindowControls() {
  return (
    <div className="flex items-center h-8 shrink-0 select-none"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
      <button onClick={() => wc?.minimize()}
        className="h-8 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors">
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <button onClick={() => wc?.maximize()}
        className="h-8 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700/50 transition-colors">
        <Square className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <button onClick={() => wc?.close()}
        className="h-8 w-11 flex items-center justify-center text-zinc-500 hover:text-zinc-200 hover:bg-red-600/80 transition-colors">
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function AppShell() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#09090b] text-zinc-100">
      {/* Custom Title Bar — draggable */}
      <div className="flex items-center justify-end h-8 shrink-0 bg-[#09090b] border-b border-zinc-800/50"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        <WindowControls />
      </div>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto relative bg-[#09090b]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
