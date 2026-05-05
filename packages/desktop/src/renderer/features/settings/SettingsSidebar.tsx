import { useAtom } from "jotai"
import {
  Sliders,
  Eye,
  Brain,
  Keyboard,
  Folder,
  Plug,
  Sparkles,
  Package,
  BarChart3,
  Activity,
} from "lucide-react"
import { settingsActiveTabAtom, type SettingsTab } from "./store"
import { BackButton } from "./components/BackButton"
import { SettingsTabButton } from "./components/SettingsTabButton"

const GENERAL_TABS: { id: SettingsTab; icon: typeof Sliders; label: string }[] = [
  { id: "preferences", icon: Sliders, label: "Preferences" },
  { id: "appearance", icon: Eye, label: "Appearance" },
  { id: "models", icon: Brain, label: "Models" },
  { id: "keyboard", icon: Keyboard, label: "Keyboard" },
]

const ADVANCED_TABS: { id: SettingsTab; icon: typeof Sliders; label: string }[] = [
  { id: "projects", icon: Folder, label: "Projects" },
  { id: "mcp", icon: Plug, label: "MCP Servers" },
  { id: "skills", icon: Sparkles, label: "Skills" },
  { id: "plugins", icon: Package, label: "Plugins" },
  { id: "stats", icon: BarChart3, label: "Stats" },
  { id: "monitor", icon: Activity, label: "Monitor" },
]

export function SettingsSidebar() {
  const [activeTab, setActiveTab] = useAtom(settingsActiveTabAtom)

  return (
    <aside className="w-[220px] h-full flex flex-col bg-[#0c0c0d] border-r border-zinc-800">
      <BackButton />

      <div className="px-3 pt-2 pb-1">
        <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
          General
        </span>
      </div>

      <nav className="px-2 pb-2 space-y-0.5">
        {GENERAL_TABS.map((tab) => (
          <SettingsTabButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </nav>

      <div className="mx-3 my-2 h-px bg-zinc-800/60" />

      <div className="px-3 pt-2 pb-1">
        <span className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
          Advanced
        </span>
      </div>

      <nav className="px-2 pb-2 space-y-0.5 flex-1 overflow-y-auto">
        {ADVANCED_TABS.map((tab) => (
          <SettingsTabButton
            key={tab.id}
            icon={tab.icon}
            label={tab.label}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </nav>
    </aside>
  )
}