import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const REFRESH_INTERVAL_MS = 30000;

export const useDashboardData = () => {
  const [objects, setObjects] = useState([]);
  const [totals, setTotals] = useState({
    active: 0,
    debris: 0,
    thresholdDistanceKm: 5,
    riskAlerts: 0,
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [orbitClass, setOrbitClass] = useState("ALL");
  const [showDebris, setShowDebris] = useState(true);

  const load = useCallback(async () => {
    try {
      setError("");
      const params = {
        includeDebris: showDebris,
      };
      if (search.trim()) params.search = search.trim();
      if (orbitClass !== "ALL") params.orbitClass = orbitClass;

      const [objectResponse, riskResponse] = await Promise.all([
        api.getObjects(params),
        api.getRiskAnalysis(),
      ]);

      setObjects(objectResponse.objects || []);
      setTotals(objectResponse.totals || {});
      setAlerts(riskResponse.alerts || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to load data");
    } finally {
      setLoading(false);
    }
  }, [orbitClass, search, showDebris]);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  const countsByOrbit = useMemo(() => {
    return objects.reduce(
      (acc, item) => {
        const key = item.orbitClass || "UNKNOWN";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      { LEO: 0, MEO: 0, GEO: 0 }
    );
  }, [objects]);

  return {
    objects,
    totals,
    alerts,
    countsByOrbit,
    loading,
    error,
    filters: {
      search,
      setSearch,
      orbitClass,
      setOrbitClass,
      showDebris,
      setShowDebris,
    },
  };
};
