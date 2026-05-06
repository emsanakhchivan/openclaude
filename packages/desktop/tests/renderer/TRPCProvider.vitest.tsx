import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { trpc } from "../../src/renderer/lib/trpc"
import { ipcLink } from "trpc-electron/renderer"

// Mock must come before import of the component
vi.mock("../../src/renderer/lib/trpc", () => ({
  trpc: {
    Provider: vi.fn(({ children }) => (
      <div data-testid="trpc-react-provider">{children}</div>
    )),
    createClient: vi.fn(() => ({})),
  },
}))

vi.mock("trpc-electron/renderer", () => ({
  ipcLink: vi.fn((opts: any) => ({ type: "ipc-link", transformer: opts?.transformer })),
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
    // Verify ipcLink was called with superjson transformer
    expect(ipcLink).toHaveBeenCalledWith({ transformer: expect.anything() })
    // Verify createClient was called with links array containing ipcLink result
    expect(trpc.createClient).toHaveBeenCalledWith({
      links: [expect.anything()],
    })
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
