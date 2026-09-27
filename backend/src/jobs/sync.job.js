import cron from "node-cron";
import { config } from "../config/env.js";
import { runRiskAnalysis } from "../services/risk.service.js";
import { syncSpaceObjects } from "../services/objectSync.service.js";

let isRunning = false;

const executeJob = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    const synced = await syncSpaceObjects();
    const risk = await runRiskAnalysis(config.riskDistanceKm);
    console.log("sync cycle complete", { synced, risk });
  } catch (error) {
    console.error("sync cycle failed", error.message);
  } finally {
    isRunning = false;
  }
};

export const startSyncJob = async () => {
  await executeJob();

  const expression = `*/${Math.max(1, config.refreshSeconds)} * * * * *`;
  cron.schedule(expression, executeJob);
  console.log(`sync scheduler running every ${config.refreshSeconds}s`);
};
