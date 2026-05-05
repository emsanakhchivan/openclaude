import { useState, useEffect } from "react"
import { Plus, Package, Trash2 } from "lucide-react"
import { TwoPanelLayout } from "../components/TwoPanelLayout"
import { SearchInput } from "../components/SearchInput"
import { ListItemCard } from "../components/ListItemCard"
import { EmptyState } from "../components/EmptyState"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsRow } from "../components/SettingsRow"
import { StatusDot } from "../components/StatusDot"
import { Button } from "../../../components/ui/button"

const MOCK_PLUGINS = [
  { id: "superpowers", name: "superpowers", subtitle: "v5.0.7 • Official", status: "active" as const },
  { id: "pr-review", name: "pr-review-toolkit", subtitle: "v2.1.0 • Local", status: "active" as const },
  { id: "mcp-builder", name: "mcp-builder", subtitle: "v1.0.0 • Git", status: "error" as const },
]

const MOCK_SKILLS_LIST = [
  "brainstorm",
  "commit",
  "review-pr",
  "debug",
  "plan",
  "... (7 more)",
]

export function PluginsTab() {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId && MOCK_PLUGINS.length > 0) {
      setSelectedId(MOCK_PLUGINS[0].id)
    }
  }, [selectedId])

  const filteredPlugins = MOCK_PLUGINS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedPlugin = MOCK_PLUGINS.find(p => p.id === selectedId)

  return (
    <TwoPanelLayout
      listPanel={
        <div className="flex flex-col h-full">
          <div className="px-3 pt-3 pb-2 flex items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search plugins..."
            />
            <button className="h-7 w-7 flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-sidebar-hover)]">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="px-3 pt-1 pb-1">
            <span className="text-xs font-medium text-[var(--color-quiet)] uppercase tracking-wider">
              Plugins ({MOCK_PLUGINS.length})
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {filteredPlugins.map((plugin) => (
              <ListItemCard
                key={plugin.id}
                item={{ ...plugin, icon: Package }}
                selected={selectedId === plugin.id}
                onClick={() => setSelectedId(plugin.id)}
              />
            ))}
          </div>
        </div>
      }
      detailPanel={
        selectedPlugin ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{selectedPlugin.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusDot status={selectedPlugin.status} />
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {selectedPlugin.subtitle} • {selectedPlugin.status === "active" ? "Loaded • 12 skills" : selectedPlugin.status}
                  </span>
                </div>
              </div>
            </div>

            <SettingsCard title="Plugin Info">
              <SettingsRow label="Name" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">{selectedPlugin.name}</span>
              </SettingsRow>
              <SettingsRow label="Version" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">5.0.7</span>
              </SettingsRow>
              <SettingsRow label="Source" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">Official</span>
              </SettingsRow>
              <SettingsRow label="Author" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">Anthropic</span>
              </SettingsRow>
              <SettingsRow label="Description" last>
                <span className="text-sm text-[var(--color-ink-2)]">Productivity skills for development</span>
              </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Contributed">
              <div className="px-5 py-4 grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-[var(--color-muted-foreground)]">Skills</span>
                  <span className="text-sm font-semibold text-[var(--color-foreground)] mt-1 block">12</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--color-muted-foreground)]">Agents</span>
                  <span className="text-sm font-semibold text-[var(--color-foreground)] mt-1 block">3</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--color-muted-foreground)]">Tools</span>
                  <span className="text-sm font-semibold text-[var(--color-foreground)] mt-1 block">2</span>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard title="Skills">
              <div className="px-5 py-4">
                <div className="text-sm text-[var(--color-ink-2)]">
                  {MOCK_SKILLS_LIST.map((s, i) => (
                    <span key={i}>
                      • {s}
                      {i < MOCK_SKILLS_LIST.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            </SettingsCard>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">Update</Button>
              <Button variant="ghost" size="sm">Disable</Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No plugin selected"
            description="Select a plugin from the list"
          />
        )
      }
    />
  )
}