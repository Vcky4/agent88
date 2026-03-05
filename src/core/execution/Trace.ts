export interface TraceEvent {
    name: string;
    startTime: number;
    endTime?: number;
    durationMs?: number;
    metadata?: Record<string, any> | undefined;
}

export class Trace {
    public events: TraceEvent[] = [];
    private activeEvents = new Map<string, TraceEvent>();

    /**
     * Starts tracking a new event by name.
     */
    start(name: string, metadata?: Record<string, any>): void {
        const event: TraceEvent = {
            name,
            startTime: Date.now(),
            metadata
        };

        this.activeEvents.set(name, event);
        this.events.push(event); // Push reference so it stays in order
    }

    /**
     * Ends an active event and calculates duration.
     */
    end(name: string): void {
        const event = this.activeEvents.get(name);

        if (event) {
            event.endTime = Date.now();
            event.durationMs = event.endTime - event.startTime;
            this.activeEvents.delete(name);
        }
    }

    /**
     * Returns all recorded trace events.
     */
    getEvents(): TraceEvent[] {
        return this.events;
    }
}
