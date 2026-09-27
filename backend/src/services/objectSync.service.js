import { config } from "../config/env.js";
import { SpaceObject } from "../models/spaceObject.model.js";
import { spaceTrackService } from "./spaceTrack.service.js";
import { classifyStatus, propagateFromTle } from "../utils/orbit.js";

const normalizeType = (type) => {
  const normalized = String(type || "").toUpperCase();
  if (normalized.includes("DEBRIS")) return "DEBRIS";
  if (normalized.includes("ROCKET")) return "ROCKET BODY";
  if (normalized.includes("PAYLOAD")) return "PAYLOAD";
  return "UNKNOWN";
};

export const syncSpaceObjects = async () => {
  const [satcatRows, tleRows] = await Promise.all([
    spaceTrackService.fetchSatcat(config.maxObjects),
    spaceTrackService.fetchTle(config.maxObjects),
  ]);

  const satcatByNorad = new Map(
    satcatRows.map((row) => [Number(row.NORAD_CAT_ID), row])
  );

  const operations = [];

  for (const row of tleRows) {
    const noradId = Number(row.NORAD_CAT_ID);
    if (!Number.isFinite(noradId)) continue;

    const satcat = satcatByNorad.get(noradId) || {};
    const objectType = normalizeType(satcat.OBJECT_TYPE || row.OBJECT_TYPE);
    const status = classifyStatus(objectType, satcat.OPERATIONAL_STATUS);
    const propagated = propagateFromTle(row.TLE_LINE1, row.TLE_LINE2, new Date());

    if (!propagated) continue;

    operations.push({
      updateOne: {
        filter: { noradId },
        update: {
          $set: {
            noradId,
            name: row.OBJECT_NAME || satcat.OBJECT_NAME || `NORAD-${noradId}`,
            objectType,
            status,
            orbitClass: propagated.orbitClass,
            tle: {
              line1: row.TLE_LINE1,
              line2: row.TLE_LINE2,
              epoch: row.EPOCH ? new Date(row.EPOCH) : null,
            },
            position: {
              lat: propagated.lat,
              lon: propagated.lon,
              altKm: propagated.altKm,
            },
            velocityKms: propagated.velocityKms,
            metadata: {
              launchDate: satcat.LAUNCH_DATE ? new Date(satcat.LAUNCH_DATE) : null,
              decayDate: satcat.DECAY_DATE ? new Date(satcat.DECAY_DATE) : null,
              owner: satcat.OWNER || satcat.COUNTRY,
              source: "space-track",
            },
            lastSyncedAt: new Date(),
          },
        },
        upsert: true,
      },
    });
  }

  if (operations.length) {
    await SpaceObject.bulkWrite(operations, { ordered: false });
  }

  return { synced: operations.length, satcat: satcatRows.length, tle: tleRows.length };
};
