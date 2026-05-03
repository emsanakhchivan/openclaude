import type { Plugin } from "vite"

/** Remove dev-only CSP directives from production builds */
export function cspTransform(): Plugin {
  return {
    name: "csp-transform",
    transformIndexHtml(html, { isDev }) {
      if (!isDev) {
        // Production: remove dev-only localhost directives from CSP
        return html.replace(/ws:\/\/localhost:\* http:\/\/localhost:\*/g, "")
      }
      return html
    },
  }
}