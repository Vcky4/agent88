import { describe, it, expect, vi } from 'vitest';
import { ExecutionEngine } from '../../src/core/execution/ExecutionEngine.js';
import { ToolExecutor } from '../../src/core/execution/ToolExecutor.js';
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
        };

        await expect(engine.run(context)).rejects.toThrow('Tool unknownTool not found');
    });
});
