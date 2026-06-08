/**
 * index.ts — Server entry point.
 *
 * env.ts MUST be the first import so the process exits immediately if
 * environment configuration is invalid, before any other module runs.
 */
import "./lib/env"; // Validates all env vars — crashes fast on misconfiguration

import app            from "./app";
import { env }        from "./lib/env";
import { logger }     from "./lib/logger";

app.listen(env.PORT, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
  logger.info(
    { port: env.PORT, nodeEnv: env.NODE_ENV },
    "PayVora API server listening",
  );
});
