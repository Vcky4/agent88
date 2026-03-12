# Getting Started with Agent88

Agent88 is an open-source AI infrastructure framework designed to help developers build production-ready AI agents with ease. Think of it like Express.js — but for modular AI Agents.

This guide will walk you through building your first agent, plugging in tools, and adding memory.

---

## 1. Prerequisites

Before you begin, ensure you have:
* **Node.js**: v18 or later
* **TypeScript**: Because Agent88 is strictly typed
* **API Keys**: OpenAI (`OPENAI_API_KEY`) or Gemini (`GEMINI_API_KEY`)

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

*(Note: Agent88 uses a pluggable adapter pattern. Depending on your model choice, you will also need to install the peer dependency: `npm install openai` or `npm install @google/generative-ai`)*

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

*(You can seamlessly swap `OpenAIModel` with `GeminiModel(process.env.GEMINI_API_KEY!)` if you prefer Google's logic!)*

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

## 7. Multi-Agent Graphs

For complex workflows, compose multiple agents into a pipeline using `AgentGraph`. Each agent's output is piped as the input to the next.

```typescript
import { Agent, AgentGraph, OpenAIModel, GeminiModel } from "agent88";

const openAiKey = process.env.OPENAI_API_KEY!;
const geminiKey = process.env.GEMINI_API_KEY!;

// Create specialized agents (You can mix models!)
const researchAgent = new Agent({
    model: new OpenAIModel(openAiKey),
    systemPrompt: "You are a researcher. Provide 3 key facts on the given topic."
});

const summaryAgent = new Agent({
    model: new GeminiModel(geminiKey),
    systemPrompt: "You are a summarizer. Condense the input into one sentence."
});

// Build the graph
const graph = new AgentGraph();
graph.add("research", researchAgent);
graph.add("summary", summaryAgent);
graph.connect("research", "summary");

const result = await graph.run("Quantum computing");
console.log(result); // One-sentence summary of research findings
```

> **Note:** Each agent in the graph has isolated memory. Data flows between agents via output piping, not shared state.

---

## Where to Next?

- 💡 **[See more Examples](./examples.md)** — Weather agents, planner loops, and multi-agent graphs.
- 🏗️ **[Read the Architecture](./architecture.md)** — ExecutionEngine, Agent Graph, Onion Routing, and interfaces.
- 🤝 **[Contributing](../CONTRIBUTING.md)** — Build custom model adapters or memory layers for the community.
