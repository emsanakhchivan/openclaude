import { describe, it, expect, vi, beforeEach } from "vitest"
import { router, publicProcedure } from "../../../src/main/ipc/trpc"

// Mock Electron APIs
vi.mock("electron", () => ({
  app: {
    getVersion: vi.fn(() => "0.1.0"),
    isPackaged: false,
  },
}))

describe("tRPC Init", () => {
  it("creates router with procedures", () => {
    const testRouter = router({
      test: publicProcedure.query(() => "hello"),
    })
    expect(testRouter).toBeDefined()
    expect(testRouter._def.procedures.test).toBeDefined()
  })
})