import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/server/_core/context";
import { appRouter } from "@/server/routers";

// Next.js Route Handler backing the tRPC API. This replaces the old
// Express app + esbuild-bundled `api/index.js` Vercel function entirely —
// Next.js is auto-detected and built by Vercel with no custom `vercel.json`
// `functions`/`rewrites` config needed, which is what caused the original
// deployment failure (a `functions` glob pointing at a gitignored,
// build-generated file that didn't exist when Vercel validated it).
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
