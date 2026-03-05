# Agent88

### AI Agent Runtime Framework for Node.js

Agent88 is an open-source AI infrastructure framework designed to help developers build production-ready AI agents with ease. 

**Think of it like Express.js—but for modular AI Agents.**

---

## Features

Agent88 abstracts the heavy lifting so you can focus on building intelligence:
- ✅ **Clean Agent API**: Simple orchestration of complex ML layers.
- ✅ **Execution Engine Loop**: Automatically handles recursive LLM reasoning, detects intent, and controls iteration counts.
- ✅ **Tool execution (Plugins)**: A strict Tool Registry enabling seamless multi-action tool execution within AI reasoning runs via robust JSONSchemas.
- ✅ **Model Adapter Abstraction**: Decoupled from direct providers (e.g. OpenAI). Swap providers out via interfaces without refactoring downstream code.
- ✅ **Memory Layer Abstraction**: Context-aware interactions via `MemoryAdapter` interfaces (In-Memory included, Redis/DB extensible).
- ✅ **Streaming support**: Real-time conversational text yielding via `agent.stream()`.
- ✅ **Middleware System**: Express/Koa style Onion routing using `agent.use()` to intercept, modify, or observe executions.
- ✅ **Observability**: Built-in `Trace` system for recording and extracting robust timings and model interaction metrics.

---

## Usage Example

Agent88 completely seperates your specific execution layer and configurations so you can define the model and memory precisely.

```typescript
import { Agent, OpenAIModel, InMemoryMemory } from "agent88";

// 1. Initialize an instance of your desired configurations
const agent = new Agent({
  model: new OpenAIModel({ apiKey: process.env.OPENAI_KEY }),
  memory: new InMemoryMemory(),
  systemPrompt: "You are a helpful AI assistant for engineers.",
  maxIterations: 10
});

// 2. Safely register capabilities (Tools/Plugins)
agent.registerTool({
    name: "getWeather",
    description: "Fetches current weather",
    execute: async ({ location }) => `The weather in ${location} is 75F.`
});

// 3. Run iterative tasks. The Engine loop handles the rest natively!
const finalResponse = await agent.run("What's the weather in Miami?");
console.log(finalResponse);
```

---

## Roadmap Tracker (v0.1 Complete)

- [x] Phase 1: Core Type Foundations & Abstract Layers
- [x] Phase 2: Execution Core & Tool Executors
- [x] Phase 3: Developer-First Public Agent API
- [x] Phase 4: OpenAI Adapter
- [x] Phase 5: v0.1 Maturity (Memory System, Streaming, Middlewares, JSONSchemas)
- [x] Phase 6: Distributed Sessions & Native Streaming (Redis, ioredis, AsyncGenerator Streams)

## Documentation

Explore our guides to get up and running quickly:

- 🚀 **[Getting Started](docs/getting-started.md)** — Installation and your first agent
- 💡 **[Usage Examples](docs/examples.md)** — Runnable code for weather, chat, and planner agents (Check out the `examples/` folder in the repo!)
- 📖 **[Architecture](docs/architecture.md)** — Internals, Execution Engine, and Onion Routing
- 🗺️ **[Roadmap](docs/roadmap.md)** — Future plans and v0.1 completion status

---

## Contribution

We welcome community contributions! Agent88 is designed to be modular. The easiest way to contribute is by building **Tools**, **Model Adapters**, or **Memory Adapters**.

Please see our **[Contributing Guide](docs/contributing.md)** for details on:
1. Setting up your local environment (`npm install`, `npm test`)
2. Implementing the `Tool` and `BaseModel` interfaces
3. Submitting PRs

---

## Author
**Victor Okon**
*Development Practice Lead at Enbros | Founder, Maigie*
