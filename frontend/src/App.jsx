import { motion } from "framer-motion";
import { useState } from "react";
import { EarthScene } from "./components/EarthScene";
import { DashboardPanel } from "./components/DashboardPanel";
import { ControlBar } from "./components/ControlBar";
import { ObjectTooltip } from "./components/ObjectTooltip";
import { useDashboardData } from "./hooks/useDashboardData";

function App() {
  const [hovered, setHovered] = useState(null);
  const [selectedNorad, setSelectedNorad] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [showOrbits, setShowOrbits] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.09);
  const { objects, totals, alerts, countsByOrbit, loading, error, filters } = useDashboardData();

  return (
    <div className="app-shell">
      <div className="nebula" />

      <motion.header className="hero" initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
        <h1>Real-Time Space Debris Tracking Dashboard</h1>
        <p>Live orbital intelligence powered by Space-Track API and TLE propagation.</p>
      </motion.header>

      <ControlBar filters={filters} />

      {error ? <p className="error glass">{error}</p> : null}
      {loading ? <p className="loading glass">Synchronizing orbital feeds...</p> : null}

      <main className="main-grid">
        <section className="earth-panel glass">
          <EarthScene
            objects={objects}
            alerts={alerts}
            onHover={setHovered}
            onLeave={() => setHovered(null)}
            selectedNorad={selectedNorad}
            onSelect={setSelectedNorad}
            interaction={{ autoRotate, rotationSpeed, showOrbits }}
          />
          <div className="scene-hud glass">
            <button type="button" onClick={() => setAutoRotate((prev) => !prev)}>
              {autoRotate ? "Pause Spin" : "Resume Spin"}
            </button>
            <button type="button" onClick={() => setShowOrbits((prev) => !prev)}>
              {showOrbits ? "Hide Orbits" : "Show Orbits"}
            </button>
            <label>
              Rotation Speed
              <input
                type="range"
                min="0.02"
                max="0.22"
                step="0.01"
                value={rotationSpeed}
                onChange={(event) => setRotationSpeed(Number(event.target.value))}
              />
            </label>
            <p className="scene-hud-help">Tip: click a marker to focus and highlight its orbit path.</p>
          </div>
          <ObjectTooltip object={hovered || objects.find((item) => item.noradId === selectedNorad)} />
        </section>

        <DashboardPanel totals={totals} countsByOrbit={countsByOrbit} alerts={alerts} />
      </main>
    </div>
  );
}

export default App;
