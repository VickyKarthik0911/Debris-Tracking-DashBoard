import { createApp } from "./app.js";
import { connectDb } from "./config/db.js";
import { config, requiredEnv } from "./config/env.js";
import { startSyncJob } from "./jobs/sync.job.js";

const validateEnv = () => {
  const missing = requiredEnv.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

const bootstrap = async () => {
  validateEnv();
  await connectDb();

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`backend listening on http://localhost:${config.port}`);
  });

  await startSyncJob();
};

bootstrap().catch((error) => {
  console.error("startup failed", error);
  process.exit(1);
});
