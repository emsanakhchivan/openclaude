import { describe, it, expect, vi, beforeEach } from "vitest"
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
          error: null,
          refetch: vi.fn(),
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
          error: null,
          refetch: vi.fn(),
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
    render(<App />)
    expect(screen.getByText("OpenClaude Desktop")).toBeDefined()
  })

  it("wraps content in TRPCProvider", () => {
    render(<App />)
    const providers = screen.getAllByTestId("trpc-provider")
    expect(providers.length).toBeGreaterThan(0)
  })

  it("shows version when loaded", () => {
    render(<App />)
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
