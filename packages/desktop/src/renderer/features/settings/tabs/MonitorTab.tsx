import { SettingsCard } from "../components/SettingsCard"
import { SettingsSection } from "../components/SettingsSection"
import { StatusDot } from "../components/StatusDot"
import { cn } from "../../../lib/utils"

const MOCK_SESSION = {
  tokens: 12450,
  duration: "8m 23s",
  model: "Sonnet",
  requests: 34,
  cost: "$0.24",
  tools: 12,
}

const MOCK_RESOURCES = {
  memory: { used: 245, total: 8000, percent: 3 },
  cpu: 12,
  disk: 1.2,
}

const MOCK_MCP_STATUS = {
  connected: 3,
  needsAuth: 1,
  error: 1,
}

const MOCK_PROCESSES = [
  { name: "Claude Agent", status: "Running", detail: "PID: 12345 • CPU: 8%" },
  { name: "MCP Server", status: "Running", detail: "filesystem • stdio" },
  { name: "MCP Server", status: "Running", detail: "github • http" },
]

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-3 bg-[var(--color-card)] border border-[var(--color-line)]">
      <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--color-foreground)] mt-1 block">{value}</span>
    </div>
  )
}

function ProgressBar({ label, value, percent, unit }: { label: string; value: string; percent: number; unit?: string }) {
  return (
    <div className={cn("px-5 py-3", "border-t border-[var(--color-line)]")}>
      <div className="flex justify-between mb-1">
        <span className="text-sm text-[var(--color-ink-2)]">{label}</span>
        <span className="text-xs text-[var(--color-muted-foreground)]">{value} {unit}</span>
      </div>
      <div className="h-2 bg-[var(--color-muted)] overflow-hidden">
        <div
          className="h-full bg-[var(--color-accent)]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-[var(--color-muted-foreground)] mt-1">{percent}%</span>
    </div>
  )
}

export function MonitorTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Monitor"
          description="Real-time system status"
        />

        <SettingsCard title="Current Session">
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatBox label="Tokens" value={MOCK_SESSION.tokens.toLocaleString()} />
              <StatBox label="Duration" value={MOCK_SESSION.duration} />
              <StatBox label="Model" value={MOCK_SESSION.model} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatBox label="Requests" value={MOCK_SESSION.requests} />
              <StatBox label="Cost" value={MOCK_SESSION.cost} />
              <StatBox label="Tools" value={MOCK_SESSION.tools} />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="System Resources">
          <ProgressBar
            label="Memory"
            value={`${MOCK_RESOURCES.memory.used}`}
            percent={MOCK_RESOURCES.memory.percent}
            unit="MB / 8 GB"
          />
          <ProgressBar
            label="CPU"
            value={MOCK_RESOURCES.cpu.toString()}
            percent={MOCK_RESOURCES.cpu}
            unit="%"
          />
          <div className="px-5 py-3 border-t border-[var(--color-line)]">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--color-ink-2)]">Disk</span>
              <span className="text-xs text-[var(--color-muted-foreground)]">{MOCK_RESOURCES.disk} GB</span>
            </div>
            <span className="text-xs text-[var(--color-quiet)] mt-1">Session logs + cache</span>
          </div>
        </SettingsCard>

        <SettingsCard title="MCP Status">
          <div className="px-5 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-ink-2)]">Connected</span>
              <div className="flex items-center gap-2">
                <StatusDot status="connected" />
                <span className="text-xs text-[var(--color-muted-foreground)]">{MOCK_MCP_STATUS.connected} servers</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-ink-2)]">Needs Auth</span>
              <div className="flex items-center gap-2">
                <StatusDot status="needs-auth" />
                <span className="text-xs text-[var(--color-muted-foreground)]">{MOCK_MCP_STATUS.needsAuth} server</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-ink-2)]">Error</span>
              <div className="flex items-center gap-2">
                <StatusDot status="error" />
                <span className="text-xs text-[var(--color-muted-foreground)]">{MOCK_MCP_STATUS.error} server</span>
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Active Processes">
          {MOCK_PROCESSES.map((proc, i) => (
            <div
              key={i}
              className={cn(
                "px-5 py-3",
                i > 0 && "border-t border-[var(--color-line)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-ink-2)]">{proc.name}</span>
                <StatusDot status="active" />
              </div>
              <span className="text-xs text-[var(--color-muted-foreground)] mt-1">{proc.status} • {proc.detail}</span>
            </div>
          ))}
        </SettingsCard>
      </div>
    </div>
  )
}
