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
          "text-sm font-bold tracking-tight text-zinc-100 select-none",
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
        "text-[15px] font-semibold tracking-tight text-zinc-100 select-none",
        className
      )}
    >
      OpenClaude
    </span>
  )
}
