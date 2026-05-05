import { useState } from "react"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsToggle } from "../components/SettingsToggle"
import { SettingsSelect } from "../components/SettingsSelect"
import { SettingsSection } from "../components/SettingsSection"

const MOCK_THEMES = [
  { value: "dark-zinc", label: "Dark Zinc" },
  { value: "dark-graphite", label: "Dark Graphite" },
  { value: "midnight", label: "Midnight" },
  { value: "light", label: "Light" },
]

const MOCK_ACCENTS = [
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "green", label: "Green" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
]

const MOCK_SIZES = [
  { value: "compact", label: "Compact" },
  { value: "comfy", label: "Comfy" },
  { value: "spacious", label: "Spacious" },
]

const MOCK_CODE_THEMES = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "auto", label: "Auto" },
]

const MOCK_FONT_SIZES = [
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
]

export function AppearanceTab() {
  const [theme, setTheme] = useState("dark-zinc")
  const [accent, setAccent] = useState("blue")
  const [collapsed, setCollapsed] = useState(false)
  const [showIcons, setShowIcons] = useState(true)
  const [messageSize, setMessageSize] = useState("comfy")
  const [codeTheme, setCodeTheme] = useState("dark")
  const [fontSize, setFontSize] = useState("14px")

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Appearance"
          description="Customize the interface look"
        />

        <SettingsCard title="Theme">
          <SettingsSelect
            label="Color Theme"
            description="Interface color scheme"
            value={theme}
            options={MOCK_THEMES}
            onChange={setTheme}
          />
          <SettingsSelect
            label="Accent Color"
            description="Primary accent highlight"
            value={accent}
            options={MOCK_ACCENTS}
            onChange={setAccent}
            last
          />
        </SettingsCard>

        <SettingsCard title="Sidebar">
          <SettingsToggle
            label="Collapsed by Default"
            description="Start with sidebar collapsed"
            checked={collapsed}
            onChange={setCollapsed}
          />
          <SettingsToggle
            label="Show Icons Only"
            description="Only show icons when collapsed"
            checked={showIcons}
            onChange={setShowIcons}
            last
          />
        </SettingsCard>

        <SettingsCard title="Chat">
          <SettingsSelect
            label="Message Size"
            description="Density of chat messages"
            value={messageSize}
            options={MOCK_SIZES}
            onChange={setMessageSize}
          />
          <SettingsSelect
            label="Code Theme"
            description="Syntax highlighting theme"
            value={codeTheme}
            options={MOCK_CODE_THEMES}
            onChange={setCodeTheme}
            last
          />
        </SettingsCard>

        <SettingsCard title="Editor">
          <SettingsSelect
            label="Font Size"
            description="Text size in editor"
            value={fontSize}
            options={MOCK_FONT_SIZES}
            onChange={setFontSize}
            last
          />
        </SettingsCard>
      </div>
    </div>
  )
}