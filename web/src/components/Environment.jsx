import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky } from '@react-three/drei';

export function RaceSky() {
  return (
    <Sky
      distance={450000}
      sunPosition={[100, 20, 100]}
      inclination={0.6}
      azimuth={0.25}
      {...{
        turbidity: 8,
        rayleigh: 6,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.8,
      }}
    />
  );
}

export function DynamicLighting() {
  const spotRef1 = useRef();
  const spotRef2 = useRef();

  useFrame((state) => {
    if (spotRef1.current && spotRef2.current) {
      const t = state.clock.elapsedTime;
      spotRef1.current.position.x = Math.sin(t * 0.5) * 50;
      spotRef2.current.position.x = Math.cos(t * 0.5) * 50;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 50, 50]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <hemisphereLight
        skyColor="#87ceeb"
        groundColor="#1a1a2e"
        intensity={0.6}
      />
      <spotLight
        ref={spotRef1}
        position={[-30, 30, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.8}
        color="#00ffaa"
        castShadow
      />
      <spotLight
        ref={spotRef2}
        position={[30, 30, 0]}
        angle={0.3}
        penumbra={0.5}
        intensity={0.8}
        color="#ff0055"
        castShadow
      />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
    </>
  );
}

export function FogEffect() {
  return <fog attach="fog" args={['#0a0a15', 50, 200]} />;
}

export function StartGate() {
  const gateRef = useRef();

  useFrame((state) => {
    if (gateRef.current) {
      gateRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group position={[-200, 0, 0]} ref={gateRef}>
      <mesh position={[-10, 5, 0]}>
        <boxGeometry args={[1, 10, 1]} />
        <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[10, 5, 0]}>
        <boxGeometry args={[1, 10, 1]} />
        <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 9, 0]}>
        <boxGeometry args={[22, 1, 1]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

export function FinishLine() {
  return (
    <group position={[200, 0, 0]}>
      {[...Array(20)].map((_, i) => {
        const z = (i - 10) * 1.2;
        const isWhite = (i % 2) === 0;
        return (
          <mesh key={i} position={[0, 0.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[3, 1]} />
            <meshStandardMaterial
              color={isWhite ? '#ffffff' : '#000000'}
              emissive={isWhite ? '#ffffff' : '#000000'}
              emissiveIntensity={isWhite ? 0.5 : 0}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 8, -12]}>
        <boxGeometry args={[1, 16, 1]} />
        <meshStandardMaterial color="#ff0055" />
      </mesh>
      <mesh position={[0, 8, 12]}>
        <boxGeometry args={[1, 16, 1]} />
        <meshStandardMaterial color="#00ffaa" />
      </mesh>
    </group>
  );
}
