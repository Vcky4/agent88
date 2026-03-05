import type { BaseModel } from "./models/BaseModel.js";
import { ToolRegistry } from "./tools/ToolRegistry.js";
import { ExecutionEngine } from "./execution/ExecutionEngine.js";
import { ToolExecutor } from "./execution/ToolExecutor.js";
import type { Tool } from "./tools/Tool.js";
import type { ExecutionContext } from "./execution/ExecutionContext.js";
import type { Middleware } from "./execution/Middleware.js";
import { Trace } from "./execution/Trace.js";
import type { Message, MemoryAdapter } from "../types/index.js";

export interface AgentConfig {
    model: BaseModel;
    memory?: MemoryAdapter;
    maxIterations?: number;
    systemPrompt?: string;
}

export class Agent {
    private model: BaseModel;
    private memory?: MemoryAdapter | undefined;
    private registry: ToolRegistry;
    private engine: ExecutionEngine;
    private systemPrompt?: string | undefined;
    private maxIterations: number;

    constructor(config: AgentConfig) {
        this.model = config.model;
        this.memory = config.memory;
        this.systemPrompt = config.systemPrompt;
        this.maxIterations = config.maxIterations ?? 5;

        this.registry = new ToolRegistry();
        // Agent does NOT execute tools itself. Agent delegates execution to ExecutionEngine and ToolExecutor.
        // Agent does NOT call model directly. ExecutionEngine handles that.
        this.engine = new ExecutionEngine(this.model, new ToolExecutor());
    }

    /**
     * Registers a new tool with the agent to be available during execution.
     */
    registerTool(tool: Tool): void {
        this.registry.register(tool);
    }

    /**
     * Registers an Express-style middleware hook to wrap the ExecutionEngine's run loop.
     * Useful for logging, intercepting, mutating context, or catching root level execution state.
     */
    use(middleware: Middleware): void {
        this.engine.use(middleware);
    }

    /**
     * Main entrypoint for interaction. Takes a prompt, composes the context, 
     * delegates to ExecutionEngine, and returns the final LLM response.
     */
    async run(prompt: string, contextId: string = "default"): Promise<string> {
        let messages: Message[] = [];

        // 1. Load historical context if memory is enabled and a contextId is provided
        if (this.memory) {
            messages = await this.memory.load(contextId);
        }

        // 2. Prepend System Prompt if the conversation is new
        if (messages.length === 0 && this.systemPrompt) {
            messages.push({ role: "system", content: this.systemPrompt });
        }

        // 3. Append the new user prompt
        const userMessage: Message = { role: "user", content: prompt };
        messages.push(userMessage);

        if (this.memory) {
            await this.memory.save(contextId, userMessage);
        }

        // 4. Delegate to the Execution Engine.
        const context: ExecutionContext = {
            messages: messages,
            tools: this.registry.getAllTools(),
            maxIterations: this.maxIterations,
            trace: new Trace()
        };

        const response = await this.engine.run(context);

        // 5. Append Assistant response to memory (if applicable)
        if (response.content) {
            const assistantMessage: Message = { role: "assistant", content: response.content };

            if (this.memory) {
                // Ensure to keep memory in sync with final text output
                await this.memory.save(contextId, assistantMessage);
            }

            return response.content;
        }

        throw new Error("Execution completed, but no final text content was returned by the model.");
    }

    /**
     * Streams the LLM response chunk by chunk. Currently only supports text streaming 
     * bypassing the tool execution loop for rapid v0.1 text generation.
     */
    async *stream(prompt: string, contextId: string = "default"): AsyncGenerator<string> {
        if (!this.model.generateStream) {
            throw new Error("The active model adapter does not support streaming.");
        }

        let messages: Message[] = [];

        // 1. Load historical context
        if (this.memory) {
            messages = await this.memory.load(contextId);
        }

        // 2. Prepend System Prompt if the conversation is new
        if (messages.length === 0 && this.systemPrompt) {
            messages.push({ role: "system", content: this.systemPrompt });
        }

        // 3. Append the new user prompt
        const userMessage: Message = { role: "user", content: prompt };
        messages.push(userMessage);

        if (this.memory) {
            await this.memory.save(contextId, userMessage);
        }

        // 4. Delegate strictly to the Model stream (bypassing ExecutionEngine tool loops for simple text streaming)
        const stream = this.model.generateStream({ messages });

        let fullResponse = "";
        for await (const chunk of stream) {
            fullResponse += chunk;
            yield chunk;
        }

        // 5. Append Assistant response to memory
        if (fullResponse && this.memory) {
            const assistantMessage: Message = { role: "assistant", content: fullResponse };
            await this.memory.save(contextId, assistantMessage);
        }
    }
}
