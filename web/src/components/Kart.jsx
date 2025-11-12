import React, { useMemo } from 'react';

// Simple "kart" low-poly: boîte + roues
export default function Kart({ color='#6cf', lane=1, meters=0, index=0 }){
  // convertir mètres -> position x (scale 10m -> 1 unité)
  const x = (meters/10) - 60;
  // lane -> décalage y (z en 3D)
  const z = (lane - 8) * 0.8;

  const bodyColor = useMemo(()=>color, [color]);

  return (
    <group position={[x, 0.5, z]}>
      <mesh>
        <boxGeometry args={[1.6, 0.6, 0.9]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {[ -0.6, 0.6 ].map((dx,i)=>(
        [ -0.35, 0.35 ].map((dz,j)=>(
          <mesh key={`${i}-${j}`} position={[dx, -0.15, dz]}>
            <cylinderGeometry args={[0.18,0.18,0.18,16]} />
            <meshStandardMaterial color="#111" />
            <mesh rotation={[Math.PI/2,0,0]}>
              <torusGeometry args={[0.18, 0.06, 12, 24]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          </mesh>
        ))
      ))}
      <mesh position={[0,0.45,0]}>
        <boxGeometry args={[1.2,0.2,0.6]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
    </group>
  );
}
