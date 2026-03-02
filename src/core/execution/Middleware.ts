import type { ExecutionContext } from "./ExecutionContext.js";

export type NextFunction = () => Promise<void>;
export type Middleware = (context: ExecutionContext, next: NextFunction) => Promise<void>;
