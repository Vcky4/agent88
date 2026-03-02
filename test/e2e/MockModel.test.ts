import { describe, it, expect } from 'vitest';
import { MockModel } from '../../src/core/models/MockModel.js';
import { ExecutionEngine } from '../../src/core/execution/ExecutionEngine.js';
import { ToolExecutor } from '../../src/core/execution/ToolExecutor.js';
import type { Tool } from '../../src/core/tools/Tool.js';
import type { ExecutionContext } from '../../src/core/execution/ExecutionContext.js';

describe('End-to-End: MockModel & ExecutionEngine', () => {
    it('should successfully loop through multiple tool calls and reach a final answer', async () => {
        // 1. Setup tools
        const getWeatherTool: Tool = {
            name: 'getWeather',
            description: 'Gets the current weather for a location',
            execute: async (input: { location: string }) => {
                if (input.location === 'Miami') return 'Sunny and 75F';
                return 'Unknown location';
            }
        };

        const getCurrentTimeTool: Tool = {
            name: 'getCurrentTime',
            description: 'Gets the current time',
            execute: async () => '3:00 PM'
        };

        // 2. Setup Mock Model with predefined loop sequence
        const mockModel = new MockModel([
            // Step 1: The model says it needs the weather
            { toolCall: { name: 'getWeather', input: { location: 'Miami' } } },
            // Step 2: The model now says it needs the time
            { toolCall: { name: 'getCurrentTime', input: {} } },
            // Step 3: The model has all information and returns the final answer
            { content: 'The weather in Miami is Sunny and 75F and the current time is 3:00 PM.' }
        ]);

        // 3. Setup the Execution Engine
        const toolExecutor = new ToolExecutor();
        const engine = new ExecutionEngine(mockModel, toolExecutor);

        const context: ExecutionContext = {
            messages: [{ role: 'user', content: 'What is the weather in Miami and what time is it?' }],
            tools: [getWeatherTool, getCurrentTimeTool],
            maxIterations: 5
        };

        // 4. Run the engine
        const response = await engine.run(context);

        // 5. Verify results

        // Assert the model output correctly aggregated everything
        expect(response.content).toBe('The weather in Miami is Sunny and 75F and the current time is 3:00 PM.');

        // Assert the model was called exactly 3 times as expected
        expect(mockModel.getCallCount()).toBe(3);

        // Assert the context message history properly recorded the tool responses
        // Assert the context message history properly recorded the intermediate tool prompts AND tool responses
        expect(context.messages.length).toBe(5); // User MSG -> Assistant (Weather Request) -> Tool (Weather Result) -> Assistant (Time Request) -> Tool (Time Result)
        expect(context.messages[1]!.role).toBe('assistant');
        expect(context.messages[2]!.role).toBe('tool');
        expect(context.messages[2]!.content).toContain('Sunny and 75F');
        expect(context.messages[3]!.role).toBe('assistant');
        expect(context.messages[4]!.role).toBe('tool');
        expect(context.messages[4]!.content).toContain('3:00 PM');
    });
});
