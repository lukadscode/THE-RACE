import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useGame } from '../engine/gameState.js';
import Kart from './Kart.jsx';
import Track from './Track.jsx';

export default function ThreeScene(){
  const { players } = useGame();
  const sorted = useMemo(()=>Object.values(players).sort((a,b)=>(a.lane)-(b.lane)), [players]);

  return (
    <Canvas camera={{ position:[0,12,24], fov:55 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10,20,10]} intensity={1.1} />
      <Track />
      {sorted.map((p, idx)=>(
        <Kart key={p.lane} color={p.color} lane={p.lane} meters={p.effectiveMeters||0} index={idx}/>
      ))}
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
