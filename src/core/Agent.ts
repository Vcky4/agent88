import type { BaseModel } from "./models/BaseModel.js";
import type { BaseMemory } from "./memory/BaseMemory.js";
import { ToolRegistry } from "./tools/ToolRegistry.js";
import { ExecutionEngine } from "./execution/ExecutionEngine.js";
import { ToolExecutor } from "./execution/ToolExecutor.js";
import type { Tool } from "./tools/Tool.js";
import type { ExecutionContext } from "./execution/ExecutionContext.js";
import type { Message } from "../types/index.js";

export interface AgentConfig {
    model: BaseModel;
    memory?: BaseMemory;
    maxIterations?: number;
    systemPrompt?: string;
}

export class Agent {
    private model: BaseModel;
    private memory?: BaseMemory | undefined;
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
     * Main entrypoint for interaction. Takes a prompt, composes the context, 
     * delegates to ExecutionEngine, and returns the final LLM response.
     */
    async run(prompt: string, contextId?: string): Promise<string> {
        let messages: Message[] = [];

        // 1. Load historical context if memory is enabled and a contextId is provided
        if (this.memory && contextId) {
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
            await this.memory.save(userMessage);
        }

        // 4. Delegate to the Execution Engine.
        const context: ExecutionContext = {
            messages: messages,
            tools: this.registry.getAllTools(),
            maxIterations: this.maxIterations
        };

        const response = await this.engine.run(context);

        // 5. Append Assistant response to memory (if applicable)
        if (response.content) {
            const assistantMessage: Message = { role: "assistant", content: response.content };

            if (this.memory) {
                // Ensure to keep memory in sync with final text output
                await this.memory.save(assistantMessage);
            }

            return response.content;
        }

        throw new Error("Execution completed, but no final text content was returned by the model.");
    }
}
