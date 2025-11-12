import { RELAY_URL } from "./constants.js";
import { useGame } from "./gameState.js";

let wsInstance = null;

export function connectRelay(simulationConfig = null) {
  const ws = new WebSocket(RELAY_URL);
  wsInstance = ws;
  const game = useGame.getState();

  ws.onopen = () => {
    console.log("[front] connected to relay", RELAY_URL);

    if (simulationConfig) {
      console.log("[front] sending simulation config", simulationConfig);
      ws.send(JSON.stringify({
        type: "start_simulation",
        config: simulationConfig
      }));
    }
  };

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
      if (payload.duration) useGame.getState().setDuration(payload.duration);
    } else if (type === "race_status") {
      const running = payload.state === 9;
      useGame.getState().setRunning(running);
      if (!running && payload.state === 11) {
      }
    } else if (type === "race_data") {
      useGame.getState().applyRaceData(payload);
    } else if (type === "race_results") {
      useGame.getState().setResults(payload);
    }
  };
  ws.onclose = () => {
    wsInstance = null;
    setTimeout(() => connectRelay(simulationConfig), 1500);
  };
  return ws;
}

export function sendSimulationConfig(config) {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify({
      type: "start_simulation",
      config
    }));
  }
}
