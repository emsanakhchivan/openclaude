import { BrowserRouter, Routes, Route } from "react-router"
import { TRPCProvider } from "./contexts/TRPCProvider"
import { TooltipProvider } from "./components/ui/tooltip"
import { AppShell } from "./components/layout/AppShell"
import { ChatPage } from "./features/chat/ChatPage"
import { SettingsPage } from "./features/settings/SettingsPage"
import { ProjectsPage } from "./features/projects/ProjectsPage"
import { EditorPage } from "./features/editor/EditorPage"
import { McpPage } from "./features/mcp/McpPage"
import { StatsPage } from "./features/stats/StatsPage"
import "./styles/globals.css"

export function App() {
  return (
    <TRPCProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<ChatPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/mcp" element={<McpPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TRPCProvider>
  )
}
