import type { Message } from "../../types/index.js";
import type { Tool } from "../tools/Tool.js";

export interface ModelResponse {
    content?: string
    toolCall?: {
        name: string
        input: any
    }
}

export interface ModelGenerateOptions {
    messages: Message[]
    tools?: Tool[]
}

export interface BaseModel {
    generate(options: ModelGenerateOptions): Promise<ModelResponse>
    generateStream?(options: ModelGenerateOptions): AsyncGenerator<string>
}
