/** Global types for renderer process */

interface Window {
  /** Platform info exposed by preload script */
  platform?: {
    os: string
    arch: string
  }
}