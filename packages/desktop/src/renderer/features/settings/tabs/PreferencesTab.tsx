import { useState } from "react"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsToggle } from "../components/SettingsToggle"
import { SettingsSelect } from "../components/SettingsSelect"
import { SettingsSection } from "../components/SettingsSection"

const MOCK_PERMISSION_MODES = [
  { value: "ask", label: "Ask permissions" },
  { value: "accept-edits", label: "Accept edits" },
  { value: "plan", label: "Plan mode" },
  { value: "bypass", label: "Bypass permissions" },
]

export function PreferencesTab() {
  const [defaultMode, setDefaultMode] = useState("ask")
  const [bypassWarning, setBypassWarning] = useState(true)
  const [desktopAlerts, setDesktopAlerts] = useState(true)
  const [soundAlerts, setSoundAlerts] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [streaming, setStreaming] = useState(true)
  const [extendedThinking, setExtendedThinking] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Preferences"
          description="Configure app behavior"
        />

        <SettingsCard title="Permission Mode">
          <SettingsSelect
            label="Default Mode"
            description="Mode for new sessions"
            value={defaultMode}
            options={MOCK_PERMISSION_MODES}
            onChange={setDefaultMode}
          />
          <SettingsToggle
            label="Bypass Warning"
            description="Show confirmation for bypass mode"
            checked={bypassWarning}
            onChange={setBypassWarning}
            last
          />
        </SettingsCard>

        <SettingsCard title="Notifications">
          <SettingsToggle
            label="Desktop Alerts"
            description="System notifications"
            checked={desktopAlerts}
            onChange={setDesktopAlerts}
          />
          <SettingsToggle
            label="Sound Alerts"
            description="Play sound on completion"
            checked={soundAlerts}
            onChange={setSoundAlerts}
            last
          />
        </SettingsCard>

        <SettingsCard title="Behavior">
          <SettingsToggle
            label="Auto-save Chat"
            description="Save conversations to history"
            checked={autoSave}
            onChange={setAutoSave}
          />
          <SettingsToggle
            label="Streaming Mode"
            description="Stream AI responses live"
            checked={streaming}
            onChange={setStreaming}
          />
          <SettingsToggle
            label="Extended Thinking"
            description="Enable deeper reasoning"
            checked={extendedThinking}
            onChange={setExtendedThinking}
            last
          />
        </SettingsCard>

        <SettingsCard title="Privacy">
          <SettingsToggle
            label="Analytics"
            description="Share anonymous usage data"
            checked={analytics}
            onChange={setAnalytics}
            last
          />
        </SettingsCard>
      </div>
    </div>
  )
}