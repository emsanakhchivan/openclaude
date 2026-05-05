import { Outlet } from "react-router"
import { Sidebar } from "./Sidebar"
import { Minus, Square, X, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"

// Access window controls exposed via preload
const wc = (window as any).windowControls as {
  minimize: () => void
  maximize: () => void
  close: () => void
} | undefined

function getTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light"
  const t = document.documentElement.dataset.theme
  return t === "dark" ? "dark" : "light"
}

function setTheme(theme: "light" | "dark") {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  localStorage.setItem("openclaude-theme", theme)
}

function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">(getTheme)

  useEffect(() => {
    setThemeState(getTheme())
  }, [])

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    setThemeState(next)
  }

  return (
    <button
      onClick={toggle}
      className="h-8 w-8 flex items-center justify-center text-[var(--color-quiet)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] border border-[var(--color-line)] transition-colors text-xs"
      title={theme === "light" ? "Switch to dark" : "Switch to light"}
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      {theme === "light" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
    </button>
  )
}

function WindowControls() {
  return (
    <div className="flex items-center h-8 shrink-0 select-none"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
      <button onClick={() => wc?.minimize()}
        className="h-8 w-11 flex items-center justify-center text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-titlebar-btn-hover)] transition-colors">
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <button onClick={() => wc?.maximize()}
        className="h-8 w-11 flex items-center justify-center text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-titlebar-btn-hover)] transition-colors">
        <Square className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <button onClick={() => wc?.close()}
        className="h-8 w-11 flex items-center justify-center text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-titlebar-btn-close-hover)] transition-colors">
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}

export function AppShell() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Custom Title Bar — draggable, frosted glass */}
      <div className="flex items-center justify-between h-8 shrink-0 glass-panel border-b border-[var(--color-line)]"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}>
        <div className="flex items-center pl-3">
          <ThemeToggle />
        </div>
        <WindowControls />
      </div>
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto relative bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
