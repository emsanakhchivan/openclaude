/** Global types for renderer process */
export {}

declare global {
  interface Window {
    /** Platform info exposed by preload script */
    platform?: {
      os: string
      arch: string
    }
  }
}
