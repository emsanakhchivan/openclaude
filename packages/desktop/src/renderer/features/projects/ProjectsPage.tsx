import { FolderOpen } from "lucide-react"

export function ProjectsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center bg-[var(--color-card)]">
        <FolderOpen className="h-7 w-7 text-[var(--color-quiet)]" />
      </div>
      <h2 className="text-lg font-medium text-[var(--color-ink-2)]">Projects</h2>
      <p className="text-sm text-[var(--color-quiet)]">Project management coming in Wave 3</p>
    </div>
  )
}
