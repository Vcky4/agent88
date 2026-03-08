import type { Agent } from "../Agent.js";

/**
 * A node in an AgentGraph. Binds a unique string identifier
 * to a concrete Agent instance that will be executed during graph traversal.
 */
export interface GraphNode {
    id: string
    agent: Agent
}
