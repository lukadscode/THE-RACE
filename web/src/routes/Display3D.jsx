import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { connectRelay } from '../engine/ergClient.js';
import EnhancedThreeScene from '../components/EnhancedThreeScene.jsx';
import ArcadeHUD from '../components/ArcadeHUD.jsx';
import { PodiumOverlay } from '../components/PodiumScreen.jsx';
import CountdownOverlay from '../components/CountdownOverlay.jsx';
import ErgRaceCountdown from '../components/ErgRaceCountdown.jsx';
import { initAudio } from '../utils/AudioManager.js';
import { useGame } from '../engine/gameState.js';

export default function Display3D(){
  const [searchParams] = useSearchParams();
  const { setDuration, resetRace } = useGame();
  const [showCountdown, setShowCountdown] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState(null);
  const [wsRef, setWsRef] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);

  useEffect(() => {
    initAudio();
    resetRace();

    const isDemo = searchParams.get('demo') === '1';
    const liveMode = searchParams.get('live') === '1';

    if (isDemo) {
      const numKarts = parseInt(searchParams.get('numKarts')) || 8;
      const duration = parseInt(searchParams.get('duration')) || (7 * 60 * 1000 + 30 * 1000);
      const namesParam = searchParams.get('names');
      const names = namesParam ? namesParam.split(',') : Array.from({ length: numKarts }, (_, i) => `Player ${i + 1}`);

      const config = {
        numKarts,
        duration,
        names,
        eventName: 'THE RACE SIMULATION'
      };

      setDuration(duration);
      setSimulationConfig(config);
      setShowCountdown(true);
      setIsLiveMode(false);
    } else if (liveMode) {
      console.log('[Display3D] Mode LIVE - Connection au relay sans simulation');
      setIsLiveMode(true);
      const ws = connectRelay(null);
      setWsRef(ws);
    } else {
      setIsLiveMode(false);
      const ws = connectRelay(null);
      setWsRef(ws);
    }

    return () => {
      if (wsRef) wsRef.close();
    };
  }, [searchParams, setDuration, resetRace]);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    if (simulationConfig) {
      console.log('[Display3D] Countdown terminé - Démarrage simulation avec config:', simulationConfig);
      const ws = connectRelay(simulationConfig);
      setWsRef(ws);
    }
  }, [simulationConfig]);

  return (
    <div className="canvas-wrap">
      <EnhancedThreeScene />
      <ArcadeHUD />
      <PodiumOverlay />
      {showCountdown && <CountdownOverlay onComplete={handleCountdownComplete} />}
      {isLiveMode && <ErgRaceCountdown />}
    </div>
  );
}
