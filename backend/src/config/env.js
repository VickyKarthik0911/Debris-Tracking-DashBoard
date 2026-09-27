import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGO_URI,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  spaceTrack: {
    username: process.env.SPACE_TRACK_USERNAME,
    password: process.env.SPACE_TRACK_PASSWORD,
    baseUrl: process.env.SPACE_TRACK_BASE_URL || "https://www.space-track.org",
  },
  refreshSeconds: parseNumber(process.env.REFRESH_SECONDS, 30),
  riskDistanceKm: parseNumber(process.env.RISK_DISTANCE_KM, 5),
  maxObjects: parseNumber(process.env.MAX_OBJECTS, 250),
};

export const requiredEnv = [
  ["MONGO_URI", config.mongoUri],
  ["SPACE_TRACK_USERNAME", config.spaceTrack.username],
  ["SPACE_TRACK_PASSWORD", config.spaceTrack.password],
];
