// Public API Surface for Agent88

export { Agent } from './core/Agent.js';
export type { AgentConfig } from './core/Agent.js';

export type { BaseModel, ModelGenerateOptions, ModelResponse } from './core/models/BaseModel.js';

export type { Tool } from './core/tools/Tool.js';

export type { MemoryAdapter } from './types/index.js';
export { InMemoryMemory } from './core/memory/InMemoryMemory.js';

// Also exporting these for completeness to allow developers to format payloads manually if needed
export type { Message, ModelInput } from './types/index.js';
