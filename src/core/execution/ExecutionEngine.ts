import type { BaseModel, ModelResponse } from "../models/BaseModel.js";
import { ToolExecutor } from "./ToolExecutor.js";
import type { ExecutionContext } from "./ExecutionContext.js";
import type { Middleware } from "./Middleware.js";

export class ExecutionEngine {
    private middlewares: Middleware[] = [];

    constructor(
        private model: BaseModel,
        private toolExecutor: ToolExecutor
    ) { }

    use(middleware: Middleware) {
        this.middlewares.push(middleware);
    }

    async run(context: ExecutionContext): Promise<ModelResponse> {
        let index = -1;

        const dispatch = async (i: number): Promise<void> => {
            if (i <= index) throw new Error("next() called multiple times");
            index = i;

            if (i < this.middlewares.length) {
                const middleware = this.middlewares[i]!;
                await middleware(context, () => dispatch(i + 1));
            } else {
                // Base core loop
                const response = await this.coreLoop(context);
                context.response = response;
            }
        };

        await dispatch(0);
        return context.response!;
    }

    private async coreLoop(context: ExecutionContext): Promise<ModelResponse> {
        let iterations = 0;
        const max = context.maxIterations ?? 5;

        while (iterations < max) {
            console.log(`[Agent88] Iteration ${iterations + 1}`);

            context.trace.start("llm_generate", { iteration: iterations + 1 });
            const response = await this.model.generate({
                messages: context.messages,
                tools: context.tools
            });
            context.trace.end("llm_generate");

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

            context.trace.start("tool_execution", { tool: tool.name });
            const result = await this.toolExecutor.execute(
                tool,
                response.toolCall.input
            );
            context.trace.end("tool_execution");

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
