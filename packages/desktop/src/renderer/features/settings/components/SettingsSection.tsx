interface SettingsSectionProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function SettingsSection({ title, description, action }: SettingsSectionProps) {
  return (
    <div className="flex items-center justify-between pb-2">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-500 mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}