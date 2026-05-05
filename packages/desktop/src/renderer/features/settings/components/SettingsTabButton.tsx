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
        "w-full flex items-center gap-2 px-2.5 py-1.5 text-left transition-colors cursor-pointer",
        active
          ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
      )}
    >
      <Icon className="h-4 w-4 opacity-60 shrink-0" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
