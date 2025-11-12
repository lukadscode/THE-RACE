import React, { useState, useEffect } from 'react';
import { playCountdownSound, playGoSound } from '../utils/AudioManager.js';

export default function CountdownOverlay({ onComplete }) {
  const [countdown, setCountdown] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const sequence = async () => {
      setMessage('ATTENTION AU DÉPART');
      playCountdownSound();
      await sleep(2000);

      setMessage('PRÊT');
      playCountdownSound();
      await sleep(1500);

      setMessage('');
      setCountdown(3);
      playCountdownSound();
      await sleep(1000);

      setCountdown(2);
      playCountdownSound();
      await sleep(1000);

      setCountdown(1);
      playCountdownSound();
      await sleep(1000);

      setMessage('GO!');
      setCountdown(null);
      playGoSound();
      await sleep(1000);

      onComplete();
    };

    sequence();
  }, [onComplete]);

  if (!countdown && !message) return null;

  return (
    <div className="countdown-overlay">
      <div className="countdown-content">
        {message && (
          <div className={`countdown-message ${message === 'GO!' ? 'go' : ''}`} key={message}>
            {message}
          </div>
        )}
        {countdown !== null && (
          <div className="countdown-number" key={countdown}>
            {countdown}
          </div>
        )}
      </div>
    </div>
  );
}
