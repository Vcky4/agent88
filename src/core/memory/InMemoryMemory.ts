import type { MemoryAdapter, Message } from "../../types/index.js";

export class InMemoryMemory implements MemoryAdapter {
    private store: Record<string, Message[]> = {};

    async save(contextId: string, message: Message): Promise<void> {
        if (!this.store[contextId]) {
            this.store[contextId] = [];
        }
        this.store[contextId].push(message);
    }

    async load(contextId: string): Promise<Message[]> {
        return this.store[contextId] || [];
    }
}
