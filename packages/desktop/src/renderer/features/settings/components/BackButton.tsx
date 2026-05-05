import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router"

export function BackButton() {
  const navigate = useNavigate()

  return (
    <div className="px-3 pt-4 pb-3">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 w-full h-7 px-3 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-100/[0.03] transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>
    </div>
  )
}