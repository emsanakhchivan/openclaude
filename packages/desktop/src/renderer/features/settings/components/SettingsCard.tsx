import { cn } from "../../../lib/utils"

interface SettingsCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SettingsCard({ title, description, children, className }: SettingsCardProps) {
  return (
    <div className={cn("border border-[var(--color-line)] bg-[var(--color-card)] overflow-hidden", className)}>
      {title && (
        <div className="px-5 pt-4 pb-2">
          <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h4>
          {description && (
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{description}</p>
          )}
        </div>
      )}
      <div className={cn(title ? "border-t border-[var(--color-line)]" : "")}>
        {children}
      </div>
    </div>
  )
}
