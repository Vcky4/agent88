import { Agent } from "../../src/core/Agent.js";
import { AgentGraph } from "../../src/core/graph/AgentGraph.js";
import { OpenAIModel } from "../../src/core/models/OpenAIModel.js";
import { GeminiModel } from "../../src/core/models/GeminiModel.js";
import type { Tool } from "../../src/core/tools/Tool.js";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * factLookup tool — simulates retrieving factual data for a given topic.
 */
const factLookupTool: Tool = {
    name: "factLookup",
    description: "Look up key facts about a given topic.",
    parameters: {
        type: "object",
        properties: {
            topic: { type: "string", description: "The topic to research" }
        },
        required: ["topic"]
    },
    async execute(input: { topic: string }) {
        console.log(`>>> TOOL EXECUTED: factLookup("${input.topic}")`);

        return [
            "Quantum computers use qubits that exploit superposition and entanglement.",
            "Shor's algorithm can theoretically break RSA-2048 encryption.",
            "NIST finalized post-quantum cryptography standards in 2024.",
            "Current quantum systems have ~1000 qubits; ~4000 are needed to break RSA."
        ].join(" ");
    }
};

async function run() {
    if (!process.env.OPENAI_API_KEY || !process.env.GEMINI_API_KEY) {
        console.error("Please set OPENAI_API_KEY and GEMINI_API_KEY environment variables to run this mixed-model test.");
        process.exit(1);
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Stage 1 — Research Agent: gathers facts via tool (using OpenAI)
    const researchAgent = new Agent({
        model: new OpenAIModel(openAiKey),
        systemPrompt:
            "You are a research specialist. " +
            "You MUST call the factLookup tool before responding. " +
            "Summarize the returned facts as 3 concise bullet points."
    });
    researchAgent.registerTool(factLookupTool);

    // Stage 2 — Analysis Agent: distills the most impactful insight (using Gemini)
    const analysisAgent = new Agent({
        model: new GeminiModel(geminiKey),
        systemPrompt:
            "You are an analyst. " +
            "Given research bullet points, identify the single most impactful finding " +
            "and explain why in 2-3 sentences."
    });

    // Stage 3 — Summary Agent: produces a one-line executive brief (using OpenAI)
    const summaryAgent = new Agent({
        model: new OpenAIModel(openAiKey),
        systemPrompt:
            "You are an executive summarizer. " +
            "Given an analysis, produce a single-sentence executive brief."
    });

    // Wire the graph: research → analysis → summary
    const graph = new AgentGraph();

    graph.add("research", researchAgent);
    graph.add("analysis", analysisAgent);
    graph.add("summary", summaryAgent);

    graph.connect("research", "analysis");
    graph.connect("analysis", "summary");

    // Execute
    const input = "What is the impact of quantum computing on cybersecurity?";

    console.log("🚀 AgentGraph Integration Test\n");
    console.log(`Input: "${input}"\n`);
    console.log("---\n");

    const result = await graph.run(input);

    console.log("\n📋 Final Output:\n");
    console.log(result);
}

run().catch(console.error);
