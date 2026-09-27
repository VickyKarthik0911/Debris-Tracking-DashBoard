import cors from "cors";
import express from "express";
import morgan from "morgan";
import { config } from "./config/env.js";
import objectRoutes from "./routes/object.routes.js";
import { errorHandler } from "./utils/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
  });

  app.use("/api", objectRoutes);
  app.use(errorHandler);

  return app;
};
