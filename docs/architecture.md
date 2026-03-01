# Agent88 Architecture

## Core Layers

### Agent Runtime Layer

Handles:

* Agent lifecycle
* Prompt execution

---

### Tool Execution Layer

Allows developers to register external tools.

Example:

```ts
agent.registerTool("search", async () => {})
```

---

### Memory Layer (Future)

Will support:

* Redis storage
* Database persistence
