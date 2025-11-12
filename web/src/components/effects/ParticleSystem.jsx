import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function BoostParticles({ position, color, active }) {
  const pointsRef = useRef();
  const particleCount = 50;

  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const lifetimes = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      velocities.push({
        x: (Math.random() - 0.5) * 0.5,
        y: Math.random() * 0.3 - 0.1,
        z: (Math.random() - 0.5) * 0.5
      });
      lifetimes.push(Math.random());
    }

    return { positions, velocities, lifetimes };
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current || !active) return;

    const pos = pointsRef.current.geometry.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      lifetimes[i] -= delta * 2;

      if (lifetimes[i] <= 0) {
        lifetimes[i] = 1;
        pos[i * 3] = position[0];
        pos[i * 3 + 1] = position[1];
        pos[i * 3 + 2] = position[2];
      } else {
        pos[i * 3] += velocities[i].x * delta * 10;
        pos[i * 3 + 1] += velocities[i].y * delta * 10;
        pos[i * 3 + 2] += velocities[i].z * delta * 10;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export function SpeedTrail({ positions, color, visible }) {
  if (!visible || positions.length < 2) return null;

  const points = positions.map(p => new THREE.Vector3(p[0], p[1] + 0.2, p[2]));
  const curve = new THREE.CatmullRomCurve3(points);
  const trailPoints = curve.getPoints(50);

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={trailPoints.length}
          array={new Float32Array(trailPoints.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.4}
        linewidth={2}
        blending={THREE.AdditiveBlending}
      />
    </line>
  );
}

export function ShieldEffect({ position, active }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 4) * 0.1);
  });

  if (!active) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1.5, 16, 16]} />
      <meshBasicMaterial
        color="#00ffff"
        transparent
        opacity={0.2}
        wireframe
      />
    </mesh>
  );
}

export function BonusNotification({ position, text, color }) {
  const meshRef = useRef();
  const [opacity, setOpacity] = React.useState(1);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.position.y += delta * 2;
    setOpacity(prev => Math.max(0, prev - delta));
  });

  if (opacity <= 0) return null;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <planeGeometry args={[2, 0.5]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}
