import { Agent } from "../../src/core/Agent.js";
import { OllamaModel } from "../../src/core/models/OllamaModel.js";

/**
 * This example demonstrates running a local AI Agent using Ollama.
 * 
 * Prerequisites:
 * 1. Install Ollama (https://ollama.com)
 * 2. Pull a model: `ollama pull llama3.1`
 */

async function main() {
    console.log("🚀 Initializing local Ollama Agent...");

    const model = new OllamaModel("llama3.1");

    // 1. Check if Ollama is running
    const isConnected = await model.checkConnection();
    if (!isConnected) {
        console.error("❌ Error: Could not connect to Ollama. Make sure it's running (usually on port 11434).");
        process.exit(1);
    }
    console.log("✅ Connected to Ollama!");

    const agent = new Agent({
        model,
        systemPrompt: "You are a helpful local AI assistant running via Agent88."
    });

    console.log("\n--- Testing Standard Execution ---");
    const response = await agent.run("Tell me one sentence about why local LLMs are cool.");
    console.log("Agent:", response);

    console.log("\n--- Testing Streaming Execution ---");
    process.stdout.write("Agent: ");
    const stream = agent.stream("Explain what Agent88 is in 2 sentences.");
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
    console.log("\n\n✅ Test complete!");
}

main().catch(console.error);
