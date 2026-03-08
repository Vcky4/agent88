import type { Agent } from "../Agent.js";
import type { GraphEdge } from "./GraphEdge.js";
import { GraphExecutor } from "./GraphExecutor.js";

/**
 * AgentGraph — Multi-Agent Orchestration via Graph Execution.
 *
 * Compose multiple specialized Agent instances into a directed acyclic graph (DAG).
 * Each node is an Agent, and edges define data flow: the output of one agent
 * becomes the input prompt for the next.
 *
 * @example
 * ```ts
 * const graph = new AgentGraph();
 *
 * graph.add("research", researchAgent);
 * graph.add("analysis", analysisAgent);
 * graph.add("summary", summaryAgent);
 *
 * graph.connect("research", "analysis");
 * graph.connect("analysis", "summary");
 *
 * const result = await graph.run("Explain the impact of quantum computing");
 * ```
 */
export class AgentGraph {
    private nodes = new Map<string, Agent>();
    private edges: GraphEdge[] = [];
    private executor: GraphExecutor;

    constructor() {
        this.executor = new GraphExecutor();
    }

    /**
     * Register a named agent as a node in the graph.
     * @throws if a node with the same id is already registered.
     */
    add(id: string, agent: Agent): void {
        if (this.nodes.has(id)) {
            throw new Error(`Node "${id}" is already registered in the graph.`);
        }
        this.nodes.set(id, agent);
    }

    /**
     * Create a directed edge from one node to another.
     * @throws if either node id has not been registered via `add()`.
     */
    connect(from: string, to: string): void {
        if (!this.nodes.has(from)) {
            throw new Error(`Cannot connect: source node "${from}" does not exist.`);
        }
        if (!this.nodes.has(to)) {
            throw new Error(`Cannot connect: target node "${to}" does not exist.`);
        }
        this.edges.push({ from, to });
    }

    /**
     * Execute the agent graph. Agents are run in topological order;
     * each agent's output is piped as the input to the next.
     *
     * @param input - The initial prompt fed to the first agent(s).
     * @returns The final output string from the last agent in the graph.
     */
    async run(input: string): Promise<string> {
        return this.executor.execute(this.nodes, this.edges, input);
    }
}
