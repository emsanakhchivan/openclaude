import type { Plugin } from "vite"

/**
 * Remove CSP meta tag from production builds.
 *
 * In production, CSP is enforced solely via session headers (main/index.ts),
 * which is more secure since it's controlled by the main process and cannot
 * be tampered with by renderer content.
 *
 * In development, the HTML meta tag CSP allows Vite HMR WebSocket connections.
 */
export function cspTransform(): Plugin {
  return {
    name: "csp-transform",
    transformIndexHtml(html, { isDev }) {
      if (!isDev) {
        // Production: remove the entire CSP meta tag — session header CSP is authoritative
        return html.replace(
          /<meta\s+http-equiv="Content-Security-Policy"[^>]*>\n?/g,
          "",
        )
      }
      return html
    },
  }
}
