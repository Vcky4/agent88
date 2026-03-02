import type { BaseModel } from "../models/BaseModel.js";
import { ToolExecutor } from "./ToolExecutor.js";
import type { ExecutionContext } from "./ExecutionContext.js";

export class ExecutionEngine {
    constructor(
        private model: BaseModel,
        private toolExecutor: ToolExecutor
    ) { }

    async run(context: ExecutionContext) {
        let iterations = 0;
        const max = context.maxIterations ?? 5;

        while (iterations < max) {
            console.log(`[Agent88] Iteration ${iterations + 1}`);

            const response = await this.model.generate({
                messages: context.messages,
                tools: context.tools
            });

            if (!response.toolCall) {
                return response;
            }

            // Important: Preserve the conversation state by appending the model's intermediate tool call
            context.messages.push({
                role: "assistant",
                content: response.content || "",
                toolCall: response.toolCall
            });

            const tool = context.tools.find(
                (t) => t.name === response.toolCall!.name
            );

            if (!tool) {
                throw new Error(`Tool ${response.toolCall.name} not found`);
            }

            console.log(`[Agent88] Tool called: ${tool.name}`);

            const result = await this.toolExecutor.execute(
                tool,
                response.toolCall.input
            );

            console.log(`[Agent88] Tool result received`);

            context.messages.push({
                role: "tool",
                content: JSON.stringify(result)
            });

            iterations++;
        }

        throw new Error("Max execution iterations reached");
    }
}
