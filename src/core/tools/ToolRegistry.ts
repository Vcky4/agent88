import type { Tool } from "./Tool.js";

export class ToolRegistry {
    private tools: Map<string, Tool> = new Map();

    /**
     * Registers a tool. Throws an error if a tool with the same name already exists.
     */
    register(tool: Tool): void {
        if (this.tools.has(tool.name)) {
            throw new Error(`Tool with name '${tool.name}' is already registered.`);
        }
        this.tools.set(tool.name, tool);
    }

    /**
     * Retrieves a tool by its name. Returns undefined if not found.
     */
    getTool(name: string): Tool | undefined {
        return this.tools.get(name);
    }

    /**
     * Returns an array of all registered tools. Useful for passing metadata to the LLM.
     */
    getAllTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Removes a tool by its name.
     */
    remove(name: string): boolean {
        return this.tools.delete(name);
    }
}
