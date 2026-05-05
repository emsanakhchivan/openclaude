import { MessageSquare } from "lucide-react"

export function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900">
        <MessageSquare className="h-7 w-7 text-zinc-600" />
      </div>
      <h2 className="text-lg font-medium text-zinc-300">Chat</h2>
      <p className="text-sm text-zinc-600">AI chat interface coming in Wave 2</p>
    </div>
  )
}
