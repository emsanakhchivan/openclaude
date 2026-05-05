import { useState, useEffect } from "react"
import { Plus, Plug, Edit2, Trash2 } from "lucide-react"
import { TwoPanelLayout } from "../components/TwoPanelLayout"
import { SearchInput } from "../components/SearchInput"
import { ListItemCard } from "../components/ListItemCard"
import { EmptyState } from "../components/EmptyState"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsRow } from "../components/SettingsRow"
import { StatusDot } from "../components/StatusDot"
import { Button } from "../../../components/ui/button"

const MCP_MOCK_SERVERS = [
  { id: "filesystem", name: "filesystem", subtitle: "Local • stdio", status: "connected" as const },
  { id: "github", name: "github", subtitle: "Global • http", status: "connected" as const },
  { id: "postgres", name: "postgres", subtitle: "Local • stdio", status: "connected" as const },
  { id: "slack", name: "slack", subtitle: "Global • http", status: "needs-auth" as const },
  { id: "brave", name: "brave-search", subtitle: "Global • http", status: "error" as const },
]

const MCP_MOCK_TOOLS = [
  { name: "read_file", description: "Read file contents" },
  { name: "write_file", description: "Write content to file" },
  { name: "list_directory", description: "List directory contents" },
  { name: "search_files", description: "Search for files by pattern" },
  { name: "get_file_info", description: "Get file metadata" },
]

export function McpTab() {
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId && MCP_MOCK_SERVERS.length > 0) {
      setSelectedId(MCP_MOCK_SERVERS[0].id)
    }
  }, [selectedId])

  const filteredServers = MCP_MOCK_SERVERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedServer = MCP_MOCK_SERVERS.find(s => s.id === selectedId)

  return (
    <TwoPanelLayout
      listPanel={
        <div className="flex flex-col h-full">
          <div className="px-3 pt-3 pb-2 flex items-center gap-2">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search servers..."
            />
            <button className="h-7 w-7 flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-sidebar-hover)]">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
            {filteredServers.map((server) => (
              <ListItemCard
                key={server.id}
                item={{ ...server, icon: Plug }}
                selected={selectedId === server.id}
                onClick={() => setSelectedId(server.id)}
              />
            ))}
          </div>
        </div>
      }
      detailPanel={
        selectedServer ? (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{selectedServer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StatusDot status={selectedServer.status} />
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {selectedServer.subtitle} • {selectedServer.status === "connected" ? "5 tools" : selectedServer.status}
                  </span>
                </div>
              </div>
            </div>

            <SettingsCard title="Connection">
              <SettingsRow label="Type" last={false}>
                <span className="text-sm text-[var(--color-ink-2)] font-mono">stdio</span>
              </SettingsRow>
              <SettingsRow label="Command" last={false}>
                <span className="text-sm text-[var(--color-ink-2)] font-mono">npx</span>
              </SettingsRow>
              <SettingsRow label="Args" last={false}>
                <span className="text-sm text-[var(--color-ink-2)] font-mono">-y @model/mcp</span>
              </SettingsRow>
              <SettingsRow label="Scope" last>
                <span className="text-sm text-[var(--color-ink-2)]">Local</span>
              </SettingsRow>
            </SettingsCard>

            {selectedServer.status === "connected" && (
              <SettingsCard title="Tools (5)">
                {MCP_MOCK_TOOLS.map((tool) => (
                  <div
                    key={tool.name}
                    className="px-5 py-3 border-t border-[var(--color-line)] first:border-t-0"
                  >
                    <span className="text-sm font-mono text-[var(--color-foreground)]">{tool.name}</span>
                    <span className="text-xs text-[var(--color-muted-foreground)] mt-1 block">{tool.description}</span>
                  </div>
                ))}
              </SettingsCard>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button variant="ghost" size="sm">Disable</Button>
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Plug}
            title="No server selected"
            description="Select an MCP server from the list"
          />
        )
      }
    />
  )
}