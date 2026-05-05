import { useState, useEffect } from "react"
import { Plus, Folder, Trash2 } from "lucide-react"
import { TwoPanelLayout } from "../components/TwoPanelLayout"
import { SearchInput } from "../components/SearchInput"
import { ListItemCard } from "../components/ListItemCard"
import { EmptyState } from "../components/EmptyState"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsRow } from "../components/SettingsRow"
import { Button } from "../../../components/ui/button"

const MOCK_PROJECTS = [
  { id: "oclaude", name: "oclaude", subtitle: "~/dev/oclaude", status: "active" as const },
  { id: "shopstream", name: "shopstream", subtitle: "~/dev/shopstream", status: "inactive" as const },
  { id: "neural", name: "neural-forge", subtitle: "~/dev/neural", status: "inactive" as const },
  { id: "vault", name: "vaultguard", subtitle: "~/dev/vault", status: "active" as const },
]

const MOCK_SESSIONS = [
  { name: "UI Shell Design", time: "12:30" },
  { name: "Settings Panel", time: "Yesterday" },
  { name: "MCP Integration", time: "2 days ago" },
]

export function ProjectsTab() {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId && MOCK_PROJECTS.length > 0) {
      setSelectedId(MOCK_PROJECTS[0].id)
    }
  }, [selectedId])

  const filteredProjects = MOCK_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedProject = MOCK_PROJECTS.find(p => p.id === selectedId)

  return (
    <TwoPanelLayout
      listPanel={
        <div className="flex flex-col h-full">
          <div className="px-3 pt-3 pb-2 flex items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search projects..."
            />
            <button className="h-7 w-7 flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-sidebar-hover)]">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {filteredProjects.map((project) => (
              <ListItemCard
                key={project.id}
                item={{ ...project, icon: Folder }}
                selected={selectedId === project.id}
                onClick={() => setSelectedId(project.id)}
              />
            ))}
          </div>
        </div>
      }
      detailPanel={
        selectedProject ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{selectedProject.name}</h3>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  {selectedProject.subtitle} • Last opened 2h ago
                </p>
              </div>
            </div>

            <SettingsCard title="Project Details">
              <SettingsRow label="Name" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">{selectedProject.name}</span>
              </SettingsRow>
              <SettingsRow label="Path" last={false}>
                <span className="text-sm text-[var(--color-ink-2)] font-mono">{selectedProject.subtitle}</span>
              </SettingsRow>
              <SettingsRow label="Branch" last={false}>
                <span className="text-sm text-[var(--color-ink-2)] font-mono">desktop/pr4</span>
              </SettingsRow>
              <SettingsRow label="Sessions" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">12</span>
              </SettingsRow>
              <SettingsRow label="Messages" last={false}>
                <span className="text-sm text-[var(--color-ink-2)]">342</span>
              </SettingsRow>
              <SettingsRow label="Last Active" last>
                <span className="text-sm text-[var(--color-ink-2)]">2 hours ago</span>
              </SettingsRow>
            </SettingsCard>

            <SettingsCard title="Recent Sessions">
              {MOCK_SESSIONS.map((session, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-line)] first:border-t-0"
                >
                  <span className="text-sm text-[var(--color-foreground)]">{session.name}</span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">{session.time}</span>
                </div>
              ))}
            </SettingsCard>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">Open in Editor</Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Folder}
            title="No project selected"
            description="Select a project from the list"
          />
        )
      }
    />
  )
}