import { Agent } from "../../src/core/Agent.js";
import { OllamaModel } from "../../src/core/models/OllamaModel.js";

/**
 * This integration test demonstrates running a local AI Agent using Ollama.
 * 
 * Prerequisites:
 * 1. Install Ollama (https://ollama.com)
 * 2. Pull a model: `ollama pull llama3.1` (or change the model name below)
 */

async function run() {
    console.log("🚀 Initializing local Ollama Agent E2E Test...");

    // Default to llama3.1, or use OLLAMA_MODEL env if provided
    const modelName = process.env.OLLAMA_MODEL || "llama3.1";
    const model = new OllamaModel(modelName);

    // 1. Check if Ollama is running
    const isConnected = await model.checkConnection();
    if (!isConnected) {
        console.error("❌ Error: Could not connect to Ollama. Make sure it's running (usually on port 11434).");
        process.exit(1);
    }
    console.log(`✅ Connected to Ollama! (Using model: ${modelName})`);

    const agent = new Agent({
        model,
        systemPrompt: "You are a helpful local AI assistant. When asked to echo, use the echo tool."
    });

    // 2. Register a simple tool to test tool calling
    agent.registerTool({
        name: "echo",
        description: "Echo input text",
        parameters: {
            type: "object",
            properties: {
                text: { type: "string" }
            },
            required: ["text"]
        },
        async execute(input: any) {
            console.log(">>> TOOL EXECUTED WITH:", input);
            return `Echoed: ${input.text}`;
        }
    });

    console.log("\n--- Testing Standard Execution with Tool Calling ---");
    const response = await agent.run("Call the echo tool with the text 'Hello from Ollama E2E!'");
    
    console.log("\nFinal Result:");
    console.log(response);

    console.log("\n--- Testing Streaming Execution ---");
    process.stdout.write("Agent: ");
    const stream = agent.stream("Say 'Streaming test successful!' in one short sentence.");
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
    console.log("\n\n✅ Ollama E2E Test complete!");
}

run().catch(console.error);
