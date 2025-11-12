import React, { useMemo } from 'react';
import { useGame } from '../engine/gameState.js';

export default function HUD(){
  const { players } = useGame();
  const board = useMemo(()=>Object.values(players).sort((a,b)=>(b.effectiveMeters||0)-(a.effectiveMeters||0)), [players]);
  return (
    <div className="hud">
      <div className="panel" style={{minWidth:260}}>
        <strong>Classement</strong>
        <div style={{marginTop:8}}>
          {board.slice(0,6).map((p,i)=>(
            <div key={p.lane} style={{display:'flex', justifyContent:'space-between', gap:8}}>
              <span><span className="badge" style={{background:p.color,color:'#001'}}>{i+1}</span> {p.name}</span>
              <span>{p.effectiveMeters||0}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
