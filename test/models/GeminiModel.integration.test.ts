// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { GeminiModel } from '../../src/core/models/GeminiModel.js';
import type { ModelGenerateOptions } from '../../src/core/models/BaseModel.js';
import dotenv from 'dotenv';
dotenv.config();

// Skipping the whole suite if there's no real API key available
const runTestIfKeyExists = process.env.GEMINI_API_KEY ? describe : describe.skip;

runTestIfKeyExists('GeminiModel Integration (Real API)', () => {
    const model = new GeminiModel(process.env.GEMINI_API_KEY!);

    it('should connect to Gemini and return a response', async () => {
        const options: ModelGenerateOptions = {
            messages: [
                { role: 'user', content: 'What is 2 + 2? Answer with just the number.' }
            ]
        };

        const result = await model.generate(options);
        
        expect(result.content).toBeDefined();
        expect(result.content!.includes('4')).toBe(true);
    });

    it('should trigger a tool call properly', async () => {
        const options: ModelGenerateOptions = {
            messages: [
                { role: 'user', content: 'What is the weather like in Paris right now? Use the provided weather tool.' }
            ],
            tools: [
                {
                    name: 'get_weather',
                    description: 'Get current weather for a location',
                    parameters: {
                        type: 'object',
                        properties: {
                            location: { type: 'string' }
                        },
                        required: ['location']
                    },
                    execute: async (input: any) => { return `Weather in ${input.location} is sunny.`; }
                }
            ]
        };

        const result = await model.generate(options);
        
        // Ensure it correctly calls the function
        expect(result.toolCall).toBeDefined();
        expect(result.toolCall!.name).toBe('get_weather');
        
        // Type narrowing to make TS happy
        if (result.toolCall) {
            expect(result.toolCall.input.location).toBeTruthy();
            expect(typeof result.toolCall.input.location).toBe('string');
        }
    });
});
