import { Switch } from "../../../components/ui/switch"
import { SettingsRow } from "./SettingsRow"

interface SettingsToggleProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  last?: boolean
}

export function SettingsToggle({ label, description, checked, onChange, last }: SettingsToggleProps) {
  return (
    <SettingsRow label={label} description={description} last={last}>
      <Switch checked={checked} onCheckedChange={onChange} />
    </SettingsRow>
  )
}