import { BarChart3 } from "lucide-react"

export function StatsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center bg-[var(--color-card)]">
        <BarChart3 className="h-7 w-7 text-[var(--color-quiet)]" />
      </div>
      <h2 className="text-lg font-medium text-[var(--color-ink-2)]">Stats</h2>
      <p className="text-sm text-[var(--color-quiet)]">Usage statistics coming in Wave 4</p>
    </div>
  )
}
