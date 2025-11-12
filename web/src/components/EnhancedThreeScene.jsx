import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGame } from '../engine/gameState.js';
import EnhancedKart from './EnhancedKart.jsx';
import EnhancedTrack from './EnhancedTrack.jsx';
import { RaceSky, DynamicLighting, StartGate, FinishLine } from './Environment.jsx';
import { PodiumScene } from './PodiumScreen.jsx';
import CinematicCamera from './CinematicCamera.jsx';

export default function EnhancedThreeScene() {
  const players = useGame((state) => state.players);
  const results = useGame((state) => state.results);

  const sorted = useMemo(
    () => {
      const sorted = Object.values(players).sort((a, b) => a.lane - b.lane);
      console.log("[EnhancedThreeScene] Sorted players:", sorted);
      return sorted;
    },
    [players]
  );

  const showPodium = results && results.results;

  return (
    <Canvas shadows>
      <Suspense fallback={null}>
        {showPodium ? (
          <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 20, 10]} intensity={1.2} />
            <spotLight position={[0, 30, 0]} angle={0.5} penumbra={0.5} intensity={1.5} />
            <PodiumScene />
            <OrbitControls enablePan={false} />
          </>
        ) : (
          <>
            <RaceSky />
            <DynamicLighting />
            <CinematicCamera enabled={true} />
            <EnhancedTrack />
            <StartGate />
            <FinishLine />
            {sorted.map((p, idx) => (
              <EnhancedKart
                key={p.lane}
                color={p.color}
                lane={p.lane}
                meters={p.effectiveMeters || 0}
                index={idx}
              />
            ))}
            <OrbitControls enablePan={false} />
          </>
        )}
      </Suspense>
    </Canvas>
  );
}
