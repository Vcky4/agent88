export interface Message {
  role: "user" | "assistant" | "tool" | "system"
  content: string
}
