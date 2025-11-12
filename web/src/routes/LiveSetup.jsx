import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../engine/gameState.js';

export default function LiveSetup() {
  const navigate = useNavigate();
  const { raceDef, setDuration } = useGame();
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [ergRaceUrl, setErgRaceUrl] = useState('ws://localhost:443');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  const handleConnect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
      setWs(null);
      setWsStatus('disconnected');
      return;
    }

    try {
      setWsStatus('connecting');
      const websocket = new WebSocket(ergRaceUrl);

      websocket.onopen = () => {
        console.log('[LiveSetup] Connected to ErgRace');
        setWsStatus('connected');
      };

      websocket.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          console.log('[LiveSetup] Received from ErgRace:', data);

          if (data.race_definition) {
            const def = data.race_definition;
            console.log('[LiveSetup] Race definition received:', def);
            useGame.getState().setRaceDef(def);
            if (def.duration) {
              setDuration(def.duration);
            }
          }

          if (data.race_status) {
            const status = data.race_status;
            console.log('[LiveSetup] Race status:', status.state, status.state_desc);

            if (status.state === 4) {
              console.log('[LiveSetup] SIT READY detected - Auto-launching Display3D');
              websocket.close();
              navigate('/display/3d?live=1');
            }
          }
        } catch (e) {
          console.error('[LiveSetup] Error parsing message:', e);
        }
      };

      websocket.onerror = (error) => {
        console.error('[LiveSetup] WebSocket error:', error);
        setWsStatus('error');
      };

      websocket.onclose = () => {
        console.log('[LiveSetup] Disconnected from ErgRace');
        setWsStatus('disconnected');
      };

      setWs(websocket);
    } catch (error) {
      console.error('[LiveSetup] Connection error:', error);
      setWsStatus('error');
    }
  };

  const handleStartRace = () => {
    if (raceDef) {
      navigate('/display/3d?live=1');
    }
  };

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected': return '#00ff88';
      case 'connecting': return '#ffaa00';
      case 'error': return '#ff4444';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (wsStatus) {
      case 'connected': return 'Connecté';
      case 'connecting': return 'Connexion...';
      case 'error': return 'Erreur';
      default: return 'Déconnecté';
    }
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="hero-title">THE RACE - MODE LIVE</h1>
        <p className="hero-subtitle">Connexion à ErgRace</p>
      </div>

      <div className="config-panel">
        <h2 className="config-title">Connexion ErgRace</h2>

        <div className="config-section">
          <label className="config-label">URL ErgRace</label>
          <input
            type="text"
            value={ergRaceUrl}
            onChange={(e) => setErgRaceUrl(e.target.value)}
            className="config-input"
            placeholder="ws://localhost:443"
            disabled={wsStatus === 'connected' || wsStatus === 'connecting'}
          />
          <div className="config-hint">
            Adresse WebSocket du serveur ErgRace
          </div>
        </div>

        <div className="config-section">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: `2px solid ${getStatusColor()}`
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: getStatusColor(),
              boxShadow: `0 0 10px ${getStatusColor()}`
            }} />
            <span style={{ color: getStatusColor(), fontWeight: 'bold' }}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <button
          className="btn-start-race"
          onClick={handleConnect}
          style={{
            background: wsStatus === 'connected' ? '#ff4444' : '#00ff88',
            marginBottom: '20px'
          }}
        >
          <span className="btn-text">
            {wsStatus === 'connected' ? 'Déconnecter' : 'Se connecter à ErgRace'}
          </span>
        </button>

        {raceDef && (
          <>
            <div className="config-section" style={{
              marginTop: '30px',
              padding: '20px',
              background: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '12px',
              border: '2px solid #00ff88'
            }}>
              <h3 style={{
                color: '#00ff88',
                marginBottom: '15px',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                Configuration de Course Reçue
              </h3>

              <div style={{ marginBottom: '15px' }}>
                <label className="config-label">Nom de l'événement</label>
                <div style={{
                  padding: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {raceDef.event_name || 'N/A'}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <label className="config-label">Type</label>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}>
                    {raceDef.duration_type === 'time' ? 'Temps' : 'Distance'}
                  </div>
                </div>
                <div>
                  <label className="config-label">Durée</label>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}>
                    {formatDuration(raceDef.duration)}
                  </div>
                </div>
                <div>
                  <label className="config-label">Rameurs</label>
                  <div style={{
                    padding: '10px',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '6px',
                    color: '#fff'
                  }}>
                    {raceDef.boats?.length || 0}
                  </div>
                </div>
              </div>

              <div>
                <label className="config-label">Liste des Rameurs</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px',
                  marginTop: '10px'
                }}>
                  {raceDef.boats?.map((boat, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: 'rgba(0,0,0,0.4)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        background: '#00ff88',
                        color: '#000',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {boat.lane_number}
                      </span>
                      <span style={{ color: '#fff', fontWeight: '500' }}>
                        {boat.name || `Lane ${boat.lane_number}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{
              padding: '20px',
              background: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '12px',
              border: '2px solid #00ff88',
              color: '#00ff88',
              textAlign: 'center',
              marginTop: '20px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>
                En attente du départ de la course
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                La vue 3D se lancera automatiquement dès que ErgRace enverra le signal "SIT READY"
              </div>
            </div>
          </>
        )}

        {wsStatus === 'connected' && !raceDef && (
          <div style={{
            padding: '15px',
            background: 'rgba(255, 170, 0, 0.1)',
            borderRadius: '8px',
            border: '2px solid #ffaa00',
            color: '#ffaa00',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            En attente de la configuration de course depuis ErgRace...
            <br />
            <small>Chargez une course dans ErgRace pour voir sa configuration</small>
          </div>
        )}
      </div>
    </div>
  );
}
