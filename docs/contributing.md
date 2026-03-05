# Contributing to Agent88

We welcome community contributions! Agent88 is designed as a modular framework — which means the easiest and most impactful way to contribute is by building **Tools**, **Model Adapters**, or **Memory Adapters**.

This guide explains how to set up your environment and extend the core interfaces.

---

## 🚀 Development Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/vcky4/agent88.git
   cd agent88
   ```
3. **Install dependencies** (we use `npm`):
   ```bash
   npm install
   ```
4. **Run the test suite** (we use Vitest):
   ```bash
   npm run test
   ```

---

## 🛠️ Building Custom Tools

If you have an idea for a capability (e.g. searching the web, sending an email, querying a database), you can easily build a tool for it.

Every tool must satisfy the `Tool` interface:

```typescript
import { Tool } from "agent88";

export const webSearchTool: Tool = {
    name: "webSearch",
    description: "Searches the web for a given query.",
    
    // Natively compatible with OpenAI/Anthropic function calling JSONSchemas
    parameters: {
        type: "object",
        properties: {
            query: { type: "string", description: "The search term" }
        },
        required: ["query"]
    },
    
    // The executor wrapper safely catches errors and returns strings/objects
    execute: async ({ query }) => {
        const results = await fetch(`https://api.search.com/?q=${query}`);
        return await results.json();
    }
}
```

---

## 🤖 Building Model Adapters

Want to run Agent88 locally with Ollama, or use Anthropic's Claude instead of OpenAI? You can build a custom `ModelAdapter`.

All adapters must implement the `BaseModel` interface:

```typescript
import { BaseModel, ModelGenerateOptions, ModelResponse } from "agent88";

export class LocalModelAdapter implements BaseModel {
    constructor(private endpoint: string) {}

    // Core execution loop
    async generate(options: ModelGenerateOptions): Promise<ModelResponse> {
        // 1. Format `options.messages` into your provider's format
        // 2. Format `options.tools` into your provider's schema
        // 3. Make the API call
        
        // 4. Return the standardized response
        return {
            content: "The final answer",
            // OR if the model requested a tool:
            // toolCall: { name: "getWeather", input: { location: "Miami" } }
        };
    }

    // Optional: Implement streaming
    async *generateStream?(options: ModelGenerateOptions): AsyncGenerator<string> {
        // Yield tokens one by one
        yield "Hello";
        yield " world!";
    }
}
```

---

## 💾 Building Memory Adapters

Want to store conversation history in PostgreSQL or MongoDB? Build a `MemoryAdapter`.

```typescript
import { MemoryAdapter, Message } from "agent88";

export class PostgresMemory implements MemoryAdapter {
    constructor(private dbConnection: any) {}

    // Append a single message to a specific session
    async save(contextId: string, message: Message): Promise<void> {
        await this.dbConnection.query(
            "INSERT INTO messages (session_id, role, content) VALUES ($1, $2, $3)",
            [contextId, message.role, message.content]
        );
    }

    // Load full history for the execution context
    async load(contextId: string): Promise<Message[]> {
        const rows = await this.dbConnection.query(
            "SELECT role, content FROM messages WHERE session_id = $1", 
            [contextId]
        );
        return rows;
    }
}
```

---

## 📜 Pull Request Guidelines

When you're ready to submit a PR:

1. **Create a branch** named `feature/your-feature` or `fix/issue-description`.
2. **Write tests**: If adding core functionality (not just a community tool), include unit tests in the `/test` directory.
3. **Run the suite**: Ensure `npm run test` passes without errors.
4. **Follow the style**: We use strict TypeScript. `any` is allowed *only* where explicitly necessary (such as dynamic tool inputs), but prefer precise typing.
5. **Open the PR**: Provide a clear description of the problem solved or the architectural intent behind the change. 

We review PRs weekly. Thank you for making Agent88 better!
