import React, { useMemo, useState } from 'react';
import { useGame } from '../engine/gameState.js';
import { DEFAULT_DURATION_MS } from '../engine/constants.js';
import { exportCSV } from '../engine/exportCsv.js';
import useRelaySocket from '../hooks/useRelaySocket.js';

export default function Admin(){
  useRelaySocket();
  const { meta, raceDef, players, setName, setDuration, resetRace } = useGame();
  const [dur, setDur] = useState((raceDef?.duration)||DEFAULT_DURATION_MS);
  const list = useMemo(()=>Object.values(players).sort((a,b)=>(b.effectiveMeters||0)-(a.effectiveMeters||0)), [players]);

  return (
    <div className="page">
      <div className="grid">
        <div className="panel" style={{gridColumn:'span 5'}}>
          <h2>Session</h2>
          <div style={{display:'grid', gap:8}}>
            <label>Durée (ms)
              <input className="input" type="number" value={dur} onChange={e=>setDur(Number(e.target.value))}/>
            </label>
            <div style={{display:'flex', gap:8}}>
              <button className="btn" onClick={()=>setDuration(dur)}>Appliquer</button>
              <button className="btn" onClick={()=>resetRace()}>Reset local</button>
            </div>
            <div>Statut: {meta.running ? <span className="badge ok">En course</span> : <span className="badge warn">Arrêt</span>}</div>
            <div>Passage bonus tous les 200 m</div>
          </div>
        </div>

        <div className="panel" style={{gridColumn:'span 7'}}>
          <h2>Joueurs ({list.length})</h2>
          <table className="leaderboard">
            <thead><tr><th>Lane</th><th>Nom</th><th>m (eff)</th><th>Watts</th><th>SPM</th></tr></thead>
            <tbody>
              {list.map(p=>(
                <tr key={p.lane}>
                  <td><span className="badge" style={{background:p.color,color:'#001'}}>{p.lane}</span></td>
                  <td><input className="input" style={{width:160}} value={p.name}
                      onChange={e=>setName(p.lane, e.target.value)}/></td>
                  <td>{p.effectiveMeters ?? 0}</td>
                  <td>{p.watts ?? 0}</td>
                  <td>{p.spm ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <button className="btn primary" onClick={()=>exportCSV(players)}>Exporter CSV</button>
          </div>
        </div>
      </div>
    </div>
  );
}
