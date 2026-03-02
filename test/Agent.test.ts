import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../src/core/Agent.js';
import { MockModel } from '../src/core/models/MockModel.js';
import type { Tool } from '../src/core/tools/Tool.js';
import type { Message, MemoryAdapter } from '../src/types/index.js';

describe('Agent API', () => {
    it('should correctly orchestrate a simple user request without tools or memory', async () => {
        const mockModel = new MockModel([
            { content: "Hello! I am Agent88." }
        ]);

        const agent = new Agent({ model: mockModel });

        const result = await agent.run("Who are you?");

        expect(result).toBe("Hello! I am Agent88.");
        expect(mockModel.getCallCount()).toBe(1);
    });

    it('should respect the system prompt on first run', async () => {
        // We will mock the internal engine run or check the mock model payload internally
        // To be simpler, we'll spy on the mockModel.generate since Agent directly passes the memory downstream
        const mockModel = new MockModel([
            { content: "Understood." }
        ]);

        const generateSpy = vi.spyOn(mockModel, 'generate');

        const agent = new Agent({
            model: mockModel,
            systemPrompt: "You are a helpful assistant."
        });

        await agent.run("Hi!");

        // Assert the exact messages passed to the model downstream by the ExecutionEngine
        expect(generateSpy).toHaveBeenCalledTimes(1);
        const options = generateSpy.mock.calls[0]![0];
        expect(options.messages[0]).toEqual({ role: "system", content: "You are a helpful assistant." });
        expect(options.messages[1]).toEqual({ role: "user", content: "Hi!" });
    });

    it('should properly orchestrate tool execution loops via the ExecutionEngine', async () => {
        const mockModel = new MockModel([
            { toolCall: { name: 'search', input: { query: 'Agent88' } } },
            { content: "Agent88 is a Node.js runtime!" }
        ]);

        const searchTool: Tool = {
            name: "search",
            description: "Search the web",
            execute: async () => "Search result: Agent88 Framework"
        };

        const agent = new Agent({ model: mockModel });
        agent.registerTool(searchTool);

        const result = await agent.run("What is Agent88?");

        expect(result).toBe("Agent88 is a Node.js runtime!");
        expect(mockModel.getCallCount()).toBe(2);
    });

    it('should integrate correctly with Memory storage', async () => {
        const mockModel = new MockModel([
            { content: "Welcome back." }
        ]);

        // Define a simple mock memory class inline for this test
        class InMemoryMock implements MemoryAdapter {
            store: Message[] = [
                { role: "user", content: "Previous message" },
                { role: "assistant", content: "Previous response" }
            ];

            async save(contextId: string, msg: Message) {
                this.store.push(msg);
            }

            async load(id: string) {
                return [...this.store]; // Return copy
            }
        }

        const memory = new InMemoryMock();
        const generateSpy = vi.spyOn(mockModel, 'generate');

        const agent = new Agent({ model: mockModel, memory });

        // Use a context ID to trigger history load
        const result = await agent.run("New message", "session_123");

        expect(result).toBe("Welcome back.");

        const options = generateSpy.mock.calls[0]![0];
        expect(options.messages.length).toBe(3); // 2 history + 1 new
        expect(options.messages[2]).toEqual({ role: "user", content: "New message" });

        // Validate it appended both user input and assistant response to memory natively
        expect(memory.store.length).toBe(4);
        expect(memory.store[2]).toEqual({ role: "user", content: "New message" });
        expect(memory.store[3]).toEqual({ role: "assistant", content: "Welcome back." });
    });

    it('should support conversational text streaming via agent.stream()', async () => {
        const mockModel = new MockModel([
            { content: "Mocked complete text" } // Standard run uses this
        ]);

        // Intercept streaming
        mockModel.generateStream = async function* () {
            yield "Hello, ";
            yield "this ";
            yield "is streamed.";
        };

        const agent = new Agent({ model: mockModel });

        let result = "";
        const stream = agent.stream("Start streaming");
        for await (const chunk of stream) {
            result += chunk;
        }

        expect(result).toBe("Hello, this is streamed.");
    });

    it('should execute middleware accurately using Express/Koa onion routing pattern', async () => {
        const mockModel = new MockModel([{ content: "Middleware test run" }]);
        const agent = new Agent({ model: mockModel });

        const executionOrder: number[] = [];

        // Outer middleware
        agent.use(async (ctx, next) => {
            executionOrder.push(1);
            await next();
            executionOrder.push(4);
        });

        // Inner middleware
        agent.use(async (ctx, next) => {
            executionOrder.push(2);
            await next();
            executionOrder.push(3);
        });

        const res = await agent.run("Trigger context");

        expect(res).toBe("Middleware test run");
        expect(executionOrder).toEqual([1, 2, 3, 4]); // Asserts the exact onion wrapper behavior.
    });
});
