"use client";

export default function Drift3DScene() {
  return (
    <>
      <color attach="background" args={["#f7f4ed"]} />
      <hemisphereLight args={["#ffffff", "#d6cec1", 1.6]} />
      <directionalLight position={[4, 7, 3]} intensity={1.2} />
      <ambientLight intensity={0.45} />

      <group rotation={[0, -0.32, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
          <planeGeometry args={[15, 9.5]} />
          <meshStandardMaterial color="#f1ede4" roughness={0.92} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.065, 0]}>
          <ringGeometry args={[1.08, 1.12, 72]} />
          <meshStandardMaterial color="#cfd8d9" roughness={0.86} />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.055, 0]}>
          <ringGeometry args={[1.72, 1.75, 72]} />
          <meshStandardMaterial color="#e0d4bf" roughness={0.9} />
        </mesh>

        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.46, 0.58, 0.22, 6]} />
            <meshStandardMaterial color="#292621" roughness={0.7} />
          </mesh>

          <mesh position={[0, 0.5, 0]}>
            <octahedronGeometry args={[0.36, 0]} />
            <meshStandardMaterial
              color="#fff8e6"
              emissive="#f4c56f"
              emissiveIntensity={0.2}
              roughness={0.52}
            />
          </mesh>

          <mesh position={[0, 0.84, 0]} rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.08, 0.42, 0.08]} />
            <meshStandardMaterial color="#7c807c" roughness={0.8} />
          </mesh>
        </group>

        <mesh position={[2.8, 0.02, -1.7]} rotation={[0, 0.28, 0]}>
          <boxGeometry args={[1.6, 0.04, 0.06]} />
          <meshStandardMaterial color="#d7cab6" roughness={0.88} />
        </mesh>

        <mesh position={[-3.2, 0.02, 1.8]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[1.9, 0.04, 0.06]} />
          <meshStandardMaterial color="#d5d9d7" roughness={0.88} />
        </mesh>
      </group>
    </>
  );
}
