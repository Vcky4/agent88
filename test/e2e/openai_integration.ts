import { Agent } from "../../src/core/Agent.js";
import { OpenAIModel } from "../../src/core/models/OpenAIModel.js";
import * as dotenv from "dotenv";

// Load environment variables if a .env file is present
dotenv.config();

async function run() {
    if (!process.env.OPENAI_API_KEY) {
        console.error("Please set OPENAI_API_KEY environment variable to run this test.");
        process.exit(1);
    }

    const agent = new Agent({
        model: new OpenAIModel(process.env.OPENAI_API_KEY)
    });

    agent.registerTool({
        name: "echo",
        description: "Echo input",
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
