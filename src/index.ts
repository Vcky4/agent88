// Public API Surface for Agent88

export { Agent } from './core/Agent.js';
export type { AgentConfig } from './core/Agent.js';

export type { BaseModel, ModelGenerateOptions, ModelResponse } from './core/models/BaseModel.js';
export { OpenAIModel } from './core/models/OpenAIModel.js';
export { GeminiModel } from './core/models/GeminiModel.js';

export type { Tool } from './core/tools/Tool.js';

export type { MemoryAdapter } from './types/index.js';
export { InMemoryMemory } from './core/memory/InMemoryMemory.js';
export { RedisMemory } from './core/memory/RedisMemory.js';

// Also exporting these for completeness to allow developers to format payloads manually if needed
export type { Message, ModelInput } from './types/index.js';

// Observability and Execution Loop Context
export { Trace } from './core/execution/Trace.js';
export type { TraceEvent } from './core/execution/Trace.js';
export type { ExecutionContext } from './core/execution/ExecutionContext.js';

// Multi-Agent Graph Orchestration
export { AgentGraph } from './core/graph/AgentGraph.js';
export { GraphExecutor } from './core/graph/GraphExecutor.js';
export type { GraphNode } from './core/graph/GraphNode.js';
export type { GraphEdge } from './core/graph/GraphEdge.js';
