import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

import { authRouter } from "./routers/auth-router";
import { categoryRouter } from "./routers/category-router";

const app = new Hono().basePath("/api");

// Enable CORS
app.use(
  "*",
  cors({
    origin: "http://localhost:3000", // Allow frontend
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

const appRouter = app.route("/auth", authRouter).route("/category", categoryRouter);

export { appRouter };

// The handler Next.js uses to answer API requests
export const httpHandler = handle(app);

/**
 * (Optional)
 * Exporting our API here for easy deployment
 *
 * Run `npm run deploy` for one-click API deployment to Cloudflare's edge network
 */
export default app;

// export type definition of API
export type AppType = typeof appRouter;
