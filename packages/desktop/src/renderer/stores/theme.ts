import { atomWithStorage } from "jotai/utils"

export type Theme = "dark" | "light" | "system"

export const themeAtom = atomWithStorage<Theme>("openclaude-theme", "dark")
