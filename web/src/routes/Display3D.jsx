import React from 'react';
import useRelaySocket from '../hooks/useRelaySocket.js';
import ThreeScene from '../components/ThreeScene.jsx';
import HUD from '../components/HUD.jsx';

export default function Display3D(){
  useRelaySocket();
  return (
    <div className="canvas-wrap">
      <ThreeScene />
      <HUD />
    </div>
  );
}
