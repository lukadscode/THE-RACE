import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { buildKartPalette } from '../utils/color.js';

const LANE_SPACING = 1.4;

// Simple "kart" low-poly: boîte + roues
export default function Kart({
  color = '#6cf',
  lane = 1,
  meters = 0,
  index = 0,
  laneMin = 1,
  laneMax = 1
}) {
  // convertir mètres -> position x (scale 10m -> 1 unité)
  const x = (meters / 10) - 60;
  // lane -> décalage y (z en 3D)
  const laneCenter = (laneMin + laneMax) / 2;
  const z = (lane - laneCenter) * LANE_SPACING;

  const { bodyColor, accentColor, trimColor, stripeColor, glowColor } = useMemo(
    () => buildKartPalette(color),
    [color]
  );

  return (
    <group position={[x, 0.5, z]}>
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[1.7, 0.08, 1.0]} />
        <meshStandardMaterial color={trimColor} metalness={0.4} roughness={0.4} />
      </mesh>

      <mesh position={[0.1, 0.02, 0]}>
        <boxGeometry args={[1.4, 0.25, 0.85]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.4} />
      </mesh>

      <mesh position={[0.45, 0.28, 0]}>
        <boxGeometry args={[0.65, 0.3, 0.6]} />
        <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.45} />
      </mesh>

      <mesh position={[-0.35, 0.18, 0]}>
        <boxGeometry args={[0.6, 0.2, 0.65]} />
        <meshStandardMaterial color={accentColor} metalness={0.3} roughness={0.5} />
      </mesh>

      <mesh position={[0.2, 0.28, 0]}>
        <boxGeometry args={[0.95, 0.04, 0.8]} />
        <meshStandardMaterial color={stripeColor} metalness={0.2} roughness={0.35} />
      </mesh>

      {[ -0.65, 0.65 ].map((dx, i) => (
        [ -0.4, 0.4 ].map((dz, j) => (
          <group key={`${i}-${j}`} position={[dx, -0.18, dz]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.22, 16]} />
              <meshStandardMaterial color="#1b1b1b" metalness={0.2} roughness={0.6} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.2, 0.05, 12, 24]} />
              <meshStandardMaterial color={trimColor} metalness={0.3} roughness={0.4} />
            </mesh>
          </group>
        ))
      ))}

      <Text
        position={[-0.85, 0.3, 0]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {lane}
      </Text>
    </group>
  );
}
