import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { App } from "../../src/renderer/App"

// Mock tRPC hooks
vi.mock("../../src/renderer/lib/trpc", () => ({
  trpc: {
    app: {
      getVersion: {
        useQuery: vi.fn(() => ({
          data: { version: "0.1.0", name: "OpenClaude Desktop" },
          isLoading: false,
        })),
      },
      getPlatform: {
        useQuery: vi.fn(() => ({
          data: {
            os: "win32",
            arch: "x64",
            isPackaged: false,
            electronVersion: "39.4.0",
            chromeVersion: "134.0.0",
            nodeVersion: "22.0.0",
          },
          isLoading: false,
        })),
      },
    },
    Provider: vi.fn(({ children }) => children),
    createClient: vi.fn(),
  },
}))

// Mock TRPCProvider
vi.mock("../../src/renderer/contexts/TRPCProvider", () => ({
  TRPCProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="trpc-provider">{children}</div>
  ),
}))

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />)
    expect(screen.getByText("OpenClaude Desktop")).toBeDefined()
  })

  it("wraps content in TRPCProvider", () => {
    render(<App />)
    // Use getAllByTestId since React 19 may render multiple copies
    const providers = screen.getAllByTestId("trpc-provider")
    expect(providers.length).toBeGreaterThan(0)
  })

  it("shows version when loaded", () => {
    render(<App />)
    // Use getAllByText since React 19 may render multiple copies
    const versions = screen.getAllByText("v0.1.0")
    expect(versions.length).toBeGreaterThan(0)
  })

  it("shows tRPC connected message", () => {
    render(<App />)
    const connected = screen.getAllByText("tRPC connected")
    expect(connected.length).toBeGreaterThan(0)
  })

  it("shows platform info", () => {
    render(<App />)
    const platforms = screen.getAllByText("win32 x64")
    expect(platforms.length).toBeGreaterThan(0)
  })
})