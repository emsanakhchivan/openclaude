import { SettingsSidebar } from "./SettingsSidebar"
import { SettingsContent } from "./SettingsContent"

export function SettingsPage() {
  return (
    <div className="flex h-full">
      <SettingsSidebar />
      <SettingsContent />
    </div>
  )
}
