// Simple relay ErgRace -> clients front
// - Se connecte à ws://localhost:443 (ErgRace)
// - Diffuse les messages utiles aux clients sur ws://localhost:8090
// - Mode démo optionnel si ErgRace indisponible
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const ERGRACE_URL = process.env.ERGRACE_URL || "ws://localhost:443";
const RELAY_PORT = Number(process.env.RELAY_PORT || 8090);
const DEMO = process.env.DEMO === "1";

const server = http.createServer();
const wss = new WebSocketServer({ server });
server.listen(RELAY_PORT, () =>
  console.log(`[relay] listening ws://localhost:${RELAY_PORT}`)
);

let erg;
let clients = new Set();
let lastRaceDefinition = null;
let lastStatus = null;

// Broadcast helper
const broadcast = (type, payload) => {
  const msg = JSON.stringify({ type, payload, ts: Date.now() });
  clients.forEach((ws) => {
    if (ws.readyState === ws.OPEN) ws.send(msg);
  });
};

// Accept front clients
wss.on("connection", (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ type: "hello", payload: { demo: DEMO } }));
  if (lastRaceDefinition)
    ws.send(
      JSON.stringify({ type: "race_definition", payload: lastRaceDefinition })
    );
  if (lastStatus)
    ws.send(JSON.stringify({ type: "race_status", payload: lastStatus }));
  ws.on("close", () => clients.delete(ws));
});

// Connect to ErgRace (or demo generator)
const connectErg = () => {
  if (DEMO) {
    console.log("[relay] DEMO mode ON");
    startDemo();
    return;
  }
  console.log("[relay] connecting to", ERGRACE_URL);
  erg = new WebSocket(ERGRACE_URL);
  erg.on("open", () => console.log("[relay] connected to ErgRace"));
  erg.on("close", () => {
    console.log("[relay] ErgRace closed, retrying in 3s");
    setTimeout(connectErg, 3000);
  });
  erg.on("error", (e) => console.log("[relay] ErgRace error", e.message));
  erg.on("message", (buf) => {
    let msg;
    try {
      msg = JSON.parse(buf.toString());
    } catch {
      return;
    }
    if (msg.race_definition) {
      lastRaceDefinition = msg.race_definition;
      broadcast("race_definition", msg.race_definition);
    } else if (msg.race_status) {
      lastStatus = msg.race_status;
      broadcast("race_status", msg.race_status);
    } else if (msg.race_data) {
      broadcast("race_data", msg.race_data); // data.data[] et time
    } else if (msg.race_results) {
      broadcast("race_results", msg.race_results);
    }
  });
};

function startDemo() {
  // 8 rameurs simulés
  const lanes = 8;
  let meters = Array.from({ length: lanes }, () => 0);
  let watts = Array.from({ length: lanes }, () => 150 + Math.random() * 150);
  let spm = Array.from({ length: lanes }, () => 22 + Math.random() * 8);
  let running = true;
  const durationMs = 7 * 60 * 1000 + 30 * 1000;

  const race_definition = {
    boats: Array.from({ length: lanes }, (_, i) => ({
      name: `Player ${i + 1}`,
      lane_number: i + 1,
      is_paceboat: 0,
      machine_type: "row",
    })),
    duration: durationMs,
    duration_type: "time",
    race_type: "individual",
    event_name: "DEMO ERGKART",
  };

  lastRaceDefinition = race_definition;
  broadcast("race_definition", race_definition);
  lastStatus = { state: 9, state_desc: "race running" };
  broadcast("race_status", lastStatus);
  const start = Date.now();

  const tick = () => {
    if (!running) return;
    const t = Date.now() - start;
    // avance ~ m/s ~ f(watts)
    for (let i = 0; i < lanes; i++) {
      // approx: v(m/s) ~ k*sqrt(watts) ; k choisi pour ~3.5km/7m30
      const v = 0.1 * Math.sqrt(watts[i] / 2);
      meters[i] += v * 0.2; // 200ms
      // petites variations
      watts[i] += (Math.random() - 0.5) * 10;
      spm[i] += (Math.random() - 0.5) * 1;
    }
    const data = {
      data: meters.map((m, idx) => ({
        lane: idx + 1,
        meters: Math.floor(m),
        watts: Math.max(0, Math.floor(watts[idx])),
        spm: Math.max(16, Math.floor(spm[idx])),
        position: 0,
        time: Math.max(0, durationMs - t),
        is_paceboat: 0,
        erg_status: "1",
      })),
      time: Math.max(0, durationMs - t),
    };
    broadcast("race_data", data);
    if (t < durationMs) setTimeout(tick, 200);
    else {
      running = false;
      broadcast("race_status", { state: 11, state_desc: "race complete" });
    }
  };
  tick();
}

connectErg();
