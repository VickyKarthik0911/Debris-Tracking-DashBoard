import { motion } from "framer-motion";

export const ControlBar = ({ filters }) => {
  return (
    <motion.div className="control-bar glass" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
      <input
        className="search"
        type="search"
        placeholder="Search NORAD ID or object name"
        value={filters.search}
        onChange={(event) => filters.setSearch(event.target.value)}
      />
      <select value={filters.orbitClass} onChange={(event) => filters.setOrbitClass(event.target.value)}>
        <option value="ALL">All Orbits</option>
        <option value="LEO">LEO</option>
        <option value="MEO">MEO</option>
        <option value="GEO">GEO</option>
      </select>
      <label className="toggle">
        <input
          type="checkbox"
          checked={filters.showDebris}
          onChange={(event) => filters.setShowDebris(event.target.checked)}
        />
        Show Debris
      </label>
    </motion.div>
  );
};
