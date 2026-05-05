import { Code2 } from "lucide-react"

export function EditorPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Code2 className="h-12 w-12 opacity-20" />
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">Editor</h2>
        <p className="mt-1 text-sm">Monaco editor integration coming in Wave 3</p>
      </div>
    </div>
  )
}
