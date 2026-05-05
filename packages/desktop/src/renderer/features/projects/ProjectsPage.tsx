import { FolderOpen } from "lucide-react"

export function ProjectsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <FolderOpen className="h-12 w-12 opacity-20" />
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">Projects</h2>
        <p className="mt-1 text-sm">Project management coming in Wave 3</p>
      </div>
    </div>
  )
}
