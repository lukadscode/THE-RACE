import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sphere } from '@react-three/drei';

export default function EnhancedTrack() {
  const trackLength = 4000;
  const laneWidth = 1.2;
  const numLanes = 16;
  const totalWidth = numLanes * laneWidth;

  const curvePoints = useMemo(() => {
    const points = [];
    const segments = 200;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * (trackLength / 10) - (trackLength / 20);
      const z = Math.sin(t * Math.PI * 4) * 8;
      points.push(new THREE.Vector3(x, 0, z));
    }
    return points;
  }, []);

  const trackCurve = useMemo(() => new THREE.CatmullRomCurve3(curvePoints), [curvePoints]);

  const TrackSurface = () => {
    const meshRef = useRef();

    const geometry = useMemo(() => {
      const shape = new THREE.Shape();
      shape.moveTo(-totalWidth / 2, 0);
      shape.lineTo(totalWidth / 2, 0);
      shape.lineTo(totalWidth / 2, 1);
      shape.lineTo(-totalWidth / 2, 1);
      shape.lineTo(-totalWidth / 2, 0);

      const extrudeSettings = {
        steps: 200,
        bevelEnabled: false,
        extrudePath: trackCurve
      };

      return new THREE.ExtrudeGeometry(shape, extrudeSettings);
    }, []);

    return (
      <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    );
  };

  const LaneMarkers = () => {
    const markers = [];
    for (let lane = 1; lane < numLanes; lane++) {
      const z = (lane - numLanes / 2) * laneWidth;
      for (let i = 0; i < 20; i++) {
        const x = (i * 200 / 10) - (trackLength / 20);
        markers.push(
          <mesh key={`lane-${lane}-${i}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1, 0.1]} />
            <meshBasicMaterial color="#444" />
          </mesh>
        );
      }
    }
    return <>{markers}</>;
  };

  const DistanceMarkers = () => {
    const markers = [];
    for (let dist = 200; dist < trackLength; dist += 200) {
      const x = (dist / 10) - (trackLength / 20);
      markers.push(
        <group key={`dist-${dist}`} position={[x, 0, 0]}>
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[totalWidth, 2]} />
            <meshStandardMaterial color="#2a2a4e" />
          </mesh>
          <mesh position={[0, 0.04, -totalWidth / 2 - 1]}>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0, 0.04, totalWidth / 2 + 1]}>
            <boxGeometry args={[0.5, 2, 0.5]} />
            <meshStandardMaterial color="#ff0055" emissive="#ff0055" emissiveIntensity={0.5} />
          </mesh>
        </group>
      );
    }
    return <>{markers}</>;
  };

  const Borders = () => {
    return (
      <>
        <mesh position={[0, 0.1, -totalWidth / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[trackLength / 10, 1]} />
          <meshStandardMaterial
            color="#00ffaa"
            emissive="#00ffaa"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh position={[0, 0.1, totalWidth / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[trackLength / 10, 1]} />
          <meshStandardMaterial
            color="#ff0055"
            emissive="#ff0055"
            emissiveIntensity={0.3}
          />
        </mesh>
      </>
    );
  };

  const Decorations = () => {
    const trees = [];
    for (let i = 0; i < 30; i++) {
      const x = (Math.random() * trackLength / 10) - (trackLength / 20);
      const side = Math.random() > 0.5 ? 1 : -1;
      const z = side * (totalWidth / 2 + 5 + Math.random() * 10);
      trees.push(
        <group key={`tree-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 2, 0]}>
            <coneGeometry args={[1.5, 4, 6]} />
            <meshStandardMaterial color="#1a5f1a" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
        </group>
      );
    }

    const crowd = [];
    for (let i = 0; i < 40; i++) {
      const x = (i * 100 / 10) - (trackLength / 20);
      const side = i % 2 === 0 ? 1 : -1;
      const z = side * (totalWidth / 2 + 3);
      crowd.push(
        <Sphere key={`crowd-${i}`} args={[0.3, 8, 8]} position={[x, 0.3, z]}>
          <meshStandardMaterial color={`hsl(${Math.random() * 360}, 70%, 60%)`} />
        </Sphere>
      );
    }

    return (
      <>
        {trees}
        {crowd}
      </>
    );
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[trackLength / 10 + 50, 100]} />
        <meshStandardMaterial color="#0a0a15" />
      </mesh>
      <TrackSurface />
      <LaneMarkers />
      <DistanceMarkers />
      <Borders />
      <Decorations />
    </group>
  );
}
