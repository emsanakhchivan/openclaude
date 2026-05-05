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
          "text-lg font-bold tracking-tight text-zinc-100 select-none",
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
        "text-base font-semibold tracking-tight text-zinc-100 select-none",
        className
      )}
    >
      OpenClaude
    </span>
  )
}
