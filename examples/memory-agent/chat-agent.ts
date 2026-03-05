import { Agent, OpenAIModel, InMemoryMemory } from "../../src/index.js";
import * as readline from "readline";

if (!process.env.OPENAI_API_KEY) {
    console.warn("Please set OPENAI_API_KEY in your environment to run this example.");
    process.exit(1);
}

// 1. Initialize Adapters
const model = new OpenAIModel(process.env.OPENAI_API_KEY);
const memory = new InMemoryMemory();

// 2. Initialize the Agent
const agent = new Agent({
    model,
    memory, // Attach memory to maintain multi-turn context
    systemPrompt: "You are a highly capable coding assistant. Provide concise, accurate answers."
});

// Setup terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const CONTEXT_ID = "terminal-chat-session";

console.log("Agent88 Streaming Chat (Type 'exit' to quit)\n");

function promptUser() {
    rl.question("You: ", async (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close();
            return;
        }

        process.stdout.write("Agent: ");

        try {
            // Using agent.stream() to yield tokens in real-time
            const stream = agent.stream(input, CONTEXT_ID);

            for await (const chunk of stream) {
                process.stdout.write(chunk);
            }
            console.log("\n");
        } catch (err) {
            console.error("\nError:", err);
        }

        promptUser();
    });
}

// Start the loop
promptUser();
