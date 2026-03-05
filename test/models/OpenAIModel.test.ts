import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIModel } from '../../src/core/models/OpenAIModel.js';
import type { ModelGenerateOptions } from '../../src/core/models/BaseModel.js';
import type { Message } from '../../src/types/index.js';
import type { Tool } from '../../src/core/tools/Tool.js';

// Mock the entire openAI node module
vi.mock('openai', () => {
    return {
        default: class MockOpenAI {
            public chat = {
                completions: {
                    create: vi.fn()
                }
            };
        }
    };
});

describe('OpenAIModel Adapter', () => {
    let model: OpenAIModel;
    let mockCreate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        model = new OpenAIModel('test-api-key');
        // Retrieve the mocked create function to manipulate its return value per test
        mockCreate = (model as any).client.chat.completions.create;
    });

    it('should translate Agent88 messages to OpenAI format and return standard text', async () => {
        // Setup the mock response from OpenAI
        mockCreate.mockResolvedValueOnce({
            choices: [{
                message: {
                    content: 'Hello from OpenAI!',
                    role: 'assistant'
                }
            }]
        });

        const messages: Message[] = [
            { role: 'user', content: 'Say hello' }
        ];

        const options: ModelGenerateOptions = { messages };

        const response = await model.generate(options);

        // Verify the Agent88 ModelResponse structure
        expect(response.content).toBe('Hello from OpenAI!');
        expect(response.toolCall).toBeUndefined();

        // Verify the payload sent TO OpenAI was formatted correctly
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'Say hello' }],
            tools: undefined
        }));
    });

    it('should correctly map tools and extract an OpenAI tool call request', async () => {
        // Setup the mock response where OpenAI decides to call a tool
        mockCreate.mockResolvedValueOnce({
            choices: [{
                message: {
                    role: 'assistant',
                    content: null,
                    tool_calls: [{
                        id: 'call_123',
                        type: 'function',
                        function: {
                            name: 'getWeather',
                            arguments: '{"location":"London"}'
                        }
                    }]
                }
            }]
        });

        const messages: Message[] = [
            { role: 'user', content: 'What is the weather in London?' }
        ];

        const inputTools: Tool[] = [
            {
                name: 'getWeather',
                description: 'Get weather for a city',
                parameters: {
                    type: 'object',
                    properties: {
                        city: { type: 'string' }
                    }
                },
                execute: async () => 'Warm'
            }
        ];
        const options: ModelGenerateOptions = { messages, tools: inputTools };

        const response = await model.generate(options);

        // Verify the Agent88 ModelResponse translated the tool call cleanly
        expect(response.content).toBeUndefined();
        expect(response.toolCall).toBeDefined();
        expect(response.toolCall?.name).toBe('getWeather');
        expect(response.toolCall?.input).toEqual({ location: 'London' });

        // Verify the tools were sent TO OpenAI correctly
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            tools: [
                expect.objectContaining({
                    type: 'function',
                    function: expect.objectContaining({
                        name: 'getWeather',
                        parameters: expect.objectContaining({
                            type: 'object',
                            properties: {
                                city: { type: 'string' }
                            }
                        })
                    })
                })
            ]
        }));
    });

    it('should correctly format intermediate assistant tool calls and map tool result IDs', async () => {
        // Mock a final text response after the tool finishes
        mockCreate.mockResolvedValueOnce({
            choices: [{
                message: {
                    role: 'assistant',
                    content: 'The weather is Rainy.'
                }
            }]
        });

        // This simulates the state of the conversation history midway through the ExecutionEngine loop
        const messages: Message[] = [
            { role: 'user', content: 'What is the weather in London?' },
            {
                role: 'assistant',
                content: '',
                toolCall: { name: 'getWeather', input: { location: 'London' } }
            },
            { role: 'tool', content: '"Rainy"' }
        ];

        const options: ModelGenerateOptions = { messages };

        await model.generate(options);

        // The critical test is verifying the payload sent TO openai contains matching IDs
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            messages: [
                { role: 'user', content: 'What is the weather in London?' },
                {
                    role: 'assistant',
                    content: '',
                    tool_calls: [{
                        id: 'call_getWeather',
                        type: 'function',
                        function: { name: 'getWeather', arguments: '{"location":"London"}' }
                    }]
                },
                {
                    role: 'tool',
                    content: '"Rainy"',
                    tool_call_id: 'call_getWeather' // MUST match the assistant ID above
                }
            ]
        }));
    });

    it('should natively yield text chunks via the generateStream interface', async () => {
        // Setup a mock AsyncIterable for the OpenAI streaming response
        mockCreate.mockResolvedValueOnce({
            async *[Symbol.asyncIterator]() {
                yield { choices: [{ delta: { content: "He" } }] };
                yield { choices: [{ delta: { content: "llo" } }] };
                yield { choices: [{ delta: { content: " Str" } }] };
                yield { choices: [{ delta: { content: "eam" } }] };
            }
        });

        const messages: Message[] = [{ role: 'user', content: 'Stream test' }];
        const options: ModelGenerateOptions = { messages };

        const stream = model.generateStream(options);

        let fullOutput = "";
        for await (const chunk of stream) {
            fullOutput += chunk;
        }

        // Verify the chunks were captured and yielded cleanly by the adapter
        expect(fullOutput).toBe("Hello Stream");

        // Verify it sent the streaming flag downstream
        expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
            stream: true,
            messages: [{ role: 'user', content: 'Stream test' }]
        }));
    });
});
