import * as satellite from "satellite.js";

const EARTH_RADIUS_KM = 6371;

export const toOrbitClass = (altKm) => {
  if (!Number.isFinite(altKm)) return "UNKNOWN";
  if (altKm <= 2000) return "LEO";
  if (altKm <= 35786) return "MEO";
  if (Math.abs(altKm - 35786) <= 1000) return "GEO";
  return "HEO";
};

export const classifyStatus = (objectType, operationalStatus) => {
  if (objectType === "DEBRIS") return "DEBRIS";
  if (String(operationalStatus || "").toUpperCase().startsWith("+")) return "ACTIVE";
  return "INACTIVE";
};

export const propagateFromTle = (line1, line2, at = new Date()) => {
  const satrec = satellite.twoline2satrec(line1, line2);
  const propagated = satellite.propagate(satrec, at);
  const eciPosition = propagated.position;
  const eciVelocity = propagated.velocity;

  if (!eciPosition || !eciVelocity) return null;

  const gmst = satellite.gstime(at);
  const geodetic = satellite.eciToGeodetic(eciPosition, gmst);
  const lat = satellite.radiansToDegrees(geodetic.latitude);
  const lon = satellite.radiansToDegrees(geodetic.longitude);
  const altKm = geodetic.height;

  const velocityKms = Math.sqrt(
    eciVelocity.x ** 2 + eciVelocity.y ** 2 + eciVelocity.z ** 2
  );

  return {
    satrec,
    lat,
    lon,
    altKm,
    velocityKms,
    orbitClass: toOrbitClass(altKm),
    eci: eciPosition,
  };
};

export const eciDistanceKm = (a, b) => {
  if (!a || !b) return Number.POSITIVE_INFINITY;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const sphericalToCartesian = (latDeg, lonDeg, altitudeKm) => {
  const lat = (latDeg * Math.PI) / 180;
  const lon = (lonDeg * Math.PI) / 180;
  const radius = EARTH_RADIUS_KM + altitudeKm;

  return {
    x: radius * Math.cos(lat) * Math.cos(lon),
    y: radius * Math.sin(lat),
    z: radius * Math.cos(lat) * Math.sin(lon),
  };
};
