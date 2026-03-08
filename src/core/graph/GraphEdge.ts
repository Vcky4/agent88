/**
 * A directed edge in an AgentGraph.
 * Defines that the output of the `from` node feeds into the `to` node.
 */
export interface GraphEdge {
    from: string
    to: string
}
