import { useAtomValue } from "jotai"
import { settingsActiveTabAtom } from "./store"
import { PreferencesTab } from "./tabs/PreferencesTab"
import { AppearanceTab } from "./tabs/AppearanceTab"
import { ModelsTab } from "./tabs/ModelsTab"
import { KeyboardTab } from "./tabs/KeyboardTab"
import { ProjectsTab } from "./tabs/ProjectsTab"
import { McpTab } from "./tabs/McpTab"
import { SkillsTab } from "./tabs/SkillsTab"
import { PluginsTab } from "./tabs/PluginsTab"
import { StatsTab } from "./tabs/StatsTab"
import { MonitorTab } from "./tabs/MonitorTab"

export function SettingsContent() {
  const activeTab = useAtomValue(settingsActiveTabAtom)

  const renderTab = () => {
    switch (activeTab) {
      case "preferences":
        return <PreferencesTab />
      case "appearance":
        return <AppearanceTab />
      case "models":
        return <ModelsTab />
      case "keyboard":
        return <KeyboardTab />
      case "projects":
        return <ProjectsTab />
      case "mcp":
        return <McpTab />
      case "skills":
        return <SkillsTab />
      case "plugins":
        return <PluginsTab />
      case "stats":
        return <StatsTab />
      case "monitor":
        return <MonitorTab />
      default:
        return <PreferencesTab />
    }
  }

  return (
    <div className="flex-1 h-full overflow-hidden bg-[#09090b]">
      {renderTab()}
    </div>
  )
}