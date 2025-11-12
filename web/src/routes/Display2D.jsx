import React, { useMemo } from 'react';
import { useGame } from '../engine/gameState.js';
import useRelaySocket from '../hooks/useRelaySocket.js';

export default function Display2D(){
  useRelaySocket();
  const { players, meta } = useGame();
  const list = useMemo(()=>Object.values(players).sort((a,b)=>(b.effectiveMeters||0)-(a.effectiveMeters||0)), [players]);
  const leader = list[0]?.effectiveMeters ?? 1;
  return (
    <div className="page">
      <div className="panel">
        <h2>Vue 2D (Top-down)</h2>
        <div style={{height:12, marginBottom:8}}>
          {meta.running ? <span className="badge ok">RUN</span> : <span className="badge warn">STOP</span>}
        </div>
        <div style={{position:'relative', height:400, background:'#0b1020', borderRadius:12, overflow:'hidden', border:'1px solid #223'}}>
          {list.map((p, idx)=>(
            <div key={p.lane} style={{
              position:'absolute',
              left: `${Math.min(100, (p.effectiveMeters/leader)*90)}%`,
              top: `${(idx+1)*24}px`,
              height:16, width:16, borderRadius:4, background:p.color,
              boxShadow:'0 0 12px rgba(255,255,255,.25)'
            }} title={`${p.name} - ${p.effectiveMeters}m`} />
          ))}
        </div>
        <table className="leaderboard" style={{marginTop:12}}>
          <thead><tr><th>#</th><th>Nom</th><th>m (eff)</th><th>W</th><th>SPM</th></tr></thead>
          <tbody>
            {list.map((p,i)=>(
              <tr key={p.lane}>
                <td>{i+1}</td><td>{p.name}</td><td>{p.effectiveMeters||0}</td>
                <td>{p.watts||0}</td><td>{p.spm||0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
