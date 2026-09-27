import { motion } from "framer-motion";

const Stat = ({ label, value }) => (
  <div className="stat-card">
    <span>{label}</span>
    <strong>{value}</strong>
  </div>
);

export const DashboardPanel = ({ totals, countsByOrbit, alerts }) => {
  return (
    <motion.aside className="side-panel glass" initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }}>
      <h2>Orbital Intelligence</h2>
      <div className="stats-grid">
        <Stat label="Active Satellites" value={totals.active || 0} />
        <Stat label="Debris Count" value={totals.debris || 0} />
        <Stat label="Near-Threshold Objects" value={totals.riskAlerts || 0} />
        <Stat label="Risk Distance (km)" value={totals.thresholdDistanceKm || 5} />
      </div>

      <div className="orbit-distribution">
        <h3>Orbit Filters</h3>
        <p>LEO: {countsByOrbit.LEO || 0}</p>
        <p>MEO: {countsByOrbit.MEO || 0}</p>
        <p>GEO: {countsByOrbit.GEO || 0}</p>
      </div>

      <div className="alerts">
        <h3>Collision Risk Alerts</h3>
        {alerts.length === 0 ? (
          <p className="muted">No active warnings.</p>
        ) : (
          alerts.slice(0, 8).map((alert) => (
            <div key={`${alert.objectA}-${alert.objectB}`} className={`alert ${alert.severity.toLowerCase()}`}>
              <span>{alert.objectA} / {alert.objectB}</span>
              <strong>{alert.distanceKm} km</strong>
            </div>
          ))
        )}
      </div>
    </motion.aside>
  );
};
