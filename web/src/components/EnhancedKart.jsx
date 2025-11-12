import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGame } from '../engine/gameState.js';
import { BoostParticles, ShieldEffect } from './effects/ParticleSystem.jsx';
import * as THREE from 'three';
import { buildKartPalette } from '../utils/color.js';

const LANE_SPACING = 1.4;

export default function EnhancedKart({
  color = '#6cf',
  lane = 1,
  meters = 0,
  index = 0,
  laneMin = 1,
  laneMax = 1
}) {
  const kartRef = useRef();
  const wheelRefs = useRef([]);
  const [targetX, setTargetX] = useState((meters/10) - 60);
  const [currentX, setCurrentX] = useState((meters/10) - 60);
  const [speed, setSpeed] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [isBoost, setIsBoost] = useState(false);
  const [hasShield, setHasShield] = useState(false);

  const players = useGame((state) => state.players);
  const player = players[lane];

  const x = (meters/10) - 60;
  const laneCenter = (laneMin + laneMax) / 2;
  const z = (lane - laneCenter) * LANE_SPACING;

  const { bodyColor, accentColor, trimColor, stripeColor, glowColor } = useMemo(
    () => buildKartPalette(color),
    [color]
  );

  useEffect(() => {
    if (player) {
      const boost = player.metersMultiplierUntil > Date.now();
      const shield = player.shieldUntil > Date.now();
      setIsBoost(boost);
      setHasShield(shield);
    }
  }, [player]);

  useFrame((state, delta) => {
    if (!kartRef.current) return;

    const targetPos = x;
    const diff = targetPos - currentX;
    const newX = currentX + diff * Math.min(1, delta * 5);
    setCurrentX(newX);
    setSpeed(Math.abs(diff) / delta);

    kartRef.current.position.x = newX;
    kartRef.current.position.z = z + Math.sin(state.clock.elapsedTime * 10) * 0.05;

    const targetTilt = THREE.MathUtils.clamp(diff * 0.5, -0.3, 0.3);
    const newTilt = THREE.MathUtils.lerp(tilt, targetTilt, delta * 3);
    setTilt(newTilt);

    kartRef.current.rotation.z = newTilt;
    kartRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 8) * 0.02;

    const bounceY = 0.5 + Math.abs(Math.sin(state.clock.elapsedTime * 15)) * 0.1;
    kartRef.current.position.y = bounceY;

    wheelRefs.current.forEach((wheel, idx) => {
      if (wheel) {
        wheel.rotation.x += speed * delta * 2;
      }
    });

    if (isBoost) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 20) * 0.05;
      kartRef.current.scale.setScalar(scale);
    } else {
      kartRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={kartRef} position={[x, 0.45, z]}>
      <mesh castShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.8, 0.1, 1.1]} />
        <meshStandardMaterial
          color={trimColor}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>

      <mesh castShadow position={[0.1, 0.05, 0]}>
        <boxGeometry args={[1.6, 0.3, 0.9]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>

      <mesh castShadow position={[0.45, 0.35, 0]}>
        <boxGeometry args={[0.7, 0.35, 0.7]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.4}
          roughness={0.35}
        />
      </mesh>

      <mesh castShadow position={[-0.35, 0.25, 0]}>
        <boxGeometry args={[0.7, 0.25, 0.75]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>

      <mesh castShadow position={[-0.75, 0.15, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.8]} />
        <meshStandardMaterial
          color={trimColor}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      <mesh castShadow position={[0.8, 0.1, 0]}>
        <boxGeometry args={[0.3, 0.2, 0.9]} />
        <meshStandardMaterial
          color={trimColor}
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      <mesh castShadow position={[0.2, 0.35, 0]}>
        <boxGeometry args={[1.0, 0.05, 0.95]} />
        <meshStandardMaterial
          color={stripeColor}
          metalness={0.3}
          roughness={0.3}
        />
      </mesh>

      {[ -0.75, 0.75 ].map((dx, i) => (
        [ -0.45, 0.45 ].map((dz, j) => (
          <group key={`${i}-${j}`} position={[dx, -0.2, dz]}>
            <mesh
              ref={el => wheelRefs.current[i * 2 + j] = el}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.22, 0.22, 0.25, 18]} />
              <meshStandardMaterial color={trimColor} metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.22, 0.05, 12, 24]} />
              <meshStandardMaterial color="#111111" metalness={0.2} roughness={0.5} />
            </mesh>
          </group>
        ))
      ))}

      <mesh position={[0.9, 0.25, 0]} rotation={[0, Math.PI / 12, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.8]} />
        <meshStandardMaterial
          color={stripeColor}
          metalness={0.35}
          roughness={0.3}
        />
      </mesh>

      <Text
        position={[-0.95, 0.35, 0]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.32}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {lane}
      </Text>

      <BoostParticles
        position={[currentX - 0.8, 0.3, z]}
        color={glowColor}
        active={isBoost}
      />

      <ShieldEffect
        position={[0, 0, 0]}
        active={hasShield}
      />

      {speed > 5 && (
        <mesh position={[-1.0, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.22, 0.7, 8]} />
          <meshBasicMaterial
            color={glowColor}
            transparent
            opacity={0.55}
          />
        </mesh>
      )}
    </group>
  );
}
