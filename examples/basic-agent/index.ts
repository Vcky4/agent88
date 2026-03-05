import { Agent, OpenAIModel } from "../../src/index.js";

const agent = new Agent({
    model: new OpenAIModel(process.env.OPENAI_API_KEY!)
});

const result = await agent.run("Explain AI agents simply");
console.log(result);
