import { describe, it, expect, vi } from 'vitest';
import { Agent } from '../../src/core/Agent.js';
import { AgentGraph } from '../../src/core/graph/AgentGraph.js';
import { MockModel } from '../../src/core/models/MockModel.js';
import type { Tool } from '../../src/core/tools/Tool.js';
import type { Message, MemoryAdapter } from '../../src/types/index.js';

describe('End-to-End: AgentGraph Multi-Agent Orchestration', () => {

    it('should pipe output through a 3-agent graph where agents use tools', async () => {
        // --- Stage 1: Research Agent (uses a search tool) ---
        const searchTool: Tool = {
            name: 'webSearch',
            description: 'Search the web for information',
            execute: async (input: { query: string }) =>
                `Results for "${input.query}": Quantum computing uses qubits for exponential speedups.`
        };

        const researchModel = new MockModel([
            // First call: model requests the search tool
            { toolCall: { name: 'webSearch', input: { query: 'quantum computing impact' } } },
            // Second call: model produces research summary from search results
            { content: 'Research: Quantum computing uses qubits to achieve exponential speedups over classical computers.' }
        ]);

        const researchAgent = new Agent({ model: researchModel });
        researchAgent.registerTool(searchTool);

        // --- Stage 2: Analysis Agent (pure text, no tools) ---
        const analysisModel = new MockModel([
            { content: 'Analysis: The exponential speedup from qubits threatens current RSA encryption and accelerates drug discovery.' }
        ]);

        const analysisAgent = new Agent({ model: analysisModel });

        // --- Stage 3: Summary Agent (pure text, no tools) ---
        const summaryModel = new MockModel([
            { content: 'Executive Summary: Quantum computing will disrupt cryptography and healthcare within the decade.' }
        ]);

        const summaryAgent = new Agent({ model: summaryModel });

        // Build and run the graph
        const graph = new AgentGraph();
        graph.add("research", researchAgent);
        graph.add("analysis", analysisAgent);
        graph.add("summary", summaryAgent);

        graph.connect("research", "analysis");
        graph.connect("analysis", "summary");

        const result = await graph.run("What is the impact of quantum computing?");

        // The final output should be the summary agent's response
        expect(result).toBe('Executive Summary: Quantum computing will disrupt cryptography and healthcare within the decade.');

        // Research agent should have been called twice (tool call + final response)
        expect(researchModel.getCallCount()).toBe(2);
        // Analysis and summary agents should have been called once each
        expect(analysisModel.getCallCount()).toBe(1);
        expect(summaryModel.getCallCount()).toBe(1);
    });

    it('should work with memory-enabled agents in a graph', async () => {
        // Each agent has its OWN isolated memory — graph does not share memory between agents.
        class SimpleMemory implements MemoryAdapter {
            store: Message[] = [];

            async save(contextId: string, msg: Message) {
                this.store.push(msg);
            }

            async load(contextId: string) {
                return [...this.store];
            }
        }

        const memory1 = new SimpleMemory();
        const memory2 = new SimpleMemory();

        const model1 = new MockModel([{ content: "Agent 1 output" }]);
        const model2 = new MockModel([{ content: "Agent 2 output" }]);

        const agent1 = new Agent({ model: model1, memory: memory1 });
        const agent2 = new Agent({ model: model2, memory: memory2 });

        const graph = new AgentGraph();
        graph.add("first", agent1);
        graph.add("second", agent2);
        graph.connect("first", "second");

        const result = await graph.run("Hello");

        // The final output comes from the last agent
        expect(result).toBe("Agent 2 output");

        // Agent 1's memory should contain the original input and its own response
        expect(memory1.store.length).toBe(2); // user prompt + assistant response
        expect(memory1.store[0]!.content).toBe("Hello"); // original graph input
        expect(memory1.store[1]!.content).toBe("Agent 1 output");

        // Agent 2's memory should contain agent 1's output (piped as its prompt) and its own response
        expect(memory2.store.length).toBe(2); // user prompt (piped) + assistant response
        expect(memory2.store[0]!.content).toBe("Agent 1 output"); // piped from agent 1
        expect(memory2.store[1]!.content).toBe("Agent 2 output");
    });

    it('should execute a graph with middleware on individual agents', async () => {
        const executionLog: string[] = [];

        const model1 = new MockModel([{ content: "Step 1 done" }]);
        const model2 = new MockModel([{ content: "Step 2 done" }]);

        const agent1 = new Agent({ model: model1 });
        agent1.use(async (ctx, next) => {
            executionLog.push("agent1:before");
            await next();
            executionLog.push("agent1:after");
        });

        const agent2 = new Agent({ model: model2 });
        agent2.use(async (ctx, next) => {
            executionLog.push("agent2:before");
            await next();
            executionLog.push("agent2:after");
        });

        const graph = new AgentGraph();
        graph.add("step1", agent1);
        graph.add("step2", agent2);
        graph.connect("step1", "step2");

        const result = await graph.run("Start");

        expect(result).toBe("Step 2 done");

        // Verify middleware fired in correct order: agent1 fully completes, then agent2
        expect(executionLog).toEqual([
            "agent1:before", "agent1:after",
            "agent2:before", "agent2:after"
        ]);
    });
});
