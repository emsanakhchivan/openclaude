import { cn } from "../../lib/utils"

export function TitleBar() {
  return (
    <div className="flex h-9 items-center border-b border-border bg-background select-none">
      <div className="flex-1 flex items-center px-4 text-xs text-muted-foreground">
        {/* Drag region covers the title bar */}
      </div>
      <div
        className="absolute inset-x-0 top-0 h-9"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      />
    </div>
  )
}
