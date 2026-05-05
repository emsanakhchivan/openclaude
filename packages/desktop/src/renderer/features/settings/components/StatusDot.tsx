import { cn } from "../../../lib/utils"

interface StatusDotProps {
  status: "active" | "inactive" | "connected" | "error" | "pending" | "needs-auth"
}

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      className={cn(
        "w-2 h-2 rounded-full shrink-0",
        status === "active" && "bg-green-500",
        status === "connected" && "bg-green-500",
        status === "inactive" && "bg-zinc-500",
        status === "error" && "bg-red-500",
        status === "pending" && "bg-yellow-500",
        status === "needs-auth" && "bg-yellow-500"
      )}
    />
  )
}