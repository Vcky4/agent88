import { describe, it, expect } from 'vitest';
import { Agent } from '../../src/core/Agent.js';
import { AgentGraph } from '../../src/core/graph/AgentGraph.js';
import { MockModel } from '../../src/core/models/MockModel.js';

describe('AgentGraph', () => {
    it('should execute a linear 3-agent graph and pipe outputs sequentially', async () => {
        const researchModel = new MockModel([
            { content: "Research findings on quantum computing" }
        ]);
        const analysisModel = new MockModel([
            { content: "Analysis of quantum computing impact" }
        ]);
        const summaryModel = new MockModel([
            { content: "Summary: Quantum computing will transform cryptography." }
        ]);

        const graph = new AgentGraph();

        graph.add("research", new Agent({ model: researchModel }));
        graph.add("analysis", new Agent({ model: analysisModel }));
        graph.add("summary", new Agent({ model: summaryModel }));

        graph.connect("research", "analysis");
        graph.connect("analysis", "summary");

        const result = await graph.run("Explain the impact of quantum computing");

        expect(result).toBe("Summary: Quantum computing will transform cryptography.");
        expect(researchModel.getCallCount()).toBe(1);
        expect(analysisModel.getCallCount()).toBe(1);
        expect(summaryModel.getCallCount()).toBe(1);
    });

    it('should execute a single-node graph', async () => {
        const model = new MockModel([{ content: "Solo agent output" }]);
        const graph = new AgentGraph();

        graph.add("solo", new Agent({ model }));

        const result = await graph.run("Hello");

        expect(result).toBe("Solo agent output");
        expect(model.getCallCount()).toBe(1);
    });

    it('should throw when connecting a non-existent source node', () => {
        const model = new MockModel([{ content: "ok" }]);
        const graph = new AgentGraph();

        graph.add("target", new Agent({ model }));

        expect(() => graph.connect("missing", "target")).toThrowError(
            'Cannot connect: source node "missing" does not exist.'
        );
    });

    it('should throw when connecting a non-existent target node', () => {
        const model = new MockModel([{ content: "ok" }]);
        const graph = new AgentGraph();

        graph.add("source", new Agent({ model }));

        expect(() => graph.connect("source", "missing")).toThrowError(
            'Cannot connect: target node "missing" does not exist.'
        );
    });

    it('should throw when running an empty graph', async () => {
        const graph = new AgentGraph();

        await expect(graph.run("test")).rejects.toThrowError(
            "AgentGraph has no nodes to execute."
        );
    });

    it('should throw when adding a duplicate node id', () => {
        const model = new MockModel([{ content: "ok" }]);
        const graph = new AgentGraph();

        graph.add("dup", new Agent({ model }));

        expect(() => graph.add("dup", new Agent({ model }))).toThrowError(
            'Node "dup" is already registered in the graph.'
        );
    });
});
