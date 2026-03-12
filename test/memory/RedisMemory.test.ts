import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedisMemory } from '../../src/core/memory/RedisMemory.js';
import type { Message } from '../../src/types/index.js';

// Mock the ioredis module so we don't need a real Redis server for unit tests
const store = new Map<string, string>();
vi.mock('ioredis', () => {
    class MockRedis {
        async get(key: string) { return store.get(key) || null; }
        async set(key: string, value: string) { store.set(key, value); return 'OK'; }
        async del(key: string) { store.delete(key); return 1; }
        disconnect() { }
    }
    return {
        default: { Redis: MockRedis },
        Redis: MockRedis
    };
});

describe('RedisMemory', () => {
    let memory: RedisMemory;

    beforeEach(() => {
        vi.clearAllMocks();
        store.clear();
        memory = new RedisMemory('redis://localhost:6379');
    });

    it('should save and load messages properly to a specific contextId', async () => {
        const msg1: Message = { role: 'user', content: 'hello redis' };

        await memory.save('session_1', msg1);

        const history = await memory.load('session_1');
        expect(history.length).toBe(1);
        expect(history[0]).toEqual(msg1);
    });

    it('should cleanly isolate context histories between different contextIds', async () => {
        const msg1: Message = { role: 'user', content: 'user one' };
        const msg2: Message = { role: 'user', content: 'user two' };

        await memory.save('session_1', msg1);
        await memory.save('session_2', msg2);

        const history1 = await memory.load('session_1');
        const history2 = await memory.load('session_2');

        expect(history1[0]).toEqual(msg1);
        expect(history2[0]).toEqual(msg2);
        expect(history1).not.toEqual(history2);
    });

    it('should return an empty array if contextId does not exist', async () => {
        const history = await memory.load('nonexistent');
        expect(history).toEqual([]);
    });

    it('should clear the memory for a specific contextId', async () => {
        const msg1: Message = { role: 'user', content: 'hello redis' };

        await memory.save('session_1', msg1);
        await memory.clear('session_1');

        const history = await memory.load('session_1');
        expect(history).toEqual([]);
    });
});
