import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const EARTH_RADIUS = 2;

const latLonToVec3 = (lat, lon, altKm = 0) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const radius = EARTH_RADIUS + Math.min(altKm / 10000, 1.2);

  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const Earth = ({ autoRotate, rotationSpeed }) => {
  const ref = useRef();

  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * rotationSpeed;
    }
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#1e90ff" emissive="#0c3a73" emissiveIntensity={0.8} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS + 0.08, 64, 64]} />
        <meshBasicMaterial color="#5bc5ff" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

const Marker = ({ object, onHover, onLeave, riskyNorad, selectedNorad, onSelect }) => {
  const pos = useMemo(
    () => latLonToVec3(object.position?.lat || 0, object.position?.lon || 0, object.position?.altKm || 0),
    [object.position?.lat, object.position?.lon, object.position?.altKm]
  );

  const style = useMemo(() => {
    if (object.status === "ACTIVE") {
      return { color: "#37ff8b", scale: 0.03, geometry: "sphere" };
    }
    if (object.status === "DEBRIS") {
      return { color: "#ff3b3b", scale: 0.05, geometry: "octa" };
    }
    return { color: "#ffd54d", scale: 0.04, geometry: "sphere" };
  }, [object.status]);

  const isRisk = riskyNorad.has(object.noradId);
  const isSelected = selectedNorad === object.noradId;

  return (
    <mesh
      position={pos}
      onPointerOver={() => onHover(object)}
      onPointerOut={onLeave}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(object.noradId);
      }}
      scale={isSelected ? style.scale * 2.4 : isRisk ? style.scale * 1.6 : style.scale}
    >
      {style.geometry === "octa" ? <octahedronGeometry args={[1, 0]} /> : <sphereGeometry args={[1, 8, 8]} />}
      <meshBasicMaterial color={isSelected ? "#ffffff" : isRisk ? "#ff1144" : style.color} toneMapped={false} />
    </mesh>
  );
};

const OrbitRing = ({ altitudeKm, risky }) => {
  const ringRadius = EARTH_RADIUS + Math.min(altitudeKm / 10000, 1.2);

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[ringRadius - 0.003, ringRadius + 0.003, 100]} />
      <meshBasicMaterial
        color={risky ? "#ff3b3b" : "#3ee8ff"}
        transparent
        opacity={risky ? 0.7 : 0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const SelectedOrbitPath = ({ object, risky }) => {
  const lat = ((object.position?.lat || 0) * Math.PI) / 180;
  const lon = ((object.position?.lon || 0) * Math.PI) / 180;
  const ringRadius = EARTH_RADIUS + Math.min((object.position?.altKm || 0) / 10000, 1.2);

  return (
    <mesh rotation={[Math.PI / 2 + lat * 0.4, lon * 0.7, 0]}>
      <torusGeometry args={[ringRadius, 0.012, 16, 220]} />
      <meshBasicMaterial color={risky ? "#ff2b55" : "#4af7ff"} transparent opacity={0.88} />
    </mesh>
  );
};

export const EarthScene = ({
  objects,
  alerts,
  onHover,
  onLeave,
  selectedNorad,
  onSelect,
  interaction,
}) => {
  const riskyNorad = useMemo(() => {
    const set = new Set();
    alerts.forEach((a) => {
      set.add(a.objectA);
      set.add(a.objectB);
    });
    return set;
  }, [alerts]);

  const rings = useMemo(() => {
    return objects.slice(0, 20).map((obj) => ({
      noradId: obj.noradId,
      altitudeKm: obj.position?.altKm || 0,
      risky: riskyNorad.has(obj.noradId),
    }));
  }, [objects, riskyNorad]);

  const selectedObject = useMemo(
    () => objects.find((item) => item.noradId === selectedNorad) || null,
    [objects, selectedNorad]
  );

  return (
    <Canvas
      camera={{ position: [0, 1.5, 8], fov: 50 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#050817"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 3, 5]} intensity={2.3} color="#7ec8ff" />
      <Stars radius={120} depth={45} count={7000} factor={4} saturation={0.5} fade speed={1} />
      <Earth autoRotate={interaction.autoRotate} rotationSpeed={interaction.rotationSpeed} />
      {interaction.showOrbits
        ? rings.map((ring) => (
            <OrbitRing key={ring.noradId} altitudeKm={ring.altitudeKm} risky={ring.risky} />
          ))
        : null}
      {selectedObject ? (
        <SelectedOrbitPath
          object={selectedObject}
          risky={riskyNorad.has(selectedObject.noradId)}
        />
      ) : null}
      {objects.map((object) => (
        <Marker
          key={object.noradId}
          object={object}
          onHover={onHover}
          onLeave={onLeave}
          riskyNorad={riskyNorad}
          selectedNorad={selectedNorad}
          onSelect={onSelect}
        />
      ))}
      <OrbitControls enablePan={false} minDistance={4.5} maxDistance={15} autoRotate={interaction.autoRotate} autoRotateSpeed={interaction.rotationSpeed * 1.8} />
    </Canvas>
  );
};
