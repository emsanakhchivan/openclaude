import { SettingsCard } from "../components/SettingsCard"
import { SettingsSection } from "../components/SettingsSection"
import { Brain, MessageSquare, DollarSign, Zap, Database, ArrowDownToLine, ArrowUpFromLine, RotateCcw } from "lucide-react"
import { cn } from "../../../lib/utils"

// ── Mock data matching Models tab profiles ─────────────

interface ModelUsage {
  modelId: string
  modelName: string
  provider: string
  profileName?: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  messageCount: number
  totalCostCents: number
}

const MOCK_USAGE: ModelUsage[] = [
  {
    modelId: "claude-sonnet-4-6",
    modelName: "Claude Sonnet 4.6",
    provider: "Anthropic",
    inputTokens: 1_245_000,
    outputTokens: 312_500,
    cacheReadTokens: 890_000,
    cacheWriteTokens: 156_000,
    messageCount: 1847,
    totalCostCents: 1823,
  },
  {
    modelId: "claude-opus-4-6",
    modelName: "Claude Opus 4.6",
    provider: "Anthropic",
    inputTokens: 423_000,
    outputTokens: 187_500,
    cacheReadTokens: 210_000,
    cacheWriteTokens: 45_000,
    messageCount: 324,
    totalCostCents: 3215,
  },
  {
    modelId: "claude-haiku-4-5",
    modelName: "Claude Haiku 4.5",
    provider: "Anthropic",
    inputTokens: 856_000,
    outputTokens: 423_000,
    cacheReadTokens: 1_230_000,
    cacheWriteTokens: 78_000,
    messageCount: 3210,
    totalCostCents: 412,
  },
  {
    modelId: "openai/gpt-5.5",
    modelName: "GPT-5.5",
    provider: "Custom",
    profileName: "OpenRouter",
    inputTokens: 387_000,
    outputTokens: 98_200,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 456,
    totalCostCents: 942,
  },
  {
    modelId: "moonshot/kimi-k2.5",
    modelName: "Kimi K2.5",
    provider: "Custom",
    profileName: "OpenRouter",
    inputTokens: 178_000,
    outputTokens: 52_400,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 198,
    totalCostCents: 134,
  },
  {
    modelId: "qwen/qwen-3.6-plus",
    modelName: "Qwen 3.6 Plus",
    provider: "Custom",
    profileName: "OpenRouter",
    inputTokens: 215_000,
    outputTokens: 67_800,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 289,
    totalCostCents: 187,
  },
  {
    modelId: "glm-5.1",
    modelName: "GLM 5.1",
    provider: "Custom",
    profileName: "Z AI",
    inputTokens: 294_000,
    outputTokens: 87_300,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 312,
    totalCostCents: 245,
  },
  {
    modelId: "glm-4.7",
    modelName: "GLM-4.7",
    provider: "Custom",
    profileName: "Z AI",
    inputTokens: 156_000,
    outputTokens: 42_100,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 178,
    totalCostCents: 112,
  },
  {
    modelId: "glm-5",
    modelName: "GLM-5",
    provider: "Custom",
    profileName: "Z AI",
    inputTokens: 89_000,
    outputTokens: 23_400,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 97,
    totalCostCents: 67,
  },
  {
    modelId: "llama4:maverick",
    modelName: "Llama 4 Maverick",
    provider: "Custom",
    profileName: "Ollama (Local)",
    inputTokens: 62_000,
    outputTokens: 18_900,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 87,
    totalCostCents: 0,
  },
  {
    modelId: "qwen3:3.6-max",
    modelName: "Qwen 3.6 Max",
    provider: "Custom",
    profileName: "Ollama (Local)",
    inputTokens: 41_000,
    outputTokens: 12_300,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 54,
    totalCostCents: 0,
  },
  {
    modelId: "qwen-plus-latest",
    modelName: "Qwen 3.6 Plus",
    provider: "Custom",
    profileName: "Alibaba Cloud",
    inputTokens: 167_000,
    outputTokens: 45_600,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 213,
    totalCostCents: 89,
  },
  {
    modelId: "qwen-max",
    modelName: "Qwen 3.6 Max",
    provider: "Custom",
    profileName: "Alibaba Cloud",
    inputTokens: 98_000,
    outputTokens: 28_700,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    messageCount: 134,
    totalCostCents: 56,
  },
]

// ── Helpers ────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatCost(cents: number): string {
  if (cents === 0) return "Free"
  return `$${(cents / 100).toFixed(2)}`
}

// ── Summary Card ───────────────────────────────────────

function SummaryCard({
  label,
  value,
  subValue,
  icon: Icon,
}: {
  label: string
  value: string
  subValue?: string
  icon: typeof Brain
}) {
  return (
    <div className="bg-[var(--color-card)] p-4 border border-[var(--color-line)]">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-3.5 w-3.5 text-[var(--color-quiet)]" />
        <div className="text-[10px] text-[var(--color-quiet)] uppercase tracking-wider">
          {label}
        </div>
      </div>
      <div className="text-xl font-semibold text-[var(--color-foreground)]">{value}</div>
      {subValue && (
        <div className="text-[10px] text-[var(--color-quiet)] mt-1">{subValue}</div>
      )}
    </div>
  )
}

// ── Model Row ──────────────────────────────────────────

