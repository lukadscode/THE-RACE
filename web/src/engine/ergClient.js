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
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "start_simulation",
            config: simulationConfig
          }));
          console.log("[front] simulation config sent successfully");
        }
      }, 100);
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
    console.log(`[ergClient] Received message type: ${type}`, payload);

    if (type === "race_definition") {
      console.log("[ergClient] Processing race_definition");
      useGame.getState().setRaceDef(payload);
      if (payload.duration) useGame.getState().setDuration(payload.duration);
    } else if (type === "race_status") {
      console.log("[ergClient] Processing race_status, state:", payload.state);
      const running = payload.state === 9;
      useGame.getState().setRaceStatus(payload);
      if (!running && payload.state === 11) {
        console.log("[ergClient] Race complete");
      }
    } else if (type === "race_data") {
      useGame.getState().applyRaceData(payload);
    } else if (type === "race_results") {
      console.log("[ergClient] Processing race_results");
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

function sendControl(type) {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify({ type }));
  } else {
    console.warn(`[ergClient] Impossible d'envoyer ${type}, socket fermée`);
  }
}

export function pauseSimulation() {
  sendControl("pause_simulation");
}

export function resumeSimulation() {
  sendControl("resume_simulation");
}

export function stopSimulation() {
  sendControl("stop_simulation");
}

export function resetRaceOnRelay() {
  if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
    wsInstance.send(JSON.stringify({ type: "reset_race" }));
    console.log("[ergClient] Reset race sent to relay");
  } else {
    console.warn("[ergClient] Cannot send reset_race, socket closed");
  }
}
