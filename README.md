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

---

## Usage Example

Agent88 completely seperates your specific execution layer and configurations so you can define the model and memory precisely.

```typescript
import { Agent, ToolRegistry } from "agent88";
import { OpenAIModel } from "agent88/adapters"; // Example future provider
import { InMemoryMemory } from "agent88/memory"; 

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

Check `docs/roadmap.md` and `docs/architecture.md` for our in-depth engineering blueprint.

---

## Contribution

Pull requests are welcome!

Please:
1. Fork the repository
2. Create a feature branch
3. Submit a PR with a description of the architectural intent

---

## Author
**Victor Okon**
*AI Infrastructure Developer*
