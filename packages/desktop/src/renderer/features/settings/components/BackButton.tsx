import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router"

export function BackButton() {
  const navigate = useNavigate()

  return (
    <div className="px-3 pt-4 pb-3">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 w-full h-7 px-3 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>
    </div>
  )
}
