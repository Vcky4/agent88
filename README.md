# Agent88

**Think of it like Express.js—but for modular AI Agents.**

Agent88 is an open-source AI infrastructure framework designed to help developers build production-ready AI agents with ease. 

---

## Why Agent88 Exists

The AI ecosystem today is fragmented. Building an agent involves wiring together API calls, manually tracking token usage, parsing raw tool invocations, and hacking together loops. Agent88 abstracts the heavy lifting so you can focus on building true intelligence and orchestrating your business logic. 

We separate the execution layer, memory layers, and LLM models from your agent definition so you can swap out infrastructure without rewriting your app.

---

## Features

- ✅ **Clean Agent API**: Simple, developer-first orchestration of complex ML layers.
- ✅ **Execution Engine Loop**: Automatically handles recursive LLM reasoning, detects intent, and controls iteration counts.
- ✅ **Tool Execution (Plugins)**: A strict Tool Registry enabling seamless multi-action capability execution natively via robust JSONSchemas.
- ✅ **Model Adapter Abstraction**: Decoupled from direct providers. Swap OpenAI for local models via the `BaseModel` interface.
- ✅ **Memory Layer Abstraction**: Context-aware interactions via `MemoryAdapter` interfaces (In-Memory and Redis extensible).
- ✅ **Streaming Support**: Real-time conversational text yielding via `agent.stream()`.
- ✅ **Middleware Pipeline**: Express/Koa style Onion routing using `agent.use()` to intercept, guardrail, modify, or observe executions.
- ✅ **Observability**: Built-in `Trace` system for recording and extracting robust timings and model interaction metrics natively.

---

## Installation

```bash
npm install agent88 openai
```
*(Agent88 uses a pluggable adapter pattern. `openai` is required if using the `OpenAIModel` adapter.)*

---

## Quick Start

A complete agent execution in under 10 lines of code.

```typescript
import { Agent, OpenAIModel } from "agent88";

const agent = new Agent({
  model: new OpenAIModel(process.env.OPENAI_API_KEY!)
});

const result = await agent.run("Explain AI agents simply.");
console.log(result);
```

---

## Examples

We firmly believe frameworks grow through examples. You can find ready-to-run agents in our repository's `examples/` directory:

- 🟢 `examples/basic-agent/index.ts` — The massive 10-line minimum viability implementation.
- 🛠️ `examples/tool-agent/weather-agent.ts` — An agent that detects when to trigger a weather-lookup tool to fulfill requests.
- 🧠 `examples/memory-agent/chat-agent.ts` — A streaming, persistent conversational agent utilizing the In-Memory cache adapter.
- 📋 `examples/tool-agent/planner-agent.ts` — A multi-iteration task tracking agent doing chain-of-thought tool execution.

**Run them instantly:**
```bash
npx tsx examples/basic-agent/index.ts
```

For more details on what each does, read the **[Usage Examples Guide](docs/examples.md)**.

---

## Documentation & Architecture

Explore our detailed guides:

- 🚀 **[Getting Started](docs/getting-started.md)** — Installation, tools, and multi-turn sessions.
- 📖 **[Architecture](docs/architecture.md)** — Internals, Execution Engine, tool extraction, and Onion Routing middleware.

---

## Roadmap

Agent88 is in active development.

- **v0.1**: Built the foundation (Execution loop, Tool executions, Model/Memory abstractions, Clean API, Middleware).
- **v0.2 Track (Active)**: **Multi-Agent Orchestration (`agent.chain`)** and expanded model ecosystem adapters (`AnthropicModel`, `LocalModel`).

View the full **[Engineering Roadmap](docs/roadmap.md)**.

---

## Contributing

We welcome community contributions! Agent88 is designed to be highly modular. The easiest way to get involved is by building **Tools**, **Model Adapters**, or **Memory Adapters**.

Please see our **[Contributing Guide](CONTRIBUTING.md)** and **[Code of Conduct](CODE_OF_CONDUCT.md)** for details on setting up your local environment and submitting PRs.

---

## Author
**Victor Okon**
*Development Practice Lead at Enbros | Founder, Maigie*
