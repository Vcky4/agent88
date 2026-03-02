export interface Tool {
    name: string;
    description: string;
    parameters?: Record<string, any>;
    execute(input: any): Promise<any>;
}
