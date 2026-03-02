import type { Message } from "../../types/index.js";
import type { Tool } from "../tools/Tool.js";
import type { ModelResponse } from "../models/BaseModel.js";

export interface ExecutionContext {
    messages: Message[]
    tools: Tool[]
    maxIterations?: number
    response?: ModelResponse
}
