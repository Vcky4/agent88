import type { Tool } from "../core/tools/Tool.js";

export interface Message {
    role: "user" | "assistant" | "tool" | "system"
    content: string
}

export interface MemoryAdapter {
    save(message: Message): Promise<void>
    load(contextId: string): Promise<Message[]>
}

export interface ModelInput {
    messages: Message[]
    tools?: Tool[]
}
