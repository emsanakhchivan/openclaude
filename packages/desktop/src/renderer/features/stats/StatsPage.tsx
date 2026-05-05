import { BarChart3 } from "lucide-react"

export function StatsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <BarChart3 className="h-12 w-12 opacity-20" />
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">Stats</h2>
        <p className="mt-1 text-sm">Usage statistics dashboard coming in Wave 4</p>
      </div>
    </div>
  )
}
