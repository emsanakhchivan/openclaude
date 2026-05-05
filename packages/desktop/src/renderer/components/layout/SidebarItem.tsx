import { cn } from "../../lib/utils"
import type { LucideIcon } from "lucide-react"

interface SidebarItemProps {
  icon: LucideIcon
  label: string
  active?: boolean
  collapsed?: boolean
  onClick?: () => void
}

export function SidebarItem({ icon: Icon, label, active, collapsed, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-[9px] text-[13px] font-medium transition-all duration-200 group relative overflow-hidden outline-none",
        active
          ? "bg-[var(--color-muted)] text-[var(--color-sidebar-active)]"
          : "text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-foreground)]",
        collapsed && "justify-center px-0"
      )}
      title={collapsed ? label : undefined}
    >
      {/* Active state subtle indicator line */}
      {active && (
        <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] rounded-r-md bg-[var(--color-foreground)]" />
      )}
      
      <div className={cn("relative z-10 flex items-center justify-center", collapsed ? "w-[24px]" : "")}>
        <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-all duration-300", active ? "text-[var(--color-foreground)]" : "group-hover:text-[var(--color-foreground)]")} />
      </div>
      
      {!collapsed && <span className="relative z-10 tracking-[0.01em]">{label}</span>}
      
      {/* Subtle hover splash effect */}
      {(!active && !collapsed) && <div className="absolute inset-0 bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
    </button>
  )
}
