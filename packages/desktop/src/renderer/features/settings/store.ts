import { atom } from "jotai"

export const SETTINGS_TABS = [
  "preferences",
  "appearance",
  "models",
  "keyboard",
  "projects",
  "mcp",
  "skills",
  "plugins",
  "stats",
] as const

export type SettingsTab = typeof SETTINGS_TABS[number]

export const settingsActiveTabAtom = atom<SettingsTab>("preferences")