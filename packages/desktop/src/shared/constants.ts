/** IPC channels */
export const IPC_CHANNELS = {
  // Window management
  WINDOW_MINIMIZE: "window:minimize",
  WINDOW_MAXIMIZE: "window:maximize",
  WINDOW_CLOSE: "window:close",
  WINDOW_IS_MAXIMIZED: "window:is-maximized",

  // App info
  APP_VERSION: "app:version",
  APP_PLATFORM: "app:platform",
} as const