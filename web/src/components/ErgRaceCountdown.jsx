import React, { useState, useEffect } from 'react';
import { useGame } from '../engine/gameState.js';
import { playCountdownSound, playGoSound } from '../utils/AudioManager.js';

export default function ErgRaceCountdown() {
  const meta = useGame((state) => state.meta);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const statusCode = meta.statusCode;
    const statusDesc = meta.statusDesc;

    console.log('[ErgRaceCountdown] Status changed:', { statusCode, statusDesc });

    if (statusCode === 1) {
      setMessage('ÉCHAUFFEMENT');
      setVisible(true);
    } else if (statusCode === 2) {
      setMessage('ARRÊTEZ DE RAMER');
      setVisible(true);
    } else if (statusCode === 3) {
      setMessage('PRÊT');
      setVisible(true);
    } else if (statusCode === 4) {
      setMessage('SIT READY');
      setVisible(true);
      playCountdownSound();
    } else if (statusCode === 5) {
      setMessage('ATTENTION');
      setVisible(true);
      playCountdownSound();
    } else if (statusCode === 9) {
      setMessage('GO!');
      setVisible(true);
      playGoSound();
      setTimeout(() => {
        setVisible(false);
        setMessage('');
      }, 1500);
    } else if (statusCode === 11) {
      setMessage('COURSE TERMINÉE');
      setVisible(true);
    } else if (statusCode === 12) {
      setMessage('RÉSULTATS FINAUX');
      setVisible(true);
    } else if (statusCode === 13) {
      setVisible(false);
      setMessage('');
    }
  }, [meta.statusCode, meta.statusDesc]);

  if (!visible || !message) return null;

  const isGo = message === 'GO!';
  const isReady = message === 'SIT READY' || message === 'ATTENTION';

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        <div
          className={`countdown-message ${isGo ? 'go' : ''} ${isReady ? 'ready' : ''}`}
          key={message}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
