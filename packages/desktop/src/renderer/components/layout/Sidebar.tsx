import { useState } from "react"
import { useNavigate, useLocation } from "react-router"
import {
  MessageSquare,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Plus,
} from "lucide-react"
import { Logo } from "../Logo"
import { SidebarItem } from "./SidebarItem"
import { useAppStore } from "../../stores/app"
import { cn } from "../../lib/utils"

const MOCK_CHATS = [
  { id: "1", name: "E-Commerce Checkout", path: "~/dev/shopstream/frontend" },
  { id: "2", name: "ML Pipeline Refactor", path: "~/dev/neural-forge/training" },
  { id: "3", name: "Auth Microservice", path: "~/dev/vaultguard/services/auth" },
  { id: "4", name: "Dashboard Charts", path: "~/dev/dataflux/packages/ui" },
  { id: "5", name: "Kubernetes Deploy", path: "~/dev/cloudweave/infra/k8s" },
  { id: "6", name: "Mobile App Sync", path: "~/dev/syncpulse/mobile" },
]

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const [activeChatId, setActiveChatId] = useState("1")

  const currentPath = location.pathname

  return (
    <aside
      className={cn(
        "flex h-full flex-col shrink-0 border-r border-[var(--color-line)] bg-sidebar transition-all duration-300 ease-in-out relative",
        sidebarCollapsed ? "w-[52px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center mt-1", sidebarCollapsed ? "flex-col gap-1 px-1 py-2" : "h-14 justify-between px-3")}>
        {!sidebarCollapsed && <Logo collapsed={false} />}
        <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-0.5" : "gap-0.5")}>
          {sidebarCollapsed && (
            <button onClick={toggleSidebar} className="p-1.5 text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-sidebar-hover)] transition-colors" title="Expand sidebar">
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          <button className="p-1.5 text-[var(--color-quiet)] hover:text-[var(--color-accent)] hover:bg-[var(--color-sidebar-hover)] transition-colors" title="New Chat">
            <Plus className="h-4 w-4" />
          </button>
          {!sidebarCollapsed && (
            <button onClick={toggleSidebar} className="p-1.5 text-[var(--color-quiet)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-sidebar-hover)] transition-colors" title="Collapse sidebar">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Divider — dashed website style */}
      <div className="divider-dashed mx-2 mb-1" />

      {/* Chat Cards */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-1 space-y-px">
        {MOCK_CHATS.map(chat => {
          const isActive = chat.id === activeChatId
          return (
            <div
              key={chat.id}
              onClick={() => { setActiveChatId(chat.id); navigate("/") }}
              className={cn(
                "flex w-full items-center transition-all duration-150 cursor-pointer group relative",
                sidebarCollapsed ? "justify-center py-2 mx-auto" : "px-2 py-1.5",
                isActive
                  ? "bg-[var(--color-muted)] text-[var(--color-sidebar-active)]"
                  : "hover:bg-[var(--color-sidebar-hover)] text-[var(--color-sidebar-foreground)]"
              )}
            >
              {sidebarCollapsed ? (
                <div className={cn("h-6 w-6 flex items-center justify-center", isActive ? "text-[var(--color-foreground)]" : "text-[var(--color-quiet)] group-hover:text-[var(--color-muted-foreground)]")}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <span className={cn("truncate block text-[13px]", isActive ? "text-[var(--color-foreground)] font-medium" : "text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]")}>
                    {chat.name}
                  </span>
                  <span className="text-[10px] truncate text-[var(--color-quiet)] block mt-0.5">
                    {chat.path}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-1.5 pb-3 pt-2 divider-dashed mt-1">
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
