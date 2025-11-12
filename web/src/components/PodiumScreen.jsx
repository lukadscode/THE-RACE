import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { useGame } from '../engine/gameState.js';
import * as THREE from 'three';

export function PodiumScene() {
  const { players, results } = useGame();

  const podium = useMemo(() => {
    if (!results || !results.results) return [];
    return results.results.slice(0, 3);
  }, [results]);

  if (podium.length === 0) return null;

  const heights = [2, 3, 1.5];
  const positions = [[0, 0, 0], [-4, 0, 0], [4, 0, 0]];
  const labels = ['2nd', '1st', '3rd'];

  return (
    <group position={[0, 0, 0]}>
      {podium.map((result, idx) => {
        const player = players[result.lane];
        if (!player) return null;

        const height = heights[idx];
        const pos = positions[idx];

        return (
          <group key={result.lane} position={pos}>
            <mesh position={[0, height / 2, 0]} castShadow>
              <boxGeometry args={[2.5, height, 2.5]} />
              <meshStandardMaterial
                color={idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            <Text
              position={[0, height + 0.5, 1.3]}
              fontSize={0.3}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {labels[idx]}
            </Text>

            <Text
              position={[0, height + 1, 1.3]}
              fontSize={0.4}
              color={player.color}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {player.name}
            </Text>

            <Text
              position={[0, height + 1.5, 1.3]}
              fontSize={0.25}
              color="#ffaa00"
              anchorX="center"
              anchorY="middle"
            >
              {result.meters}m
            </Text>

            <AnimatedKartMiniature
              position={[0, height + 2.2, 0]}
              color={player.color}
              rank={idx}
            />
          </group>
        );
      })}

      <ConfettiEffect />
    </group>
  );
}

function AnimatedKartMiniature({ position, color, rank }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * (rank === 0 ? 2 : 1);
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.2;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <boxGeometry args={[0.8, 0.3, 0.45]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

function ConfettiEffect() {
  const confettiRef = useRef();
  const particleCount = 200;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 15 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      const hue = Math.random();
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      velocities.push({
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * -5,
        z: (Math.random() - 0.5) * 2
      });
    }

    return { positions, colors, velocities };
  }, []);

  useFrame((state, delta) => {
    if (!confettiRef.current) return;

    const pos = confettiRef.current.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += particles.velocities[i].x * delta;
      pos[i * 3 + 1] += particles.velocities[i].y * delta;
      pos[i * 3 + 2] += particles.velocities[i].z * delta;

      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 20;
        pos[i * 3] = (Math.random() - 0.5) * 20;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      }
    }

    confettiRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={confettiRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function PodiumOverlay() {
  const { results, resetRace } = useGame();

  if (!results || !results.results) return null;

  const top3 = results.results.slice(0, 3);

  return (
    <div className="podium-overlay">
      <div className="podium-panel">
        <h1 className="podium-title">🏆 RACE COMPLETE!</h1>

        <div className="podium-results">
          {top3.map((result, idx) => (
            <div key={result.lane} className={`podium-result rank-${idx + 1}`}>
              <div className="result-rank">
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </div>
              <div className="result-info">
                <div className="result-name">{result.name}</div>
                <div className="result-stats">
                  <span>{result.meters}m</span>
                  <span>{Math.round(result.avgWatts)}W avg</span>
                  <span>{Math.round(result.avgSpm)} spm</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-restart" onClick={resetRace}>
          NEW RACE
        </button>
      </div>
    </div>
  );
}
