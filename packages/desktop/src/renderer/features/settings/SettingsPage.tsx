import { Settings } from "lucide-react"

export function SettingsPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Settings className="h-12 w-12 opacity-20" />
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">Settings</h2>
        <p className="mt-1 text-sm">Provider configuration and preferences coming in Wave 2</p>
      </div>
    </div>
  )
}
