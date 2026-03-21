# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-03-17

### Added
- **Ollama Model Adapter** — Native support for local LLM execution via the `OllamaModel` adapter.
- `checkConnection()` utility for verifying Ollama service availability.
- Full support for recursive tool execution and text streaming using Ollama's Chat API.

## [1.2.0] - 2026-03-12

### Added
- **Model Adapter Expansion** — Official support for Google's Gemini models via the new `GeminiModel` adapter.
- Complete support for heterogeneous multi-model orchestrations within `AgentGraph`.
- Internal logic updates to seamlessly bridge Protobuf struct constraints under the `@google/generative-ai` SDK.

## [1.1.0] - 2026-03-08

### Added
- **Multi-Agent Graph Orchestration** — `AgentGraph` class for composing agents into directed acyclic graphs.
- `GraphNode`, `GraphEdge` interfaces for defining agent topology.
- `GraphExecutor` with topological sort (Kahn's algorithm) and cycle detection.
- Graph agent example (`examples/graph-agent/`).
- Comprehensive documentation for Agent Graph in `docs/` and `README.md`.

## [1.0.1] - 2026-03-05

### Added
- Core architecture (`Agent`, `BaseModel`, `MemoryAdapter`, `Tool`).
- Robust Execution Engine loop for recursive agent logic and tool utilization.
- Strict JSON Schema parameter support for strongly typed Tool definitions.
- Out-of-the-box `OpenAIModel` adapter mapping perfectly to ChatGPT APIs.
- Volatile `InMemoryMemory` and distributed `RedisMemory` support.
- Native Text Generators (`agent.stream()`) for token-by-token LLM output.
- Onion Routing Middleware system (`agent.use()`).
- Rich Observability timings via the `Trace` object available on Context.
- Public `examples/` directory featuring Chat, Weather, and Planner agents.
