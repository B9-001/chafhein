import { createApp } from "./app";

// Entry point bundled (via esbuild, see package.json's `build:api` script)
// into api/index.js. Vercel's Node.js runtime invokes an Express app
// exported as default directly as a request handler — no `.listen()` and
// no wrapper needed.
export default createApp();
