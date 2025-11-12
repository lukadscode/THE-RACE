import React, { useMemo, useState, useEffect } from 'react';
import { useGame } from '../engine/gameState.js';

export default function ArcadeHUD() {
  const players = useGame((state) => state.players);
  const meta = useGame((state) => state.meta);
  const results = useGame((state) => state.results);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const board = useMemo(
    () => Object.values(players).sort((a, b) => (b.effectiveMeters || 0) - (a.effectiveMeters || 0)),
    [players]
  );

  const leader = board[0];
  const leaderMeters = leader?.effectiveMeters || 0;

  useEffect(() => {
    if (!meta.running || !meta.durationMs) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - meta.startTs;
      const remaining = Math.max(0, meta.durationMs - elapsed);
      setTimeRemaining(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [meta.running, meta.startTs, meta.durationMs]);

  const formatTime = (ms) => {
    if (ms === null) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const checkBonuses = () => {
      Object.values(players).forEach(p => {
        if (p.metersMultiplierUntil && p.metersMultiplierUntil > Date.now()) {
          const existing = notifications.find(n => n.id === `boost-${p.lane}`);
          if (!existing) {
            addNotification(`${p.name} - BOOST x2!`, '#ffaa00', `boost-${p.lane}`);
          }
        }
        if (p.shieldUntil && p.shieldUntil > Date.now()) {
          const existing = notifications.find(n => n.id === `shield-${p.lane}`);
          if (!existing) {
            addNotification(`${p.name} - SHIELD!`, '#00ffff', `shield-${p.lane}`);
          }
        }
      });
    };

    const interval = setInterval(checkBonuses, 500);
    return () => clearInterval(interval);
  }, [players, notifications]);

  const addNotification = (text, color, id) => {
    const newNotif = { text, color, id, timestamp: Date.now() };
    setNotifications(prev => [...prev.filter(n => n.id !== id), newNotif]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  if (results) {
    return null;
  }

  return (
    <div className="arcade-hud">
      <div className="hud-top">
        <div className="hud-timer">
          <div className="timer-label">TIME</div>
          <div className="timer-value" style={{
            color: timeRemaining && timeRemaining < 30000 ? '#ff3333' : '#00ffaa'
          }}>
            {formatTime(timeRemaining)}
          </div>
        </div>

        {meta.running && (
          <div className="hud-status">
            <div className="status-pulse"></div>
            <span>RACE IN PROGRESS</span>
          </div>
        )}
      </div>

      <div className="hud-leaderboard">
        <div className="leaderboard-title">STANDINGS</div>
        <div className="leaderboard-list">
          {board.slice(0, 8).map((p, i) => {
            const gapToLeader = leaderMeters - (p.effectiveMeters || 0);
            return (
              <div key={p.lane} className="leaderboard-item" style={{
                background: i === 0 ? 'rgba(255, 215, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)',
                borderLeft: `4px solid ${p.color}`
              }}>
                <div className="item-position">{i + 1}</div>
                <div className="item-name">{p.name}</div>
                <div className="item-stats">
                  <span className="stat-meters">{p.effectiveMeters || 0}m</span>
                  {i > 0 && gapToLeader > 0 && (
                    <span className="stat-gap">-{gapToLeader}m</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hud-notifications">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className="notification-item"
            style={{
              borderColor: notif.color,
              boxShadow: `0 0 20px ${notif.color}80`
            }}
          >
            <div className="notification-text" style={{ color: notif.color }}>
              {notif.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
