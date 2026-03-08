import type { Agent } from "../Agent.js";
import type { GraphEdge } from "./GraphEdge.js";

/**
 * v1 Linear Graph Executor.
 *
 * Determines execution order from edges via topological sort,
 * then runs each agent sequentially — piping the output of one
 * agent as the input prompt to the next.
 *
 * Future versions will support branching, parallel execution,
 * and conditional routing.
 */
export class GraphExecutor {

    /**
     * Executes agents in topological order derived from the edge list.
     * Each agent receives the previous agent's output as its input prompt.
     */
    async execute(
        nodes: Map<string, Agent>,
        edges: GraphEdge[],
        input: string
    ): Promise<string> {

        const order = this.topologicalSort(nodes, edges);

        if (order.length === 0) {
            throw new Error("AgentGraph has no nodes to execute.");
        }

        let currentInput = input;

        for (const nodeId of order) {
            const agent = nodes.get(nodeId);
            if (!agent) {
                throw new Error(`Node "${nodeId}" is in the execution order but has no registered agent.`);
            }
            currentInput = await agent.run(currentInput);
        }

        return currentInput;
    }

    /**
     * Produces a topological ordering of graph nodes via Kahn's algorithm.
     * Throws if the graph contains a cycle.
     */
    private topologicalSort(nodes: Map<string, Agent>, edges: GraphEdge[]): string[] {
        const inDegree = new Map<string, number>();
        const adjacency = new Map<string, string[]>();

        // Initialise all registered nodes
        for (const id of nodes.keys()) {
            inDegree.set(id, 0);
            adjacency.set(id, []);
        }

        // Build adjacency + in-degree from edges
        for (const edge of edges) {
            adjacency.get(edge.from)!.push(edge.to);
            inDegree.set(edge.to, (inDegree.get(edge.to) ?? 0) + 1);
        }

        // Seed queue with zero in-degree nodes
        const queue: string[] = [];
        for (const [id, degree] of inDegree) {
            if (degree === 0) {
                queue.push(id);
            }
        }

        const sorted: string[] = [];

        while (queue.length > 0) {
            const current = queue.shift()!;
            sorted.push(current);

            for (const neighbor of adjacency.get(current) ?? []) {
                const newDegree = (inDegree.get(neighbor) ?? 1) - 1;
                inDegree.set(neighbor, newDegree);
                if (newDegree === 0) {
                    queue.push(neighbor);
                }
            }
        }

        if (sorted.length !== nodes.size) {
            throw new Error("AgentGraph contains a cycle and cannot be executed.");
        }

        return sorted;
    }
}
