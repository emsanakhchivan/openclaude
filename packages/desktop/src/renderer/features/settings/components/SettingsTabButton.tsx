import { cn } from "../../../lib/utils"
import type { LucideIcon } from "lucide-react"

interface SettingsTabButtonProps {
  icon: LucideIcon
  label: string
  active: boolean
  onClick: () => void
}

export function SettingsTabButton({ icon: Icon, label, active, onClick }: SettingsTabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer",
        "outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring/70",
        active
          ? "bg-zinc-100/[0.06] text-zinc-100"
          : "text-zinc-500 hover:bg-zinc-100/[0.03] hover:text-zinc-300"
      )}
    >
      <Icon className="h-4 w-4 opacity-60 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}