import type { Tool } from "../tools/Tool.js";

export class ToolExecutor {
    async execute(tool: Tool, input: any) {
        try {
            return await tool.execute(input)
        } catch (error) {
            return {
                error: "Tool execution failed",
                details: error instanceof Error ? error.message : String(error)
            }
        }
    }
}
