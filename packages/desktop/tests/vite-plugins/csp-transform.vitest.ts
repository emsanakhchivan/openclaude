import { describe, it, expect } from "vitest"
import { cspTransform } from "../../../vite-plugins/csp-transform"

const DEV_HTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:* http://localhost:*; img-src 'self' data: blob: https:;"
    />
    <title>OpenClaude Desktop</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>`

describe("csp-transform plugin", () => {
  const plugin = cspTransform()

  it("does not modify HTML in dev mode", () => {
    const result = plugin.transformIndexHtml!(DEV_HTML, {
      isDev: true,
      // @ts-expect-error — minimal mock for test
      path: "/index.html",
    })
    expect(result).toBe(DEV_HTML)
  })

  it("removes CSP meta tag entirely in production", () => {
    const result = plugin.transformIndexHtml!(DEV_HTML, {
      isDev: false,
      // @ts-expect-error — minimal mock for test
      path: "/index.html",
    })
    expect(result).not.toContain("Content-Security-Policy")
    expect(result).not.toContain("ws://localhost")
    expect(result).toContain("<title>OpenClaude Desktop</title>")
    expect(result).toContain('<div id="root">')
  })

  it("production output has clean HTML without leftover artifacts", () => {
    const result = plugin.transformIndexHtml!(DEV_HTML, {
      isDev: false,
      // @ts-expect-error — minimal mock for test
      path: "/index.html",
    })
    // Should not have empty lines where the meta tag was
    expect(result).not.toMatch(/^\s*$/m)
    // Title should follow charset meta directly
    expect(result).toMatch(/charset="UTF-8"[^]*<title>/)
  })
})
