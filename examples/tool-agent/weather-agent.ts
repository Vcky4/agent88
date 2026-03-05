import { Agent, OpenAIModel } from "../../src/index.js";

// Ensure API key is available
if (!process.env.OPENAI_API_KEY) {
    console.warn("Please set OPENAI_API_KEY in your environment to run this example.");
    process.exit(1);
}

// 1. Initialize the Adapter
const model = new OpenAIModel(process.env.OPENAI_API_KEY);

// 2. Initialize the Agent
const agent = new Agent({
    model,
    systemPrompt: "You are a helpful weather assistant. Always be polite.",
    maxIterations: 3
});

// 3. Register a custom Weather Tool
agent.registerTool({
    name: "getWeather",
    description: "Get the current weather for a specific city.",
    parameters: {
        type: "object",
        properties: {
            city: { type: "string" },
            unit: { type: "string", enum: ["celsius", "fahrenheit"] }
        },
        required: ["city"]
    },
    execute: async (input) => {
        console.log(`\n[Tool Execution] Fetching weather for ${input.city}...`);

        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            city: input.city,
            temperature: 72,
            condition: "Sunny",
            unit: input.unit || "fahrenheit"
        };
    }
});

// 4. Optionally: Add Observability Middleware
agent.use(async (ctx, next) => {
    // We can interact with the trace object here before or after the run!
    console.log("\n[Middleware] Starting Agent Run...");
    await next();

    console.log("\n[Middleware] Run Complete. Trace Events recorded:");
    const traces = ctx.trace.getEvents().map(t => ({
        event: t.name,
        duration: `${t.durationMs}ms`,
        metadata: t.metadata
    }));
    console.table(traces);
});

// 5. Run the Agent
async function main() {
    console.log("User: What's the weather like in Seattle today?");
    const response = await agent.run("What's the weather like in Seattle today?");

    console.log(`\nAgent: ${response}`);
}

main().catch(console.error);
