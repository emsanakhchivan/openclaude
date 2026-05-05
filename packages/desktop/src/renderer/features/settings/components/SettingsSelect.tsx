import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select"
import { SettingsRow } from "./SettingsRow"

interface SettingsSelectProps {
  label: string
  description?: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  last?: boolean
}

export function SettingsSelect({ label, description, value, options, onChange, last }: SettingsSelectProps) {
  return (
    <SettingsRow label={label} description={description} last={last}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-auto min-w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsRow>
  )
}