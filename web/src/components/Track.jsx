import React from 'react';
import { useFrame } from '@react-three/fiber';

// Piste simple rectiligne avec repères tous les 200 m
export default function Track(){
  useFrame(()=>{});
  const length = 4000; // affichage
  const marks = Array.from({length: Math.floor(length/200)}, (_,i)=> (i+1)*200);
  return (
    <group>
      <mesh rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[120, 20]} />
        <meshStandardMaterial color="#0b1530" />
      </mesh>
      {marks.map((m,i)=>(
        <mesh key={i} position={[ (m/10)-60, 0.01, 0 ]} rotation={[-Math.PI/2,0,0]}>
          <planeGeometry args={[1.5, 12]} />
          <meshStandardMaterial color="#334" />
        </mesh>
      ))}
      {/* bordures */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,-6.5]}>
        <planeGeometry args={[120, 1]} />
        <meshStandardMaterial color="#1ae" />
      </mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.02,6.5]}>
        <planeGeometry args={[120, 1]} />
        <meshStandardMaterial color="#e11" />
      </mesh>
    </group>
  );
}
