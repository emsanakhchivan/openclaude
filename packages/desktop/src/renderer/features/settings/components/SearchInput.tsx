import { Search } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  return (
    <div className="flex items-center gap-1.5 h-7 px-2 rounded-md bg-zinc-900/50 border border-zinc-800">
      <Search className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
      />
    </div>
  )
}