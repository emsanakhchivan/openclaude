import { describe, it, expect, vi } from "vitest"

vi.mock("electron", () => ({
  app: { getVersion: vi.fn(() => "0.1.0"), isPackaged: false },
}))

describe("SuperJSON Date roundtrip", () => {
  it("serializes and deserializes Date objects through superjson", async () => {
    const superjson = (await import("superjson")).default
    const original = { date: new Date("2024-06-15T12:00:00Z"), name: "test" }
    const serialized = superjson.serialize(original)
    const deserialized = superjson.deserialize(serialized)
    expect(deserialized.date).toBeInstanceOf(Date)
    expect(deserialized.date.toISOString()).toBe("2024-06-15T12:00:00.000Z")
  })

  it("handles nested objects with Dates", async () => {
    const superjson = (await import("superjson")).default
    const original = {
      nested: { created: new Date("2024-01-01"), updated: new Date("2024-12-31") },
    }
    const serialized = superjson.serialize(original)
    const deserialized = superjson.deserialize(serialized)
    expect(deserialized.nested.created).toBeInstanceOf(Date)
    expect(deserialized.nested.updated).toBeInstanceOf(Date)
  })
})

describe("tRPC Error Formatter", () => {
  it("includes stack trace in development mode", async () => {
    expect.assertions(3)
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    vi.resetModules()
    const { router, publicProcedure } = await import("../../../src/main/ipc/trpc")

    const testRouter = router({
      fail: publicProcedure.query(() => {
        throw new Error("test error")
      }),
    })

    try {
      const caller = testRouter.createCaller({ getWindow: () => null })
      await caller.fail()
    } catch (err: any) {
      expect(err).toBeDefined()
      expect(err.data?.stack).toBeDefined()
      expect(err.data.stack).toContain("test error")
    }

    process.env.NODE_ENV = originalEnv
  })

  it("omits stack trace in production", async () => {
    expect.assertions(2)
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"

    vi.resetModules()
    const { router, publicProcedure } = await import("../../../src/main/ipc/trpc")

    const testRouter = router({
      fail: publicProcedure.query(() => {
        throw new Error("prod error")
      }),
    })

    try {
      const caller = testRouter.createCaller({ getWindow: () => null })
      await caller.fail()
    } catch (err: any) {
      expect(err).toBeDefined()
      expect(err.data?.stack).toBeUndefined()
    }

    process.env.NODE_ENV = originalEnv
  })
})
