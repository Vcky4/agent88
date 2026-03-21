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
- ✅ **Agent Graph Orchestration**: Compose multiple agents into directed acyclic graphs via `AgentGraph` — chain specialized agents with `add()`, `connect()`, and `run()`.
- ✅ **Model Adapter Abstraction**: Decoupled from direct providers. Swap OpenAI for local models via the `BaseModel` interface.
- ✅ **Memory Layer Abstraction**: Context-aware interactions via `MemoryAdapter` interfaces (In-Memory and Redis extensible).
- ✅ **Streaming Support**: Real-time conversational text yielding via `agent.stream()`.
- ✅ **Middleware Pipeline**: Express/Koa style Onion routing using `agent.use()` to intercept, guardrail, modify, or observe executions.
- ✅ **Observability**: Built-in `Trace` system for recording and extracting robust timings and model interaction metrics natively.

---

## Installation

```bash
npm install agent88 openai @google/generative-ai
```
*(Agent88 uses a pluggable adapter pattern. `openai` is required for `OpenAIModel`, and `@google/generative-ai` is required for `GeminiModel`.)*

---

## Quick Start

A complete agent execution in under 10 lines of code.

```typescript
import { Agent, OpenAIModel, GeminiModel, OllamaModel } from "agent88";

// You can use OpenAI...
const agent = new Agent({
  model: new OpenAIModel(process.env.OPENAI_API_KEY!)
});

// ...or Google Gemini!
const geminiAgent = new Agent({
  model: new GeminiModel(process.env.GEMINI_API_KEY!)
});

// ...or Ollama for local execution!
const ollamaAgent = new Agent({
  model: new OllamaModel("llama3.1")
});

const result = await agent.run("Explain AI agents simply.");
console.log(result);
```

---

## Examples

We firmly believe frameworks grow through examples. You can find ready-to-run agents in our repository's `examples/` directory:

- 🟢 `examples/basic-agent/index.ts` — The massive 10-line minimum viability implementation.
- 🚀 `examples/gemini-agent/index.ts` — A basic agent utilizing Google's Gemini models.
- 🦙 `examples/ollama-agent/index.ts` — A local agent running on Ollama with connection check and streaming.
- 🛠️ `examples/tool-agent/weather-agent.ts` — An agent that detects when to trigger a weather-lookup tool to fulfill requests.
- 🧠 `examples/memory-agent/chat-agent.ts` — A streaming, persistent conversational agent utilizing the In-Memory cache adapter.
- 📋 `examples/tool-agent/planner-agent.ts` — A multi-iteration task tracking agent doing chain-of-thought tool execution.
- 🔀 `examples/graph-agent/graph-agent.ts` — A multi-agent pipeline chaining research → analysis → summary via `AgentGraph`.

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

| Version    | Focus                                                             | Status        |
| ---------- | ----------------------------------------------------------------- | ------------- |
| **v1.0.1** | Single Agent Core (Execution, Tools, Memory, Middleware, Tracing) | ✅ Shipped     |
| **v1.1.0** | Agent Graph Orchestration (`AgentGraph`)                          | ✅ Shipped     |
| **v1.2.0** | Model Adapter Expansion (Gemini ✅, Ollama ✅, Anthropic 🔜)         | ✅ Shipped     |
| v1.3.0     | Observability & Debugging                                         | Planned       |
| v1.4.0     | Plugin Ecosystem                                                  | Planned       |

View the full **[Engineering Roadmap](docs/roadmap.md)**.

---

## Contributing

We welcome community contributions! Agent88 is designed to be highly modular. The easiest way to get involved is by building **Tools**, **Model Adapters**, or **Memory Adapters**.

Please see our **[Contributing Guide](CONTRIBUTING.md)** and **[Code of Conduct](CODE_OF_CONDUCT.md)** for details on setting up your local environment and submitting PRs.

---

## Author
**Victor Okon**
*Development Practice Lead at Enbros | Founder, Maigie*
