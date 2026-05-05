import { cn } from "../../../lib/utils"

interface SettingsRowProps {
  label: string
  description?: string
  children: React.ReactNode
  last?: boolean
}

export function SettingsRow({ label, description, children, last }: SettingsRowProps) {
  return (
    <div className={cn(
      "flex items-center justify-between gap-6 px-5 py-3.5",
      !last && "border-t border-[var(--color-line)]"
    )}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[var(--color-foreground)]">{label}</span>
        {description && (
          <span className="text-xs text-[var(--color-muted-foreground)]">{description}</span>
        )}
      </div>
      {children}
    </div>
  )
}
