import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../engine/gameState.js';

export default function Home() {
  const navigate = useNavigate();
  const { setDuration, resetRace } = useGame();

  const [config, setConfig] = useState({
    mode: 'demo',
    numKarts: 8,
    durationMinutes: 7,
    durationSeconds: 30,
    kartNames: []
  });

  useEffect(() => {
    const names = Array.from({ length: config.numKarts }, (_, i) =>
      config.kartNames[i] || `Player ${i + 1}`
    );
    setConfig(prev => ({ ...prev, kartNames: names }));
  }, [config.numKarts]);

  const handleNumKartsChange = (value) => {
    const num = Math.max(1, Math.min(16, parseInt(value) || 1));
    setConfig(prev => ({ ...prev, numKarts: num }));
  };

  const handleKartNameChange = (index, name) => {
    setConfig(prev => {
      const newNames = [...prev.kartNames];
      newNames[index] = name;
      return { ...prev, kartNames: newNames };
    });
  };

  const handleStartRace = () => {
    const totalMs = (config.durationMinutes * 60 + config.durationSeconds) * 1000;
    resetRace();
    setDuration(totalMs);

    if (config.mode === 'demo') {
      const params = new URLSearchParams({
        demo: '1',
        numKarts: config.numKarts.toString(),
        duration: totalMs.toString(),
        names: config.kartNames.filter(n => n).join(',')
      });

      localStorage.setItem('simulation-config', JSON.stringify(config));
      navigate(`/display/3d?${params.toString()}`);
    } else {
      navigate('/display/3d');
    }
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="hero-title">ERGKART</h1>
        <p className="hero-subtitle">Indoor Rowing Racing Experience</p>
      </div>

      <div className="config-panel">
        <h2 className="config-title">Configuration de la Course</h2>

        <div className="config-section">
          <label className="config-label">Mode de Course</label>
          <div className="mode-selector">
            <button
              className={`mode-btn ${config.mode === 'demo' ? 'active' : ''}`}
              onClick={() => setConfig(prev => ({ ...prev, mode: 'demo' }))}
            >
              <div className="mode-icon">🎮</div>
              <div className="mode-text">
                <div className="mode-name">Mode Simulation</div>
                <div className="mode-desc">Rameurs virtuels simulés</div>
              </div>
            </button>
            <button
              className={`mode-btn ${config.mode === 'live' ? 'active' : ''}`}
              onClick={() => setConfig(prev => ({ ...prev, mode: 'live' }))}
            >
              <div className="mode-icon">🏃</div>
              <div className="mode-text">
                <div className="mode-name">Mode Live</div>
                <div className="mode-desc">Rameurs réels via ErgRace</div>
              </div>
            </button>
          </div>
        </div>

        {config.mode === 'demo' && (
          <>
            <div className="config-section">
              <label className="config-label">Nombre de Karts</label>
              <input
                type="number"
                min="1"
                max="16"
                value={config.numKarts}
                onChange={(e) => handleNumKartsChange(e.target.value)}
                className="config-input"
              />
              <div className="config-hint">Entre 1 et 16 rameurs</div>
            </div>

            <div className="config-section">
              <label className="config-label">Durée de la Course</label>
              <div className="duration-inputs">
                <div className="duration-group">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={config.durationMinutes}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      durationMinutes: Math.max(0, Math.min(60, parseInt(e.target.value) || 0))
                    }))}
                    className="config-input"
                  />
                  <span className="duration-label">minutes</span>
                </div>
                <div className="duration-group">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={config.durationSeconds}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      durationSeconds: Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                    }))}
                    className="config-input"
                  />
                  <span className="duration-label">secondes</span>
                </div>
              </div>
            </div>

            <div className="config-section">
              <label className="config-label">Noms des Karts</label>
              <div className="kart-names-grid">
                {config.kartNames.map((name, idx) => (
                  <div key={idx} className="kart-name-item">
                    <span className="kart-number">{idx + 1}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleKartNameChange(idx, e.target.value)}
                      className="kart-name-input"
                      placeholder={`Player ${idx + 1}`}
                      maxLength={20}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button className="btn-start-race" onClick={handleStartRace}>
          <span className="btn-icon">🏁</span>
          <span className="btn-text">Démarrer la Course</span>
        </button>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Bonus/Malus</h3>
          <p>Système de power-ups tous les 200m</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3>Graphismes 3D</h3>
          <p>Environnement immersif avec effets visuels</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Podium Animé</h3>
          <p>Célébration des vainqueurs en fin de course</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Stats en Direct</h3>
          <p>Classement et performances temps réel</p>
        </div>
      </div>
    </div>
  );
}
