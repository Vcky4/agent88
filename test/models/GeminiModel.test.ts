import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiModel } from '../../src/core/models/GeminiModel.js';
import type { ModelGenerateOptions } from '../../src/core/models/BaseModel.js';

// Shared mock instance so we can inspect it in tests
export const mockGenerateContent = vi.fn().mockResolvedValue({
    response: {
        text: () => 'Mock response from Gemini',
        functionCalls: () => undefined
    }
});

// Mock the Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class {
            constructor() {}
            getGenerativeModel() {
                return {
                    generateContent: mockGenerateContent,
                    generateContentStream: vi.fn().mockResolvedValue({
                        stream: (async function* () {
                            yield { text: () => 'Chunk 1 ' };
                            yield { text: () => 'Chunk 2' };
                        })()
                    })
                };
            }
        }
    };
});

describe('GeminiModel', () => {
    let model: GeminiModel;

    beforeEach(() => {
        model = new GeminiModel('fake-api-key');
        vi.clearAllMocks();
    });

    it('should generate text content', async () => {
        const result = await model.generate({
            messages: [{ role: 'user', content: 'Hello' }]
        });

        expect(result.content).toBe('Mock response from Gemini');
        expect(result.toolCall).toBeUndefined();
    });

    it('should correctly format system instructions and user messages', async () => {
        mockGenerateContent.mockResolvedValueOnce({
            response: { text: () => 'Response', functionCalls: () => undefined }
        });

        const testModel = new GeminiModel('fake-key');

        const options: ModelGenerateOptions = {
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: 'Hello' }
            ]
        };

        await testModel.generate(options);

        expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
            systemInstruction: {
                role: 'system',
                parts: [{ text: 'You are a helpful assistant.' }]
            },
            contents: [
                { role: 'user', parts: [{ text: 'Hello' }] }
            ]
        }));
    });

    it('should stream generated content', async () => {
        const stream = await model.generateStream!({
            messages: [{ role: 'user', content: 'Stream test' }]
        });

        const chunks: string[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        expect(chunks).toEqual(['Chunk 1 ', 'Chunk 2']);
    });
});
