import { useNavigate, useLocation } from "react-router"
import {
  MessageSquare,
  FolderOpen,
  Wrench,
  BarChart3,
  Code2,
  Settings,
} from "lucide-react"
import { Logo } from "../Logo"
import { SidebarItem } from "./SidebarItem"
import { Separator } from "../ui/separator"
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
        "flex h-full flex-col border-r border-border bg-background transition-all duration-200",
        sidebarCollapsed ? "w-[52px]" : "w-[240px]"
      )}
    >
      {/* Header with logo */}
      <div className="flex h-9 items-center gap-2 px-3">
        <Logo collapsed={sidebarCollapsed} />
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-1.5">
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

      <Separator />

      {/* Footer */}
      <div className="p-1.5">
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
