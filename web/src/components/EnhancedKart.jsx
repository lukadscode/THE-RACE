import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGame } from '../engine/gameState.js';
import { BoostParticles, ShieldEffect } from './effects/ParticleSystem.jsx';
import * as THREE from 'three';

export default function EnhancedKart({ color='#6cf', lane=1, meters=0, index=0 }) {
  const kartRef = useRef();
  const wheelRefs = useRef([]);
  const [targetX, setTargetX] = useState((meters/10) - 60);
  const [currentX, setCurrentX] = useState((meters/10) - 60);
  const [speed, setSpeed] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [isBoost, setIsBoost] = useState(false);
  const [hasShield, setHasShield] = useState(false);

  const { players } = useGame();
  const player = players[lane];

  const x = (meters/10) - 60;
  const z = (lane - 8) * 0.8;

  const bodyColor = useMemo(() => color, [color]);

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
    <group ref={kartRef} position={[x, 0.5, z]}>
      <mesh castShadow>
        <boxGeometry args={[1.6, 0.6, 0.9]} />
        <meshStandardMaterial
          color={bodyColor}
          metalness={0.6}
          roughness={0.3}
          emissive={isBoost ? bodyColor : '#000000'}
          emissiveIntensity={isBoost ? 0.3 : 0}
        />
      </mesh>

      {[ -0.6, 0.6 ].map((dx, i) => (
        [ -0.35, 0.35 ].map((dz, j) => (
          <group key={`${i}-${j}`} position={[dx, -0.15, dz]}>
            <mesh
              ref={el => wheelRefs.current[i * 2 + j] = el}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.18, 0.18, 0.18, 16]} />
              <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.18, 0.04, 8, 16]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        ))
      ))}

      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.2, 0.2, 0.6]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      <mesh position={[0.6, 0.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={isBoost ? '#ffff00' : '#ff3300'}
          emissive={isBoost ? '#ffff00' : '#ff3300'}
          emissiveIntensity={1}
        />
      </mesh>
      <mesh position={[-0.6, 0.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial
          color={isBoost ? '#ffff00' : '#ff3300'}
          emissive={isBoost ? '#ffff00' : '#ff3300'}
          emissiveIntensity={1}
        />
      </mesh>

      <BoostParticles
        position={[currentX - 0.8, 0.3, z]}
        color={bodyColor}
        active={isBoost}
      />

      <ShieldEffect
        position={[0, 0, 0]}
        active={hasShield}
      />

      {speed > 5 && (
        <mesh position={[-0.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.2, 0.6, 8]} />
          <meshBasicMaterial
            color={bodyColor}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}
