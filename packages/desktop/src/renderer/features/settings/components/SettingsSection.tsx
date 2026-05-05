interface SettingsSectionProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SettingsSection({ title, description, action }: SettingsSectionProps) {
  return (
    <div className="flex items-center justify-between pb-2">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
        {description && (
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
