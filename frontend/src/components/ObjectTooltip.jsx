export const ObjectTooltip = ({ object }) => {
  if (!object) return null;

  return (
    <div className="tooltip glass">
      <p><span>Name:</span> {object.name}</p>
      <p><span>NORAD:</span> {object.noradId}</p>
      <p><span>Velocity:</span> {Number(object.velocityKms || 0).toFixed(2)} km/s</p>
      <p><span>Altitude:</span> {Number(object.position?.altKm || 0).toFixed(2)} km</p>
      <p><span>Type:</span> {object.objectType}</p>
    </div>
  );
};
