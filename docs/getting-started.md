# Getting Started with Agent88

Agent88 is an open-source AI infrastructure framework designed to help developers build production-ready AI agents with ease. Think of it like Express.js — but for modular AI Agents.

This guide will walk you through building your first agent, plugging in tools, and adding memory.

---

## 1. Prerequisites

Before you begin, ensure you have:
* **Node.js**: v18 or later
* **TypeScript**: Because Agent88 is strictly typed
* **OpenAI API Key**: For the `OpenAIModel` adapter

---

## 2. Installation

Install the core package using your preferred package manager:

```bash
# npm
npm install agent88

# pnpm
pnpm add agent88

# yarn
yarn add agent88
```

*(Note: Agent88 uses a pluggable adapter pattern. If you plan to use the `OpenAIModel` adapter, you will also need to install the `openai` package as a peer dependency: `npm install openai`)*

---

## 3. Your First Agent

Let's build a basic agent that uses OpenAI to respond to prompts. Create a file called `index.ts`:

```typescript
import { Agent, OpenAIModel } from "agent88";

async function main() {
    // 1. Initialize the agent with your configuration
    const agent = new Agent({
        model: new OpenAIModel(process.env.OPENAI_API_KEY!),
        systemPrompt: "You are a helpful, concise AI assistant.",
        maxIterations: 5
    });

    // 2. Run the agent
    console.log("Running agent...");
    const response = await agent.run("What is Agent88?");
    
    console.log("\nResponse:", response);
}

main().catch(console.error);
```

Run it (make sure you have your environment variables set):
```bash
OPENAI_API_KEY="sk-..." npx tsx index.ts
```

---

## 4. Extending with Tools (Plugins)

AI Agents are powerful because they can *do* things. Let's give our agent a tool to search the current time.

```typescript
import { Agent, OpenAIModel } from "agent88";

async function main() {
    const agent = new Agent({
        model: new OpenAIModel(process.env.OPENAI_API_KEY!),
        systemPrompt: "You are an assistant with access to real-time tools.",
    });

    // Register a capability
    agent.registerTool({
        name: "getCurrentTime",
        description: "Returns the current UTC time.",
        // JSONSchema for the arguments this tool expects (empty here)
        parameters: { type: "object", properties: {} }, 
        execute: async () => {
            console.log("[Tool Execution] Fetching time...");
            return new Date().toISOString();
        }
    });

    // The ExecutionEngine handles the loop automatically!
    const response = await agent.run("What time is it right now?");
    console.log("Response:", response);
}

main().catch(console.error);
```

When you run this, you'll see the agent detect that it needs the time, call your tool, receive the output, and format a final natural language answer.

---

## 5. Adding Memory for Context

By default, agents are stateless. To enable multi-turn conversations, plug in a `MemoryAdapter`. Agent88 ships with an `InMemoryMemory` adapter for quick starts.

```typescript
import { Agent, OpenAIModel, InMemoryMemory } from "agent88";

async function main() {
    // 1. Instantiate the memory adapter
    const memory = new InMemoryMemory();

    const agent = new Agent({
        model: new OpenAIModel(process.env.OPENAI_API_KEY!),
        memory: memory // 2. Pass it to the agent
    });

    // 3. Provide a 'contextId' to keep track of the session
    const sessionId = "user_123_session";

    console.log(await agent.run("Hi! My name is Alice.", sessionId));
    console.log(await agent.run("Can you remember my name?", sessionId));
}

main().catch(console.error);
```

For production, you can easily swap `InMemoryMemory` for `RedisMemory`:
```typescript
import { RedisMemory } from "agent88";
// Connected to redis://localhost:6379 by default
const memory = new RedisMemory(); 
```

---

## 6. Real-time Streaming

If you're building a UI, you often need responses token-by-token. Use the `agent.stream()` async generator.

```typescript
async function streamExample() {
    const stream = agent.stream("Write a short poem about coding.", "session_1");
    
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
}
```

*(Note: In v0.1, streaming bypasses the tool execution loop and focuses purely on text generation.)*

---

## Where to Next?

- 💡 **[See more Examples](./examples.md)** — Check out full weather agents and planner loops.
- 🏗️ **[Read the Architecture](./architecture.md)** — Understand the ExecutionEngine, Onion Routing, and interfaces.
- 🤝 **[Contributing](../CONTRIBUTING.md)** — Learn how to build custom model adapters or memory layers for the community.
