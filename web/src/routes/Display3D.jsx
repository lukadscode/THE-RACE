import React, { useEffect } from 'react';
import useRelaySocket from '../hooks/useRelaySocket.js';
import EnhancedThreeScene from '../components/EnhancedThreeScene.jsx';
import ArcadeHUD from '../components/ArcadeHUD.jsx';
import { PodiumOverlay } from '../components/PodiumScreen.jsx';
import { initAudio } from '../utils/AudioManager.js';

export default function Display3D(){
  useRelaySocket();

  useEffect(() => {
    initAudio();
  }, []);

  return (
    <div className="canvas-wrap">
      <EnhancedThreeScene />
      <ArcadeHUD />
      <PodiumOverlay />
    </div>
  );
}
