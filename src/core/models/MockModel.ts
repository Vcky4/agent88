import type { BaseModel, ModelGenerateOptions, ModelResponse } from "./BaseModel.js";

/**
 * A mock model implementation used for testing the execution loop
 * without incurring API costs or requiring network requests.
 * 
 * It can be configured with predefined responses or simulated tool calls.
 */
export class MockModel implements BaseModel {
    private responses: ModelResponse[];
    private callCount = 0;

    /**
     * @param predefinedResponses An array of responses the mock should return in sequence.
     * If it runs out of predefined responses, it will return a default text response.
     */
    constructor(predefinedResponses: ModelResponse[] = []) {
        this.responses = predefinedResponses;
    }

    async generate(options: ModelGenerateOptions): Promise<ModelResponse> {
        this.callCount++;

        // Return the next predefined response if available
        if (this.responses.length > 0) {
            return this.responses.shift()!;
        }

        // Default fallback behavior: simulate a simple text response
        return {
            content: `Mock response (Call #${this.callCount})`
        };
    }

    /**
     * Utility method to check how many times the model was called during a test.
     */
    getCallCount(): number {
        return this.callCount;
    }

    /**
     * Utility method to dynamically add more responses during execution.
     */
    addResponse(response: ModelResponse): void {
        this.responses.push(response);
    }
}
