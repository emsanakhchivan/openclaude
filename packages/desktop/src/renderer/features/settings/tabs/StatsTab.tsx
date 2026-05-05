import { useState } from "react"
import { SettingsCard } from "../components/SettingsCard"
import { SettingsSection } from "../components/SettingsSection"
import { SettingsSelect } from "../components/SettingsSelect"
import { StatusDot } from "../components/StatusDot"
import { cn } from "../../../lib/utils"

const MOCK_DATE_RANGES = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
]

const MOCK_OVERVIEW = {
  sessions: 156,
  tokens: "2.4M",
  cost: "$48.20",
  activeDays: 23,
  streak: "7 days",
  peakHour: "3pm",
}

const MOCK_MODEL_USAGE = [
  { name: "Claude Sonnet", tokens: "1.8M", percent: 75 },
  { name: "Claude Opus", tokens: "0.4M", percent: 17 },
  { name: "Claude Haiku", tokens: "0.2M", percent: 8 },
]

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-3 bg-zinc-900/30 rounded-md border border-zinc-800/50">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-semibold text-zinc-100 mt-1 block">{value}</span>
    </div>
  )
}

function UsageBar({ name, tokens, percent }: { name: string; tokens: string; percent: number }) {
  return (
    <div className="px-5 py-3 border-t border-zinc-800/50 first:border-t-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-200">{name}</span>
        <span className="text-xs text-zinc-500">{tokens} tokens</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 mt-1">{percent}%</span>
    </div>
  )
}

export function StatsTab() {
  const [dateRange, setDateRange] = useState("7d")

  // Generate mock heatmap cells (4 weeks x 7 days)
  const heatmapCells = Array.from({ length: 28 }, (_, i) => ({
    level: Math.floor(Math.random() * 4), // 0-3 intensity
  }))

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Statistics"
          description="Usage analytics and token tracking"
        />

        <SettingsCard title="Overview">
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3 mb-3">
              <StatCard label="Sessions" value={MOCK_OVERVIEW.sessions} />
              <StatCard label="Tokens" value={MOCK_OVERVIEW.tokens} />
              <StatCard label="Cost" value={MOCK_OVERVIEW.cost} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Active Days" value={MOCK_OVERVIEW.activeDays} />
              <StatCard label="Streak" value={MOCK_OVERVIEW.streak} />
              <StatCard label="Peak Hour" value={MOCK_OVERVIEW.peakHour} />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Activity Heatmap">
          <div className="px-5 py-4">
            <div className="grid grid-cols-7 gap-1">
              {heatmapCells.map((cell, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-sm",
                    cell.level === 0 && "bg-zinc-800",
                    cell.level === 1 && "bg-green-900",
                    cell.level === 2 && "bg-green-700",
                    cell.level === 3 && "bg-green-500"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-600">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Model Usage">
          {MOCK_MODEL_USAGE.map((m) => (
            <UsageBar key={m.name} name={m.name} tokens={m.tokens} percent={m.percent} />
          ))}
        </SettingsCard>

        <SettingsCard>
          <SettingsSelect
            label="Date Range"
            value={dateRange}
            options={MOCK_DATE_RANGES}
            onChange={setDateRange}
            last
          />
        </SettingsCard>
      </div>
    </div>
  )
}