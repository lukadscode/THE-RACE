import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useGame } from '../engine/gameState.js';
import * as THREE from 'three';

export default function CinematicCamera({ enabled = true }) {
  const cameraRef = useRef();
  const { camera } = useThree();
  const { players, meta } = useGame();

  const targetPos = useRef(new THREE.Vector3(0, 12, 24));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (!enabled || !cameraRef.current) return;

    const leaderData = Object.values(players).reduce((max, p) => {
      return (p.effectiveMeters || 0) > (max.effectiveMeters || 0) ? p : max;
    }, { effectiveMeters: 0, lane: 8 });

    if (leaderData.effectiveMeters > 0) {
      const leaderX = (leaderData.effectiveMeters / 10) - 60;
      const leaderZ = (leaderData.lane - 8) * 0.8;

      targetPos.current.set(
        leaderX - 15,
        8 + Math.sin(state.clock.elapsedTime * 0.5) * 2,
        leaderZ + 12 + Math.sin(state.clock.elapsedTime * 0.3) * 4
      );

      targetLookAt.current.set(leaderX + 5, 1, leaderZ);
    } else {
      targetPos.current.set(0, 12, 24);
      targetLookAt.current.set(0, 0, 0);
    }

    cameraRef.current.position.lerp(targetPos.current, delta * 2);
    currentLookAt.current.lerp(targetLookAt.current, delta * 2);
    cameraRef.current.lookAt(currentLookAt.current);

    cameraRef.current.fov = 60 + Math.sin(state.clock.elapsedTime * 0.5) * 5;
    cameraRef.current.updateProjectionMatrix();
  });

  useEffect(() => {
    if (enabled && cameraRef.current) {
      cameraRef.current.position.set(0, 12, 24);
    }
  }, [enabled]);

  if (!enabled) return null;

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 12, 24]}
      fov={60}
      near={0.1}
      far={1000}
    />
  );
}
