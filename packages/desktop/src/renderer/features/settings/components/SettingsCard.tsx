import { cn } from "../../../lib/utils"

interface SettingsCardProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function SettingsCard({ title, description, children, className }: SettingsCardProps) {
  return (
    <div className={cn("rounded-lg border border-zinc-800 bg-zinc-900/20 overflow-hidden", className)}>
      {title && (
        <div className="px-5 pt-4 pb-2">
          <h4 className="text-sm font-semibold text-zinc-100">{title}</h4>
          {description && (
            <p className="text-xs text-zinc-500 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className={cn(title ? "border-t border-zinc-800/50" : "")}>
        {children}
      </div>
    </div>
  )
}