function ModelRow({ usage }: { usage: ModelUsage }) {
  const isLocal = usage.profileName?.includes("Local")

  return (
    <tr className="border-b border-[var(--color-line)] hover:bg-[var(--color-muted)] transition-colors">
      <td className="py-3 px-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Brain className="h-3 w-3 text-[var(--color-quiet)]" />
            <span className="text-sm font-medium text-[var(--color-foreground)]">
              {usage.modelName}
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] mt-0.5",
              isLocal ? "text-[var(--color-quiet)]" : "text-[var(--color-muted-foreground)]"
            )}
          >
            {usage.provider === "Custom" && usage.profileName
              ? `Custom (${usage.profileName})`
              : usage.provider}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-right text-xs text-[var(--color-ink-2)]">
        {formatNumber(usage.inputTokens)}
      </td>
      <td className="py-3 px-4 text-right text-xs text-[var(--color-ink-2)]">
        {formatNumber(usage.outputTokens)}
      </td>
      <td className="py-3 px-4 text-right text-xs text-[var(--color-muted-foreground)]">
        {formatNumber(usage.cacheReadTokens)}
      </td>
      <td className="py-3 px-4 text-right text-xs text-[var(--color-muted-foreground)]">
        {formatNumber(usage.cacheWriteTokens)}
      </td>
      <td className="py-3 px-4 text-right text-xs text-[var(--color-muted-foreground)]">
        {usage.messageCount.toLocaleString()}
      </td>
      <td
        className={cn(
          "py-3 px-4 text-right text-xs",
          isLocal ? "text-[var(--color-quiet)]" : "text-[var(--color-ink-2)]"
        )}
      >
        {formatCost(usage.totalCostCents)}
      </td>
    </tr>
  )
}

// ── Main Component ─────────────────────────────────────

export function StatsTab() {
  const totals = MOCK_USAGE.reduce(
    (acc, u) => ({
      inputTokens: acc.inputTokens + u.inputTokens,
      outputTokens: acc.outputTokens + u.outputTokens,
      cacheRead: acc.cacheRead + u.cacheReadTokens,
      cacheWrite: acc.cacheWrite + u.cacheWriteTokens,
      messages: acc.messages + u.messageCount,
      cost: acc.cost + u.totalCostCents,
      uniqueModels: acc.uniqueModels + 1,
    }),
    {
      inputTokens: 0,
      outputTokens: 0,
      cacheRead: 0,
      cacheWrite: 0,
      messages: 0,
      cost: 0,
      uniqueModels: 0,
    }
  )

  const totalTokens = totals.inputTokens + totals.outputTokens
  const inputPct =
    totalTokens > 0
      ? Math.round((totals.inputTokens / totalTokens) * 100)
      : 0

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Statistics"
          description="Token usage breakdown by model and provider"
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard
            icon={Zap}
            label="Total Tokens"
            value={formatNumber(totalTokens)}
            subValue={`${formatNumber(totals.inputTokens)} in / ${formatNumber(totals.outputTokens)} out`}
          />
          <SummaryCard
            icon={ArrowDownToLine}
            label="Input Tokens"
            value={formatNumber(totals.inputTokens)}
            subValue={`${inputPct}% of total`}
          />
          <SummaryCard
            icon={ArrowUpFromLine}
            label="Output Tokens"
            value={formatNumber(totals.outputTokens)}
            subValue={`${100 - inputPct}% of total`}
          />
          <SummaryCard
            icon={DollarSign}
            label="Total Cost"
            value={formatCost(totals.cost)}
            subValue={`${totals.uniqueModels} model${totals.uniqueModels !== 1 ? "s" : ""}`}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--color-card)] p-3 border border-[var(--color-line)]">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageSquare className="h-3 w-3 text-[var(--color-quiet)]" />
              <span className="text-[10px] text-[var(--color-quiet)] uppercase tracking-wider">
                Messages
              </span>
            </div>
            <div className="text-lg font-semibold text-[var(--color-foreground)]">
              {totals.messages.toLocaleString()}
            </div>
          </div>
          <div className="bg-[var(--color-card)] p-3 border border-[var(--color-line)]">
            <div className="flex items-center gap-1.5 mb-1">
              <RotateCcw className="h-3 w-3 text-[var(--color-quiet)]" />
              <span className="text-[10px] text-[var(--color-quiet)] uppercase tracking-wider">
                Cache Read
              </span>
            </div>
            <div className="text-lg font-semibold text-[var(--color-foreground)]">
              {formatNumber(totals.cacheRead)}
            </div>
          </div>
          <div className="bg-[var(--color-card)] p-3 border border-[var(--color-line)]">
            <div className="flex items-center gap-1.5 mb-1">
              <Database className="h-3 w-3 text-[var(--color-quiet)]" />
              <span className="text-[10px] text-[var(--color-quiet)] uppercase tracking-wider">
                Cache Write
              </span>
            </div>
            <div className="text-lg font-semibold text-[var(--color-foreground)]">
              {formatNumber(totals.cacheWrite)}
            </div>
          </div>
        </div>

        {/* Per-Model Breakdown */}
        <SettingsCard title="Model Breakdown">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-line)]">
                  <th className="text-left text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Model
                  </th>
                  <th className="text-right text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Input
                  </th>
                  <th className="text-right text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Output
                  </th>
                  <th className="text-right text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Cache R
                  </th>
                  <th className="text-right text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Cache W
                  </th>
                  <th className="text-right text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Msgs
                  </th>
                  <th className="text-right text-[10px] text-[var(--color-quiet)] uppercase tracking-wider py-2 px-4">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USAGE.map((u) => (
                  <ModelRow key={u.modelId} usage={u} />
                ))}
              </tbody>
            </table>
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}
