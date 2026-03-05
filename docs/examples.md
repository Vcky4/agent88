# Usage Examples

Complete, runnable examples showing how to build agents with Agent88.

> **Prerequisites:** All examples require an OpenAI API key set as `OPENAI_API_KEY` in your environment or `.env` file.

---

## 🌦️ Weather Agent

A simple agent with a single tool that fetches weather data. Demonstrates the core **tool execution loop** — the model decides when to call a tool, and Agent88 handles the rest.

```typescript
import { Agent, OpenAIModel, InMemoryMemory } from "agent88";

const agent = new Agent({
    model: new OpenAIModel(process.env.OPENAI_API_KEY!),
    memory: new InMemoryMemory(),
    systemPrompt: "You are a helpful weather assistant. Use the getWeather tool to answer weather questions.",
    maxIterations: 5
});

// Register a weather tool
agent.registerTool({
    name: "getWeather",
    description: "Gets the current weather for a given location.",
    parameters: {
        type: "object",
        properties: {
            location: { type: "string", description: "City name, e.g. 'Miami'" }
        },
        required: ["location"]
    },
    execute: async ({ location }) => {
        // Replace with a real weather API in production
        const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"];
        const temp = Math.floor(Math.random() * 30) + 60;
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        return JSON.stringify({ location, temperature: `${temp}°F`, condition });
    }
});

// Run the agent
const response = await agent.run("What's the weather like in Miami?", "weather_session");
console.log(response);

// Follow-up (memory preserves context)
const followUp = await agent.run("How about in New York?", "weather_session");
console.log(followUp);
```

**What happens under the hood:**
1. The model receives the prompt and available tools
2. It decides to call `getWeather` with `{ location: "Miami" }`
3. Agent88's ExecutionEngine runs the tool and feeds the result back
4. The model generates a natural language response using the tool output

---

## 💬 Chat Agent

A conversational agent with memory and **streaming** support. No tools — purely demonstrating multi-turn context and real-time token output.

```typescript
import { Agent, OpenAIModel, InMemoryMemory } from "agent88";

const agent = new Agent({
    model: new OpenAIModel(process.env.OPENAI_API_KEY!, "gpt-4o-mini"),
    memory: new InMemoryMemory(),
    systemPrompt: `You are a friendly AI companion named Aria. 
You remember previous messages and maintain a warm, engaging tone. 
Keep responses concise but thoughtful.`,
    maxIterations: 1
});

// --- Standard run (full response) ---
const greeting = await agent.run("Hey! What's your name?", "chat_session");
console.log("Aria:", greeting);

// --- Streaming run (token by token) ---
process.stdout.write("Aria: ");
const stream = agent.stream("Tell me a short joke", "chat_session");
for await (const chunk of stream) {
    process.stdout.write(chunk);
}
console.log(); // newline

// --- Multi-turn context (memory kicks in) ---
const contextual = await agent.run("What was the joke about?", "chat_session");
console.log("Aria:", contextual);
```

**Key concepts demonstrated:**
- `agent.stream()` yields chunks as an `AsyncGenerator<string>` for real-time UIs
- `InMemoryMemory` tracks conversation history per `contextId`
- The same `contextId` (`"chat_session"`) links all messages together

---

## 📋 Planner Agent

A multi-tool agent that can **create and list tasks** — showing how Agent88 handles iterative reasoning across multiple tool calls in a single run.

```typescript
import { Agent, OpenAIModel, InMemoryMemory } from "agent88";

// In-memory task store
const tasks: { id: number; title: string; priority: string }[] = [];
let nextId = 1;

const agent = new Agent({
    model: new OpenAIModel(process.env.OPENAI_API_KEY!),
    memory: new InMemoryMemory(),
    systemPrompt: `You are a project planner assistant. 
Use the createTask tool to add tasks and listTasks to show current tasks.
When the user asks you to plan something, break it down into actionable tasks and create each one.`,
    maxIterations: 10
});

agent.registerTool({
    name: "createTask",
    description: "Creates a new task with a title and priority level.",
    parameters: {
        type: "object",
        properties: {
            title: { type: "string", description: "Task title" },
            priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority level" }
        },
        required: ["title", "priority"]
    },
    execute: async ({ title, priority }) => {
        const task = { id: nextId++, title, priority };
        tasks.push(task);
        return JSON.stringify({ success: true, task });
    }
});

agent.registerTool({
    name: "listTasks",
    description: "Lists all current tasks.",
    parameters: { type: "object", properties: {} },
    execute: async () => {
        return JSON.stringify({ tasks, total: tasks.length });
    }
});

// The model will make MULTIPLE tool calls in a single run
const plan = await agent.run(
    "Plan a launch for our new mobile app. Create 3-4 key tasks with appropriate priorities.",
    "planner_session"
);
console.log(plan);

// Follow up — the model calls listTasks to see what exists
const summary = await agent.run("Show me all the tasks", "planner_session");
console.log(summary);
```

**What this demonstrates:**
- **Multi-iteration reasoning**: The model calls `createTask` multiple times in one `agent.run()` call, with the ExecutionEngine automatically looping until the model produces a final text response
- **`maxIterations: 10`**: Allows enough room for the model to create several tasks before summarizing
- **Tool composition**: Multiple tools cooperating within the same agent

---

## 🔌 Adding Middleware

You can wrap any agent with Express-style middleware for logging, guardrails, or analytics:

```typescript
// Log every execution
agent.use(async (ctx, next) => {
    console.log(`[LOG] Incoming messages: ${ctx.messages.length}`);
    const start = Date.now();

    await next(); // Run the ExecutionEngine core loop

    const duration = Date.now() - start;
    console.log(`[LOG] Completed in ${duration}ms — Response: ${ctx.response?.content?.slice(0, 80)}...`);
});

// Content guardrail
agent.use(async (ctx, next) => {
    const lastMessage = ctx.messages[ctx.messages.length - 1];
    if (lastMessage?.content.includes("forbidden_word")) {
        ctx.response = { content: "I'm sorry, I can't help with that." };
        return; // Skip execution entirely
    }
    await next();
});
```

---

## Next Steps

- [Getting Started](./getting-started.md) — Install and build your first agent
- [Architecture](./architecture.md) — Deep dive into Agent88's internals
- [Contributing](./contributing.md) — Build custom tools, adapters, and modules
