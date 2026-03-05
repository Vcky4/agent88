import { describe, it, expect, vi } from 'vitest';
import { ExecutionEngine } from '../../src/core/execution/ExecutionEngine.js';
import { ToolExecutor } from '../../src/core/execution/ToolExecutor.js';
import { Trace } from '../../src/core/execution/Trace.js';
import type { ExecutionContext } from '../../src/core/execution/ExecutionContext.js';
import type { BaseModel, ModelResponse } from '../../src/core/models/BaseModel.js';
import type { Tool } from '../../src/core/tools/Tool.js';

describe('ExecutionEngine', () => {
    it('should return final output if no tool calls are made', async () => {
        const mockModel: BaseModel = {
            generate: vi.fn().mockResolvedValue({
                content: 'Final answer',
            }),
        };

        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        const context: ExecutionContext = {
            messages: [{ role: 'user', content: 'Hello' }],
            tools: [],
            trace: new Trace()
        };

        const response = await engine.run(context);

        expect(response.content).toBe('Final answer');
        expect(mockModel.generate).toHaveBeenCalledTimes(1);
    });

    it('should execute a tool and loop back to the model', async () => {
        const mockTool: Tool = {
            name: 'getWeather',
            description: 'Get weather',
            execute: vi.fn().mockResolvedValue('Sunny and 75F'),
        };

        const mockModel: BaseModel = {
            generate: vi.fn()
                .mockResolvedValueOnce({
                    toolCall: { name: 'getWeather', input: { location: 'Miami' } }
                })
                .mockResolvedValueOnce({
                    content: 'The weather in Miami is Sunny and 75F',
                }),
        };

        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        const context: ExecutionContext = {
            messages: [{ role: 'user', content: 'What is the weather in Miami?' }],
            tools: [mockTool],
            trace: new Trace()
        };

        const response = await engine.run(context);

        expect(mockTool.execute).toHaveBeenCalledWith({ location: 'Miami' });
        expect(mockModel.generate).toHaveBeenCalledTimes(2);
        expect(response.content).toBe('The weather in Miami is Sunny and 75F');
        expect(context.messages.length).toBe(3); // user message + assistant tool request + tool result 
        expect(context.messages[1]!.role).toBe('assistant');
        expect(context.messages[1]!.toolCall?.name).toBe('getWeather');
        expect(context.messages[2]!.role).toBe('tool');
        expect(context.messages[2]!.content).toContain('Sunny and 75F');
    });

    it('should throw an error if max iterations are reached', async () => {
        const mockTool: Tool = {
            name: 'loopTool',
            description: 'A tool that causes a loop',
            execute: vi.fn().mockResolvedValue('Looping'),
        };

        const mockModel: BaseModel = {
            generate: vi.fn().mockResolvedValue({
                toolCall: { name: 'loopTool', input: {} }
            }),
        };

        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        const context: ExecutionContext = {
            messages: [{ role: 'user', content: 'Start loop' }],
            tools: [mockTool],
            maxIterations: 3,
            trace: new Trace()
        };

        await expect(engine.run(context)).rejects.toThrow('Max execution iterations reached');
        expect(mockModel.generate).toHaveBeenCalledTimes(3);
    });

    it('should throw an error if tool is not found', async () => {
        const mockModel: BaseModel = {
            generate: vi.fn().mockResolvedValue({
                toolCall: { name: 'unknownTool', input: {} }
            }),
        };

        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        const context: ExecutionContext = {
            messages: [{ role: 'user', content: 'Call unknown tool' }],
            tools: [],
            trace: new Trace()
        };

        await expect(engine.run(context)).rejects.toThrow('Tool unknownTool not found');
    });

    it('should allow middleware to intercept, modify, and read execution contexts', async () => {
        const mockModel: BaseModel = {
            generate: vi.fn().mockResolvedValue({
                content: 'Original Response',
            }),
        };

        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        engine.use(async (ctx, next) => {
            // Modification BEFORE execution
            ctx.messages.push({ role: "system", content: "Injected" });

            await next();

            // Modification AFTER execution
            if (ctx.response && ctx.response.content) {
                ctx.response.content = "Modified " + ctx.response.content;
            }
        });

        const context: ExecutionContext = {
            messages: [],
            tools: [],
            trace: new Trace()
        };

        const response = await engine.run(context);

        expect(context.messages.length).toBe(1);
        expect(context.messages[0]!.content).toBe("Injected");
        expect(response.content).toBe("Modified Original Response");
    });

    it('should correctly record trace events for llm generation and tool execution', async () => {
        const mockTool: Tool = {
            name: 'fastTool',
            description: 'Does something fast',
            execute: vi.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 10)); // tiny delay to ensure duration > 0
                return 'Success';
            }),
        };

        const mockModel: BaseModel = {
            generate: vi.fn()
                .mockImplementationOnce(async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    return { toolCall: { name: 'fastTool', input: {} } };
                })
                .mockImplementationOnce(async () => {
                    await new Promise(resolve => setTimeout(resolve, 10));
                    return { content: 'All done.' };
                })
        };

        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        const context: ExecutionContext = {
            messages: [{ role: 'user', content: 'Run trace test' }],
            tools: [mockTool],
            trace: new Trace()
        };

        await engine.run(context);

        const events = context.trace.getEvents();

        // We expect 3 events: 
        // 1. llm generation (iteration 1, returns toolcall)
        // 2. tool execution (fastTool)
        // 3. llm generation (iteration 2, returns final answer)
        expect(events.length).toBe(3);

        const firstLlm = events[0]!;
        expect(firstLlm.name).toBe("llm_generate");
        expect(firstLlm.metadata?.iteration).toBe(1);
        expect(firstLlm.durationMs).toBeGreaterThan(0);

        const toolTrace = events[1]!;
        expect(toolTrace.name).toBe("tool_execution");
        expect(toolTrace.metadata?.tool).toBe("fastTool");
        expect(toolTrace.durationMs).toBeGreaterThan(0);

        const secondLlm = events[2]!;
        expect(secondLlm.name).toBe("llm_generate");
        expect(secondLlm.metadata?.iteration).toBe(2);
        expect(secondLlm.durationMs).toBeGreaterThan(0);
    });
});
