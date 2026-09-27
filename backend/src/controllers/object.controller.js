import { config } from "../config/env.js";
import { RiskAlert } from "../models/riskAlert.model.js";
import { SpaceObject } from "../models/spaceObject.model.js";

const mapQuery = (query) => {
  const mongo = {};

  if (query.search) {
    const noradSearch = Number(query.search);
    if (Number.isFinite(noradSearch)) {
      mongo.$or = [{ noradId: noradSearch }, { name: new RegExp(query.search, "i") }];
    } else {
      mongo.name = new RegExp(query.search, "i");
    }
  }

  if (query.orbitClass) mongo.orbitClass = query.orbitClass.toUpperCase();

  if (query.onlyRisk === "true") mongo.riskScore = { $gt: 0 };

  if (query.includeDebris === "false") mongo.status = { $ne: "DEBRIS" };

  return mongo;
};

export const getObjects = async (req, res, next) => {
  try {
    const filter = mapQuery(req.query);
    const limit = Math.min(Number(req.query.limit) || 200, 1000);
    const objects = await SpaceObject.find(filter).sort({ riskScore: -1 }).limit(limit).lean();

    const totals = {
      active: await SpaceObject.countDocuments({ status: "ACTIVE" }),
      debris: await SpaceObject.countDocuments({ status: "DEBRIS" }),
      thresholdDistanceKm: config.riskDistanceKm,
      riskAlerts: await RiskAlert.countDocuments({}),
    };

    res.json({ totals, objects });
  } catch (error) {
    next(error);
  }
};

export const getDebris = async (_req, res, next) => {
  try {
    const objects = await SpaceObject.find({ status: "DEBRIS" }).sort({ updatedAt: -1 }).lean();
    res.json({ count: objects.length, objects });
  } catch (error) {
    next(error);
  }
};

export const getActive = async (_req, res, next) => {
  try {
    const objects = await SpaceObject.find({ status: "ACTIVE" }).sort({ updatedAt: -1 }).lean();
    res.json({ count: objects.length, objects });
  } catch (error) {
    next(error);
  }
};

export const getRiskAnalysis = async (_req, res, next) => {
  try {
    const alerts = await RiskAlert.find({}).sort({ probability: -1, distanceKm: 1 }).limit(100).lean();
    res.json({
      thresholdKm: config.riskDistanceKm,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};
