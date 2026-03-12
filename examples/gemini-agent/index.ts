import { Agent } from "../../src/core/Agent.js";
import { GeminiModel } from "../../src/core/models/GeminiModel.js";
import * as dotenv from "dotenv";

// Load environment variables if a .env file is present
dotenv.config();

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Please set GEMINI_API_KEY environment variable to run this example.");
        process.exit(1);
    }

    // 1. Initialize the agent with your configuration
    const agent = new Agent({
        model: new GeminiModel(process.env.GEMINI_API_KEY, "gemini-2.5-flash"),
        systemPrompt: "You are a highly capable AI assistant powered by Google's Gemini. Keep your answers concise.",
        maxIterations: 5
    });

    console.log("🚀 Running Gemini Agent...\n");

    const prompt = "Explain the difference between a language model and an agent.";
    console.log(`Input: "${prompt}"\n`);

    // 2. Run the agent
    const response = await agent.run(prompt);
    
    console.log("🤖 Gemini's Response:\n");
    console.log(response);
}

main().catch(console.error);
