/**
 * Agent Graph Example — Multi-Agent Pipeline
 *
 * Demonstrates chaining three specialized agents into a
 * research → analysis → summary pipeline using AgentGraph.
 *
 * Usage:
 *   npx tsx examples/graph-agent/graph-agent.ts
 *
 * Note: Uses MockModel so no API key is required.
 */

import { Agent } from "../../src/core/Agent.js";
import { AgentGraph } from "../../src/core/graph/AgentGraph.js";
import { MockModel } from "../../src/core/models/MockModel.js";

// --- Create specialized mock models for each stage ---

const researchModel = new MockModel([
    { content: "Quantum computing leverages qubits to perform calculations exponentially faster than classical computers. Key players include IBM, Google, and IonQ. Recent breakthroughs include Google's Willow chip achieving quantum supremacy in new benchmarks." }
]);

const analysisModel = new MockModel([
    { content: "Impact Analysis:\n1. Cryptography — Current RSA encryption will become vulnerable, driving adoption of post-quantum cryptography standards.\n2. Drug Discovery — Molecular simulations that take years can be completed in hours.\n3. Financial Modeling — Portfolio optimization and risk analysis will see 1000x speedups.\n4. AI/ML — Quantum machine learning could unlock new model architectures." }
]);

const summaryModel = new MockModel([
    { content: "Executive Summary: Quantum computing is poised to disrupt cryptography, healthcare, finance, and AI within the next decade. Organizations should begin evaluating post-quantum security measures and identify high-value quantum use cases in their domain." }
]);

// --- Build the Agent Graph ---

const graph = new AgentGraph();

graph.add("research", new Agent({
    model: researchModel,
    systemPrompt: "You are a research specialist. Gather comprehensive facts on the given topic."
}));

graph.add("analysis", new Agent({
    model: analysisModel,
    systemPrompt: "You are an analyst. Take research findings and produce a structured impact analysis."
}));

graph.add("summary", new Agent({
    model: summaryModel,
    systemPrompt: "You are an executive summarizer. Condense analysis into a concise brief."
}));

// Define the execution flow
graph.connect("research", "analysis");
graph.connect("analysis", "summary");

// --- Run the pipeline ---

async function main() {
    console.log("🚀 Agent Graph Example — Research → Analysis → Summary\n");
    console.log("Input: \"Explain the impact of quantum computing\"\n");
    console.log("---\n");

    const result = await graph.run("Explain the impact of quantum computing");

    console.log("📋 Final Output:\n");
    console.log(result);
}

main().catch(console.error);
