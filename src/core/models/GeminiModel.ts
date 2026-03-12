import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FunctionDeclaration, Content, Part, Tool as GeminiTool } from "@google/generative-ai";
import type { BaseModel, ModelGenerateOptions, ModelResponse } from "./BaseModel.js";

export class GeminiModel implements BaseModel {
    private client: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, model = "gemini-2.5-flash") {
        this.client = new GoogleGenerativeAI(apiKey);
        this.model = model;
    }

    async generate(input: ModelGenerateOptions): Promise<ModelResponse> {
        const generativeModel = this.client.getGenerativeModel({ model: this.model });
        
        const request: any = {
            contents: this.formatMessages(input.messages)
        };

        const tools = this.formatTools(input.tools);
        if (tools) {
            request.tools = tools;
        }

        const systemInstruction = this.extractSystemInstruction(input.messages);
        if (systemInstruction) {
             request.systemInstruction = {
                role: "system",
                parts: [{ text: systemInstruction }]
             };
        }

        const response = await generativeModel.generateContent(request);
        const result = response.response;

        return this.parseResponse(result);
    }

    async *generateStream(input: ModelGenerateOptions): AsyncGenerator<string> {
        const generativeModel = this.client.getGenerativeModel({ model: this.model });
        
        const request: any = {
            contents: this.formatMessages(input.messages)
        };

        const tools = this.formatTools(input.tools);
        if (tools) {
            request.tools = tools;
        }

        const systemInstruction = this.extractSystemInstruction(input.messages);
         if (systemInstruction) {
             request.systemInstruction = {
                role: "system",
                parts: [{ text: systemInstruction }]
             };
        }

        const result = await generativeModel.generateContentStream(request);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                yield chunkText;
            }
        }
    }
    
    private extractSystemInstruction(messages: any[]): string | undefined {
        const systemMessage = messages.find(m => m.role === 'system');
        return systemMessage ? systemMessage.content : undefined;
    }

    private formatMessages(messages: any[]): Content[] {
        // Filter out system messages as they are handled via systemInstruction
        const conversationMessages = messages.filter(m => m.role !== 'system');
        
        return conversationMessages.map((m, i) => {
            const parts: Part[] = [];

            if (m.role === 'assistant') {
                if (m.content) {
                    parts.push({ text: m.content });
                }
                if (m.toolCall) {
                    parts.push({
                        functionCall: {
                            name: m.toolCall.name,
                            args: m.toolCall.input
                        }
                    });
                }
                return { role: 'model', parts };
            } else if (m.role === 'tool') {
                // In Agent88, tool role means the result of a tool execution.
                // We need to match the structure Gemini expects for function responses.
                // Agent88 stores the result as a JSON string in block.content
                let responseObj: any;
                try {
                     const parsed = JSON.parse(m.content);
                     if (typeof parsed === 'object' && parsed !== null) {
                         responseObj = parsed;
                     } else {
                         responseObj = { result: parsed };
                     }
                } catch {
                     responseObj = { result: m.content };
                }

                let functionName = "unknown_function";
                // In Agent88, the message immediately preceding a 'tool' message is the 'assistant' message that called it
                const prev = conversationMessages[i - 1];
                if (prev && prev.role === 'assistant' && prev.toolCall) {
                    functionName = prev.toolCall.name;
                }

                return {
                    role: 'function',
                    parts: [{
                        functionResponse: {
                            name: functionName,
                            response: responseObj
                        }
                    }]
                };
            } else {
                // User message
                parts.push({ text: m.content || "" });
                return { role: 'user', parts };
            }
        });
    }

    private formatTools(tools?: any[]): GeminiTool[] | undefined {
        if (!tools || tools.length === 0) return undefined;

        const functionDeclarations: FunctionDeclaration[] = tools.map((tool: any) => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as any // Assuming JSON Schema formats match closely enough
        }));

        return [{
            functionDeclarations
        }];
    }

    private parseResponse(response: any): ModelResponse {
        const functionCalls = response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            return {
                toolCall: {
                    name: call.name,
                    input: call.args
                }
            };
        }

        return {
            content: response.text()
        };
    }
}
