// @ts-ignore
import app from "../dist/server.cjs";

// Extract the actual Express app handler.
// In Node ESM, importing compiled CommonJS might result in a dual-layer default export: app.default.default or app.default
const handler = typeof app === "function"
  ? app
  : ((app as any).default && typeof (app as any).default === "function")
    ? (app as any).default
    : ((app as any).default?.default && typeof (app as any).default?.default === "function")
      ? (app as any).default.default
      : app;

export default handler;
