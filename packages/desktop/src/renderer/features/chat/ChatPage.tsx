import { MessageSquare } from "lucide-react"

export function ChatPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <MessageSquare className="h-12 w-12 opacity-20" />
      <div className="text-center">
        <h2 className="text-lg font-medium text-foreground">Chat</h2>
        <p className="mt-1 text-sm">AI chat interface coming in Wave 2</p>
      </div>
    </div>
  )
}
