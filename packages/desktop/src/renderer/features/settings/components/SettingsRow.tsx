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
      !last && "border-t border-zinc-800/50"
    )}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        {description && (
          <span className="text-xs text-zinc-500">{description}</span>
        )}
      </div>
      {children}
    </div>
  )
}