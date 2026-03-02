import { describe, it, expect } from 'vitest';
import { InMemoryMemory } from '../../src/core/memory/InMemoryMemory.js';
import type { Message } from '../../src/types/index.js';

describe('InMemoryMemory', () => {
    it('should save and load messages properly to a specific contextId', async () => {
        const memory = new InMemoryMemory();
        const msg1: Message = { role: 'user', content: 'hello' };

        await memory.save('session_1', msg1);

        const history = await memory.load('session_1');
        expect(history.length).toBe(1);
        expect(history[0]).toEqual(msg1);
    });

    it('should cleanly isolate context histories between different contextIds', async () => {
        const memory = new InMemoryMemory();
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
        const memory = new InMemoryMemory();
        const history = await memory.load('nonexistent');
        expect(history).toEqual([]);
    });
});
