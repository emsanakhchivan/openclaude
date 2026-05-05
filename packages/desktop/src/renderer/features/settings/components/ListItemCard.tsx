import { cn } from "../../../lib/utils"
import type { LucideIcon } from "lucide-react"
import { StatusDot } from "./StatusDot"

interface ListItemCardProps {
  item: {
    id: string
    name: string
    subtitle?: string
    icon?: LucideIcon
    status?: "active" | "inactive" | "connected" | "error" | "pending" | "needs-auth"
  }
  selected: boolean
  onClick: () => void
}

export function ListItemCard({ item, selected, onClick }: ListItemCardProps) {
  const Icon = item.icon

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer",
        "outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring/70",
        selected
          ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-foreground)]"
      )}
    >
      {Icon && <Icon className="h-4 w-4 opacity-60 shrink-0" />}
      <div className="flex-1 min-w-0">
        <span className="block text-sm truncate">{item.name}</span>
        {item.subtitle && (
          <span className="block text-xs text-[var(--color-quiet)] truncate mt-0.5">
            {item.subtitle}
          </span>
        )}
      </div>
      {item.status && <StatusDot status={item.status} />}
    </button>
  )
}