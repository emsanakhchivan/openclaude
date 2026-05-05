import { useNavigate, useLocation } from "react-router"
import {
  MessageSquare,
  FolderOpen,
  Wrench,
  BarChart3,
  Code2,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { Logo } from "../Logo"
import { SidebarItem } from "./SidebarItem"
import { useAppStore } from "../../stores/app"
import { cn } from "../../lib/utils"

const NAV_ITEMS = [
  { icon: MessageSquare, label: "Chat", path: "/" },
  { icon: FolderOpen, label: "Projects", path: "/projects" },
  { icon: Wrench, label: "MCP", path: "/mcp" },
  { icon: BarChart3, label: "Stats", path: "/stats" },
  { icon: Code2, label: "Editor", path: "/editor" },
] as const

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()

  const currentPath = location.pathname

  return (
    <aside
      className={cn(
        "flex h-full flex-col shrink-0 border-r border-zinc-800 bg-zinc-950 transition-all duration-200",
        sidebarCollapsed ? "w-[52px]" : "w-[240px]"
      )}
    >
      {/* Logo header */}
      <div className="flex h-12 items-center justify-between px-3">
        <Logo collapsed={sidebarCollapsed} />
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800 mx-2" />

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            active={currentPath === item.path}
            collapsed={sidebarCollapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-zinc-800 mx-2" />

      {/* Footer */}
      <div className="p-2">
        <SidebarItem
          icon={Settings}
          label="Settings"
          active={currentPath === "/settings"}
          collapsed={sidebarCollapsed}
          onClick={() => navigate("/settings")}
        />
      </div>
    </aside>
  )
}
