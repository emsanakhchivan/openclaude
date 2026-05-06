import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"
import { cspTransform } from "./vite-plugins/csp-transform"

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@gitlawb/openclaude/sdk": resolve(__dirname, "../../dist/sdk.mjs"),
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, "src/main/index.ts"),
      },
      rollupOptions: {
        external: ["electron", "better-sqlite3", "trpc-electron", "superjson", "@gitlawb/openclaude/sdk"],
        output: {
          format: "cjs",
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      lib: {
        entry: resolve(__dirname, "src/preload/index.ts"),
      },
      rollupOptions: {
        external: ["electron", /^trpc-electron/],
        output: {
          format: "cjs",
        },
      },
    },
  },
  renderer: {
    plugins: [react(), cspTransform()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "src/renderer"),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
        },
      },
    },
  },
})
