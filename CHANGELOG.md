# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - v0.2

### Added
- **Multi-Agent Graph Orchestration** — `AgentGraph` class for composing agents into directed acyclic graphs.
- `GraphNode`, `GraphEdge` interfaces for defining agent topology.
- `GraphExecutor` with topological sort (Kahn's algorithm) and cycle detection.
- Graph agent example (`examples/graph-agent/`).

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
