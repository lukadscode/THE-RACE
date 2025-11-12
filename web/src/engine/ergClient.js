import { RELAY_URL } from "./constants.js";
import { useGame } from "./gameState.js";

export function connectRelay() {
  const ws = new WebSocket(RELAY_URL);
  const game = useGame.getState();

  ws.onopen = () => console.log("[front] connected to relay", RELAY_URL);
  ws.onmessage = (ev) => {
    let msg;
    try {
      msg = JSON.parse(ev.data);
    } catch {
      return;
    }
    const { type, payload } = msg;
    if (type === "race_definition") {
      useGame.getState().setRaceDef(payload);
      // set duration s'il y en a
      if (payload.duration) useGame.getState().setDuration(payload.duration);
    } else if (type === "race_status") {
      const running = payload.state === 9;
      useGame.getState().setRunning(running);
      if (!running && payload.state === 11) {
        // race complete → results si fournis
      }
    } else if (type === "race_data") {
      useGame.getState().applyRaceData(payload);
    } else if (type === "race_results") {
      useGame.getState().setResults(payload);
    }
  };
  ws.onclose = () => setTimeout(connectRelay, 1500);
  return ws;
}
