import { SettingsCard } from "../components/SettingsCard"
import { SettingsSection } from "../components/SettingsSection"
import { cn } from "../../../lib/utils"

interface Shortcut {
  action: string
  keys: string
}

const NAVIGATION_SHORTCUTS: Shortcut[] = [
  { action: "New Chat", keys: "Ctrl+N" },
  { action: "Search Chat", keys: "Ctrl+F" },
  { action: "Quick Switch", keys: "Ctrl+Tab" },
  { action: "Settings", keys: "Ctrl+," },
]

const CHAT_SHORTCUTS: Shortcut[] = [
  { action: "Send Message", keys: "Ctrl+Enter" },
  { action: "Cancel Stream", keys: "Esc" },
  { action: "Attach File", keys: "Ctrl+U" },
  { action: "Voice Input", keys: "Ctrl+M" },
]

const EDITING_SHORTCUTS: Shortcut[] = [
  { action: "Toggle Mode", keys: "Ctrl+P" },
  { action: "Clear Chat", keys: "Ctrl+K" },
  { action: "History Back", keys: "Ctrl+[" },
  { action: "History Forward", keys: "Ctrl+]" },
]

const SYSTEM_SHORTCUTS: Shortcut[] = [
  { action: "Toggle Sidebar", keys: "Ctrl+B" },
  { action: "Quit", keys: "Ctrl+Q" },
]

function ShortcutRow({ shortcut, first }: { shortcut: Shortcut; first?: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-between px-5 py-3",
      !first && "border-t border-[var(--color-line)]"
    )}>
      <span className="text-sm text-[var(--color-foreground)]">{shortcut.action}</span>
      <kbd className="px-2 py-1 text-xs font-mono bg-[var(--color-muted)] text-[var(--color-ink-2)]">
        {shortcut.keys}
      </kbd>
    </div>
  )
}

export function KeyboardTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <SettingsSection
          title="Keyboard Shortcuts"
          description="Customize keyboard bindings"
        />

        <SettingsCard title="Navigation">
          {NAVIGATION_SHORTCUTS.map((s, i) => (
            <ShortcutRow key={s.action} shortcut={s} first={i === 0} />
          ))}
        </SettingsCard>

        <SettingsCard title="Chat Actions">
          {CHAT_SHORTCUTS.map((s, i) => (
            <ShortcutRow key={s.action} shortcut={s} first={i === 0} />
          ))}
        </SettingsCard>

        <SettingsCard title="Editing">
          {EDITING_SHORTCUTS.map((s, i) => (
            <ShortcutRow key={s.action} shortcut={s} first={i === 0} />
          ))}
        </SettingsCard>

        <SettingsCard title="System">
          {SYSTEM_SHORTCUTS.map((s, i) => (
            <ShortcutRow key={s.action} shortcut={s} first={i === 0} />
          ))}
        </SettingsCard>
      </div>
    </div>
  )
}