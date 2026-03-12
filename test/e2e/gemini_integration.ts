import { Agent } from "../../src/core/Agent.js";
import { GeminiModel } from "../../src/core/models/GeminiModel.js";
import * as dotenv from "dotenv";

// Load environment variables if a .env file is present
dotenv.config();

async function run() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Please set GEMINI_API_KEY environment variable to run this test.");
        process.exit(1);
    }

    const agent = new Agent({
        model: new GeminiModel(process.env.GEMINI_API_KEY)
    });

    agent.registerTool({
        name: "echo",
        description: "Echo input",
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

    console.log("Starting run...");
    const result = await agent.run("Call echo with text hello");

    console.log("\nFinal Result:");
    console.log(result);
}

run().catch(console.error);
