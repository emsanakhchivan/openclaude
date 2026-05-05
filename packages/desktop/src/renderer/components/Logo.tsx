import { cn } from "../lib/utils"

interface LogoProps {
  collapsed?: boolean
  className?: string
}

export function Logo({ collapsed, className }: LogoProps) {
  if (collapsed) {
    return (
      <span
        className={cn(
          "text-logo text-foreground text-xl select-none flex items-center justify-center w-full",
          className
        )}
      >
        OC
      </span>
    )
  }

  return (
    <span
      className={cn(
        "text-logo text-foreground text-xl select-none",
        className
      )}
    >
      OpenClaude
    </span>
  )
}
