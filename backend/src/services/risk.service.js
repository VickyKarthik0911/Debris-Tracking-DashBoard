import { config } from "../config/env.js";
import { RiskAlert } from "../models/riskAlert.model.js";
import { SpaceObject } from "../models/spaceObject.model.js";
import { eciDistanceKm, propagateFromTle } from "../utils/orbit.js";

const severityFromDistance = (distanceKm) => {
  if (distanceKm <= 1) return "HIGH";
  if (distanceKm <= 3) return "MEDIUM";
  return "LOW";
};

const probabilityFromDistance = (distanceKm, thresholdKm) => {
  const normalized = Math.max(0, 1 - distanceKm / thresholdKm);
  return Math.round((normalized ** 2) * 1000) / 1000;
};

export const runRiskAnalysis = async (thresholdKm = config.riskDistanceKm) => {
  const objects = await SpaceObject.find(
    { "tle.line1": { $exists: true }, "tle.line2": { $exists: true } },
    { noradId: 1, tle: 1 }
  )
    .sort({ noradId: 1 })
    .lean();

  const propagated = objects
    .map((item) => {
      const p = propagateFromTle(item.tle.line1, item.tle.line2, new Date());
      if (!p?.eci) return null;
      return { noradId: item.noradId, eci: p.eci };
    })
    .filter(Boolean);

  const alerts = [];

  for (let i = 0; i < propagated.length; i += 1) {
    for (let j = i + 1; j < propagated.length; j += 1) {
      const distanceKm = eciDistanceKm(propagated[i].eci, propagated[j].eci);
      if (distanceKm >= thresholdKm) continue;

      const probability = probabilityFromDistance(distanceKm, thresholdKm);
      alerts.push({
        objectA: propagated[i].noradId,
        objectB: propagated[j].noradId,
        distanceKm: Math.round(distanceKm * 1000) / 1000,
        probability,
        severity: severityFromDistance(distanceKm),
      });
    }
  }

  await RiskAlert.deleteMany({});
  if (alerts.length) {
    await RiskAlert.insertMany(alerts, { ordered: false });
  }

  const riskByNorad = new Map();
  for (const alert of alerts) {
    const currentA = riskByNorad.get(alert.objectA) || 0;
    const currentB = riskByNorad.get(alert.objectB) || 0;
    riskByNorad.set(alert.objectA, Math.max(currentA, alert.probability));
    riskByNorad.set(alert.objectB, Math.max(currentB, alert.probability));
  }

  const riskUpdates = [...riskByNorad.entries()].map(([noradId, score]) => ({
    updateOne: {
      filter: { noradId },
      update: { $set: { riskScore: score } },
    },
  }));

  if (riskUpdates.length) {
    await SpaceObject.bulkWrite(riskUpdates, { ordered: false });
  }

  return {
    thresholdKm,
    objectsScanned: propagated.length,
    alerts: alerts.length,
  };
};
