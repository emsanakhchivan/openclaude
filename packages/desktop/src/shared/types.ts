/** Permission modes for tool execution */
export type PermissionMode = "ask" | "accept_edits" | "plan" | "bypass"

/** Message role */
export type MessageRole = "user" | "assistant" | "tool" | "system"

/** Tool call status */
export type ToolCallStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "running"
  | "completed"
  | "failed"

/** Plugin status */
export type PluginStatus = "loaded" | "error" | "loading" | "disabled"