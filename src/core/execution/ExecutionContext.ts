import type { Message } from "../../types/index.js";
import type { Tool } from "../tools/Tool.js";
import type { ModelResponse } from "../models/BaseModel.js";
import type { Trace } from "./Trace.js";

export interface ExecutionContext {
    messages: Message[]
    tools: Tool[]
    maxIterations?: number
    response?: ModelResponse
    trace: Trace
}
