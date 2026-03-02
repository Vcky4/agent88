import type { Message } from "../../types/index.js";
import type { Tool } from "../tools/Tool.js";

export interface ExecutionContext {
    messages: Message[]
    tools: Tool[]
    maxIterations?: number
}
