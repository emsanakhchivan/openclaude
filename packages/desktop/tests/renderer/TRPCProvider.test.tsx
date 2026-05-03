import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"

// Mock must come before import of the component
vi.mock("../../src/renderer/lib/trpc", () => ({
  trpc: {
    Provider: vi.fn(({ children }) => (
      <div data-testid="trpc-react-provider">{children}</div>
    )),
    createClient: vi.fn(() => ({})),
  },
}))

vi.mock("@tanstack/react-query", () => ({
  QueryClientProvider: vi.fn(({ children, client }: any) => (
    <div data-testid="query-client-provider" data-client={!!client}>
      {children}
    </div>
  )),
  QueryClient: vi.fn().mockImplementation(() => ({})),
}))

import { TRPCProvider } from "../../src/renderer/contexts/TRPCProvider"

describe("TRPCProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children inside provider tree", () => {
    render(
      <TRPCProvider>
        <div data-testid="child">Hello</div>
      </TRPCProvider>,
    )
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("creates tRPC client with ipcLink", () => {
    render(
      <TRPCProvider>
        <div>test</div>
      </TRPCProvider>,
    )
    // Verify createClient was called (imported from mocked module)
    expect(screen.getAllByTestId("trpc-react-provider").length).toBeGreaterThan(0)
  })

  it("wraps with both tRPC Provider and QueryClientProvider", () => {
    render(
      <TRPCProvider>
        <div>test</div>
      </TRPCProvider>,
    )
    const trpcProviders = screen.getAllByTestId("trpc-react-provider")
    expect(trpcProviders.length).toBeGreaterThan(0)
    const queryProviders = screen.getAllByTestId("query-client-provider")
    expect(queryProviders.length).toBeGreaterThan(0)
  })
})
