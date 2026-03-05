import { Agent, OpenAIModel } from "../../src/index.js";

if (!process.env.OPENAI_API_KEY) {
    console.warn("Please set OPENAI_API_KEY in your environment to run this example.");
    process.exit(1);
}

const model = new OpenAIModel(process.env.OPENAI_API_KEY);

// We configure a high iteration limit to allow the agent to reason through multiple steps
const agent = new Agent({
    model,
    systemPrompt: "You are a project management assistant. You can create tasks and list tasks. Break down the user's request into actionable items and add them to the system.",
    maxIterations: 10
});

// Mock Database
const DATABASE: string[] = [];

// Tool 1: Create Task
agent.registerTool({
    name: "createTask",
    description: "Create a new task in the project management system.",
    parameters: {
        type: "object",
        properties: {
            title: { type: "string", description: "The title of the task" }
        },
        required: ["title"]
    },
    execute: async (input) => {
        console.log(`\n[Database] Adding task: "${input.title}"`);
        DATABASE.push(input.title);
        return { success: true, id: DATABASE.length, title: input.title };
    }
});

// Tool 2: List Tasks
agent.registerTool({
    name: "listTasks",
    description: "Get a list of all current tasks.",
    execute: async () => {
        console.log(`\n[Database] Fetching all tasks...`);
        return { tasks: DATABASE };
    }
});

async function main() {
    console.log("User: Please create a plan for launching our new website. I need tasks for design, frontend, backend, and marketing. Then show me the final list.");

    console.log("\n--- Agent Reasoning & Execution Loop Start ---");

    const response = await agent.run(
        "Please create a plan for launching our new website. I need tasks for design, frontend, backend, and marketing. Then show me the final list."
    );

    console.log("\n--- Agent Response ---");
    console.log(response);
}

main().catch(console.error);
