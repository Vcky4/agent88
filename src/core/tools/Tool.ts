export interface Tool {
    name: string;
    description: string;
    execute(input: any): Promise<any>;
}
