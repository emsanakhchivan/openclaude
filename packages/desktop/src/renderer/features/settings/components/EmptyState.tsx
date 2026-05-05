import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <Icon className="h-12 w-12 text-[var(--color-quiet)] mb-4" />
      <p className="text-sm text-[var(--color-muted-foreground)]">{title}</p>
      {description && (
        <p className="text-xs text-[var(--color-quiet)] mt-1">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}