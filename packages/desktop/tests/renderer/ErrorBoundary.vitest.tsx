import { describe, it, expect } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { ErrorBoundary } from "../../src/renderer/components/ErrorBoundary"

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">Hello</div>
      </ErrorBoundary>,
    )
    expect(screen.getByTestId("child")).toBeDefined()
  })

  it("renders fallback UI when error thrown", () => {
    const ThrowError = () => {
      throw new Error("Test error")
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )
    expect(screen.getByText("Something went wrong")).toBeDefined()
    expect(screen.getByText("Test error")).toBeDefined()
    cleanup()
  })

  it("renders restart button", () => {
    const ThrowError = () => {
      throw new Error("Test error")
    }

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    )
    const buttons = screen.getAllByText("Restart App")
    expect(buttons.length).toBeGreaterThan(0)
  })
})