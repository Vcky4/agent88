import { Redis } from 'ioredis';
import type { RedisOptions } from 'ioredis';
import type { MemoryAdapter, Message } from '../../types/index.js';

export class RedisMemory implements MemoryAdapter {
    private redis: Redis;

    /**
     * @param options Either an existing ioredis instance, a connection string, or RedisOptions
     */
    constructor(options?: Redis | string | RedisOptions) {
        if (options instanceof Redis) {
            this.redis = options;
        } else if (typeof options === 'string') {
            this.redis = new Redis(options);
        } else {
            this.redis = new Redis(options || {});
        }
    }

    /**
     * Fetches the context array, appends the new message, and saves it back to Redis.
     */
    async save(contextId: string, message: Message): Promise<void> {
        const key = `agent88:memory:${contextId}`;
        const existingData = await this.redis.get(key);

        const history: Message[] = existingData ? JSON.parse(existingData) : [];
        history.push(message);

        await this.redis.set(key, JSON.stringify(history));
    }

    /**
     * Loads the conversation history from Redis for a specific contextId.
     */
    async load(contextId: string): Promise<Message[]> {
        const key = `agent88:memory:${contextId}`;
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Deletes the conversation history for a specific contextId.
     */
    async clear(contextId: string): Promise<void> {
        const key = `agent88:memory:${contextId}`;
        await this.redis.del(key);
    }

    /**
     * Manually close the underlying Redis connection when cleaning up.
     */
    async disconnect(): Promise<void> {
        this.redis.disconnect();
    }
}
