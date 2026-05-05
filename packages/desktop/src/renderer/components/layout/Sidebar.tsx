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
        "flex h-full flex-col shrink-0 border-r border-zinc-800 bg-[#0c0c0d] transition-all duration-300 ease-in-out relative",
        sidebarCollapsed ? "w-[52px]" : "w-[240px]"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center mt-1", sidebarCollapsed ? "flex-col gap-1 px-1 py-2" : "h-14 justify-between px-3")}>
        {!sidebarCollapsed && <Logo collapsed={false} />}
        <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-0.5" : "gap-0.5")}>
          {sidebarCollapsed && (
            <button onClick={toggleSidebar} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Expand sidebar">
              <PanelLeft className="h-4 w-4" />
            </button>
          )}
          <button className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="New Chat">
            <Plus className="h-4 w-4" />
          </button>
          {!sidebarCollapsed && (
            <button onClick={toggleSidebar} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors" title="Collapse sidebar">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800/60 mx-2 mb-1" />

      {/* Chat Cards */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-1 space-y-px">
        {MOCK_CHATS.map(chat => {
          const isActive = chat.id === activeChatId
          return (
            <div
              key={chat.id}
              onClick={() => { setActiveChatId(chat.id); navigate("/") }}
              className={cn(
                "flex w-full items-center rounded-md transition-all duration-150 cursor-pointer group relative",
                sidebarCollapsed ? "justify-center py-2 mx-auto" : "px-2 py-1.5",
                isActive
                  ? (sidebarCollapsed ? "bg-zinc-800" : "bg-zinc-100/[0.06]")
                  : "hover:bg-zinc-100/[0.03]"
              )}
            >
              {sidebarCollapsed ? (
                <div className={cn("h-6 w-6 rounded flex items-center justify-center", isActive ? "text-zinc-200" : "text-zinc-600 group-hover:text-zinc-400")}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
              ) : (
                <div className="flex-1 min-w-0">
                  <span className={cn("truncate block text-[13px]", isActive ? "text-zinc-100 font-medium" : "text-zinc-500 group-hover:text-zinc-300")}>
                    {chat.name}
                  </span>
                  <span className="text-[10px] truncate text-zinc-700 block mt-0.5 font-mono">
                    {chat.path}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-1.5 pb-3 pt-2 border-t border-zinc-800/60 mt-1">
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
