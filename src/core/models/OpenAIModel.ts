import OpenAI from "openai";
import type { BaseModel, ModelGenerateOptions, ModelResponse } from "./BaseModel.js";

export class OpenAIModel implements BaseModel {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model = "gpt-4o-mini") {
        this.client = new OpenAI({ apiKey });
        this.model = model;
    }

    async generate(input: ModelGenerateOptions): Promise<ModelResponse> {
        const response = await this.client.chat.completions.create({
            model: this.model,
            messages: this.formatMessages(input.messages),
            tools: this.formatTools(input.tools)
        });

        return this.parseResponse(response);
    }

    private formatMessages(messages: any[]): any[] {
        let currentToolCallId = 'call_unknown'; // State to map tool results back to their caller

        return messages.map(m => {
            const base: any = {
                role: m.role,
                // OpenAI strongly prefers string content for tools. 
                // If the engine provided undefined/null (which can happen on empty object returns), fallback to empty string.
                content: m.content || ""
            };

            // Re-inject the tool call structure for assistant messages if present
            if (m.role === 'assistant' && m.toolCall) {
                currentToolCallId = 'call_' + m.toolCall.name;

                base.tool_calls = [{
                    id: currentToolCallId,
                    type: 'function',
                    function: {
                        name: m.toolCall.name,
                        arguments: JSON.stringify(m.toolCall.input)
                    }
                }];
            } else if (m.role === 'tool') {
                base.tool_call_id = currentToolCallId; // OpenAI requires an ID matching the assistant's call
            }

            return base;
        });
    }

    private formatTools(tools?: any[]): any {
        if (!tools || tools.length === 0) return undefined;

        return tools.map(tool => ({
            type: "function",
            function: {
                name: tool.name,
                description: tool.description,
                parameters: {
                    type: "object",
                    properties: {
                        text: { type: "string" },
                        location: { type: "string" }
                    },
                    additionalProperties: true
                }
            }
        }));
    }

    private parseResponse(response: any): ModelResponse {
        const message = response.choices[0].message;

        if (message.tool_calls && message.tool_calls.length > 0) {
            const toolCall = message.tool_calls[0];

            return {
                toolCall: {
                    name: toolCall.function.name,
                    input: JSON.parse(toolCall.function.arguments || "{}")
                }
            };
        }

        return {
            content: message.content
        };
    }
}
