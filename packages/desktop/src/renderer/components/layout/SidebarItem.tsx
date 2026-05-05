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
        "flex w-full items-center gap-3 px-3 py-[9px] text-[13px] font-medium transition-all duration-200 group relative overflow-hidden",
        active
          ? "bg-[var(--color-muted)] text-[var(--color-sidebar-active)]"
          : "text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-foreground)]",
        collapsed && "justify-center px-0"
      )}
      title={collapsed ? label : undefined}
    >
      {/* Active state indicator line — accent color */}
      {active && (
        <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] bg-[var(--color-accent)]" />
      )}

      <div className={cn("relative z-10 flex items-center justify-center", collapsed ? "w-[24px]" : "")}>
        <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-all duration-300", active ? "text-[var(--color-foreground)]" : "group-hover:text-[var(--color-foreground)]")} />
      </div>

      {!collapsed && <span className="relative z-10 tracking-[0.01em]">{label}</span>}
    </button>
  )
}
