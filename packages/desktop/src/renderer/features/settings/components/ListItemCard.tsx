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
        "w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors cursor-pointer",
        "outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring/70",
        selected
          ? "bg-zinc-100/[0.06] text-zinc-100"
          : "text-zinc-500 hover:bg-zinc-100/[0.03] hover:text-zinc-300"
      )}
    >
      {Icon && <Icon className="h-4 w-4 opacity-60 shrink-0" />}
      <div className="flex-1 min-w-0">
        <span className="block text-sm truncate">{item.name}</span>
        {item.subtitle && (
          <span className="block text-xs text-zinc-600 truncate mt-0.5">
            {item.subtitle}
          </span>
        )}
      </div>
      {item.status && <StatusDot status={item.status} />}
    </button>
  )
}