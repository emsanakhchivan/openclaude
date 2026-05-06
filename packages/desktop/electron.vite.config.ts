import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"
import { cspTransform } from "./vite-plugins/csp-transform"
import { copyFileSync, mkdirSync, readdirSync, existsSync } from "fs"

/** Copies migration SQL files to the build output so __dirname resolution works in production */
function copyMigrationsPlugin() {
  return {
    name: "copy-migrations",
    closeBundle() {
      const srcDir = resolve(__dirname, "src/main/db/migrations")
      const outDir = resolve(__dirname, "out/main/migrations")
      if (!existsSync(srcDir)) return
      mkdirSync(outDir, { recursive: true })
      for (const file of readdirSync(srcDir)) {
        if (file.endsWith(".sql")) {
          copyFileSync(resolve(srcDir, file), resolve(outDir, file))
        }
      }
    },
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyMigrationsPlugin()],
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
