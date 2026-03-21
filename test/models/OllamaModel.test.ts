import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OllamaModel } from '../../src/core/models/OllamaModel.js';
import type { ModelGenerateOptions } from '../../src/core/models/BaseModel.js';
import type { Message } from '../../src/types/index.js';

describe('OllamaModel Adapter', () => {
    let model: OllamaModel;

    beforeEach(() => {
        vi.resetAllMocks();
        model = new OllamaModel('llama3.1', 'http://localhost:11434');
        
        // Mock fetch globally
        vi.stubGlobal('fetch', vi.fn());
    });

    it('should translate messages to Ollama format and return standard text', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: {
                    role: 'assistant',
                    content: 'Hello from Ollama!'
                }
            })
        } as Response);

        const messages: Message[] = [
            { role: 'user', content: 'Say hello' }
        ];

        const response = await model.generate({ messages });

        expect(response.content).toBe('Hello from Ollama!');
        expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost:11434/api/chat',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"model":"llama3.1"')
            })
        );
    });

    it('should correctly parse tool calls from Ollama', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: {
                    role: 'assistant',
                    tool_calls: [{
                        function: {
                            name: 'get_weather',
                            arguments: { location: 'San Francisco' }
                        }
                    }]
                }
            })
        } as Response);

        const response = await model.generate({ messages: [{ role: 'user', content: 'Weather?' }] });

        expect(response.toolCall).toBeDefined();
        expect(response.toolCall?.name).toBe('get_weather');
        expect(response.toolCall?.input).toEqual({ location: 'San Francisco' });
    });

    it('should handle tool calls with stringified arguments', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: {
                    role: 'assistant',
                    tool_calls: [{
                        function: {
                            name: 'get_weather',
                            arguments: '{"location":"San Francisco"}'
                        }
                    }]
                }
            })
        } as Response);

        const response = await model.generate({ messages: [{ role: 'user', content: 'Weather?' }] });

        expect(response.toolCall?.input).toEqual({ location: 'San Francisco' });
    });

    it('should check connection correctly', async () => {
        const mockFetch = vi.mocked(fetch);
        mockFetch.mockResolvedValueOnce({ ok: true } as Response);

        const isConnected = await model.checkConnection();
        expect(isConnected).toBe(true);
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:11434/api/tags');

        mockFetch.mockRejectedValueOnce(new Error('Network error'));
        const connectedAfterError = await model.checkConnection();
        expect(connectedAfterError).toBe(false);
    });

    it('should handle streaming correctly', async () => {
        const mockFetch = vi.mocked(fetch);
        
        const mockStream = new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ message: { content: 'He' }, done: false }) + '\n'));
                controller.enqueue(new TextEncoder().encode(JSON.stringify({ message: { content: 'llo' }, done: true }) + '\n'));
                controller.close();
            }
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            body: mockStream
        } as unknown as Response);

        const stream = model.generateStream({ messages: [{ role: 'user', content: 'Hi' }] });
        
        let result = "";
        for await (const chunk of stream) {
            result += chunk;
        }

        expect(result).toBe('Hello');
    });
});
