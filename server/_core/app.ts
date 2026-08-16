import "dotenv/config";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";

/**
 * Builds the Express app shared by the local/self-hosted server
 * (server/_core/index.ts) and the Vercel serverless entry
 * (server/_core/vercel-entry.ts). Does not call `.listen()` and does not
 * wire up Vite/static-file serving — callers own that.
 */
export function createApp(): Express {
  const app = express();
  // Body parser size limit. Kept just under Vercel's hard 4.5MB serverless
  // request-body cap (see the admin.uploadImage guard in routers.ts, which
  // limits base64 image payloads to comfortably fit inside this) so
  // self-hosted (`npm start`) and Vercel deployments behave consistently.
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ limit: "5mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}
