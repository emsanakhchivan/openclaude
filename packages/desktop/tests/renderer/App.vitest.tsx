import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { App } from "../../src/renderer/App"

// Mock tRPC
vi.mock("../../src/renderer/lib/trpc", () => ({
  trpc: {
    app: {
      getVersion: {
        useQuery: vi.fn(() => ({
          data: { version: "0.1.0", name: "OpenClaude Desktop" },
          isLoading: false,
          error: null,
        })),
      },
      getPlatform: {
        useQuery: vi.fn(() => ({
          data: { os: "win32", arch: "x64" },
          isLoading: false,
          error: null,
        })),
      },
    },
    Provider: vi.fn(({ children }) => children),
    createClient: vi.fn(),
  },
}))

vi.mock("../../src/renderer/contexts/TRPCProvider", () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}))

describe("App", () => {
  it("renders without crashing", () => {
    const { container } = render(<App />)
    expect(container).toBeDefined()
  })

  it("wraps content in TRPCProvider", () => {
    render(<App />)
    const providers = screen.getAllByTestId("trpc-provider")
    expect(providers.length).toBeGreaterThan(0)
  })

  it("shows sidebar with navigation", () => {
    render(<App />)
    // Sidebar renders nav items
    expect(screen.getAllByText("Chat").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Projects").length).toBeGreaterThan(0)
  })

  it("renders default chat page placeholder", () => {
    render(<App />)
    // ChatPage is default route
    const placeholders = screen.getAllByText("AI chat interface coming in Wave 2")
    expect(placeholders.length).toBeGreaterThan(0)
  })
})
