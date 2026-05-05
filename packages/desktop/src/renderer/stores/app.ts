import { create } from "zustand"

interface AppState {
  sidebarCollapsed: boolean
  sidebarWidth: number
  activeView: string
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  setSidebarWidth: (width: number) => void
  setActiveView: (view: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  sidebarWidth: 240,
  activeView: "chat",
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarWidth: (width) => set({ sidebarWidth: width }),
  setActiveView: (view) => set({ activeView: view }),
}))
