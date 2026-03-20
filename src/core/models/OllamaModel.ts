import type { BaseModel, ModelGenerateOptions, ModelResponse } from "./BaseModel.js";

export class OllamaModel implements BaseModel {
    private endpoint: string;
    private model: string;

    constructor(model = "llama3.1", endpoint = "http://localhost:11434") {
        this.model = model;
        this.endpoint = endpoint;
    }

    /**
     * Verifies that the Ollama service is active and responsive.
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.endpoint}/api/tags`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async generate(input: ModelGenerateOptions): Promise<ModelResponse> {
        const response = await fetch(`${this.endpoint}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.model,
                messages: this.formatMessages(input.messages),
                tools: this.formatTools(input.tools),
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama error: ${error}`);
        }

        const data = await response.json();
        return this.parseResponse(data);
    }

    async *generateStream(input: ModelGenerateOptions): AsyncGenerator<string> {
        const response = await fetch(`${this.endpoint}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.model,
                messages: this.formatMessages(input.messages),
                tools: this.formatTools(input.tools),
                stream: true
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama error: ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Readable stream not supported");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const chunk = JSON.parse(line);
                    if (chunk.message?.content) {
                        yield chunk.message.content;
                    }
                    if (chunk.done) break;
                } catch (e) {
                    console.error("Error parsing stream chunk", e);
                }
            }
        }
    }

    private formatMessages(messages: any[]): any[] {
        return messages.map(m => {
            const res: any = {
                role: m.role,
                content: m.content || ""
            };

            if (m.role === 'assistant' && m.toolCall) {
                res.tool_calls = [{
                    function: {
                        name: m.toolCall.name,
                        arguments: m.toolCall.input
                    }
                }];
            } else if (m.role === 'tool') {
                // Ollama doesn't strictly require IDs for tools in the same way OpenAI does,
                // but it expects the content to be the result.
            }

            return res;
        });
    }

    private formatTools(tools?: any[]): any {
        if (!tools || tools.length === 0) return undefined;

        return tools.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: tool.parameters ?? {
                    type: "object",
                    properties: {},
                    additionalProperties: true
                }
            }
        }));
    }

    private parseResponse(data: any): ModelResponse {
        const message = data.message;

        if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];
            let args = toolCall.function.arguments;
            
            // Ollama sometimes returns arguments as a string, sometimes as an object
            if (typeof args === 'string') {
                try {
                    args = JSON.parse(args);
                } catch (e) {
                    // Fallback to raw string if parsing fails
                }
            }

            return {
                toolCall: {
                    name: toolCall.function.name,
                    input: args
                }
            };
        }

        return {
            content: message.content
        };
    }
}
