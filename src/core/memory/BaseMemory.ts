import type { Message } from "../../types/index.js";

export interface BaseMemory {
    /**
     * Saves a message to the memory store.
     */
    save(message: Message): Promise<void>;

    /**
     * Loads the entire conversational context.
     */
    load(contextId: string): Promise<Message[]>;
}
