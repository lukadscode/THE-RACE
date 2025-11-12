import { create } from "zustand";
import { BONUS_INTERVAL_METERS, MAX_PLAYERS } from "./constants.js";
import * as bonuses from "./bonuses.js";
import { playRaceEndSound } from "../utils/AudioManager.js";

export const useGame = create((set, get) => ({
  meta: {
    running: false,
    paused: false,
    startTs: null,
    durationMs: null,
    lastBonusAt: 0,
    raceEnded: false,
    statusCode: null,
    statusDesc: null,
    timeRemaining: null,
  },
  players: {}, // key: lane -> { lane, name, color, meters, watts, spm, effectiveMeters, shieldUntil, forcedCadenceUntil, metersMultiplierUntil, globalHalfUntil }
  raceDef: null,
  results: null,
  setRaceDef: (def) => {
    console.log("[gameState] setRaceDef called with", def);
    set((state) => {
      const players = { ...state.players };

      if (def && def.boats) {
        for (const boat of def.boats) {
          const lane = boat.lane_number;
          const color = bonuses.autoColor(lane);

          if (!players[lane]) {
            players[lane] = {
              lane,
              name: boat.name || `P${lane}`,
              color,
              meters: 0,
              watts: 0,
              spm: 0,
              effectiveMeters: 0,
            };
          } else {
            players[lane].name = boat.name || `P${lane}`;
          }
        }
      }

      console.log("[gameState] Players initialized:", players);
      return { raceDef: def, players };
    });
  },
  setRunning: (running) => {
    console.log("[gameState] setRunning called avec compatibilité legacy", running);
    set((state) => ({
      meta: {
        ...state.meta,
        running,
        paused: running ? false : state.meta.paused,
        startTs: running && !state.meta.startTs ? Date.now() : state.meta.startTs,
      },
    }));
  },
  setRaceStatus: (status) => {
    console.log("[gameState] setRaceStatus", status);
    set((state) => {
      const code = status?.state ?? null;
      const running = code === 9;
      const paused = code === 10;
      const raceEnded = code === 11 ? true : (code === 0 ? false : state.meta.raceEnded);
      const nextMeta = {
        ...state.meta,
        running,
        paused,
        statusCode: code,
        statusDesc: status?.state_desc ?? state.meta.statusDesc,
        raceEnded,
      };

      if (paused) {
        nextMeta.pauseTs = Date.now();
      } else if (state.meta.paused && running) {
        const pauseDuration = state.meta.pauseTs ? Date.now() - state.meta.pauseTs : 0;
        nextMeta.pauseAccum = (state.meta.pauseAccum ?? 0) + pauseDuration;
        nextMeta.pauseTs = null;
      }

      if (status?.time !== undefined) {
        nextMeta.timeRemaining = status.time;
      }

      if (code === 0) {
        nextMeta.pauseTs = null;
        nextMeta.pauseAccum = 0;
        nextMeta.startTs = null;
        nextMeta.timeRemaining = null;
      } else if (running && !state.meta.running && !state.meta.startTs) {
        nextMeta.startTs = Date.now();
      }

      return { meta: nextMeta };
    });
  },
  setDuration: (ms) =>
    set((state) => ({ meta: { ...state.meta, durationMs: ms } })),
  checkRaceEnd: () => {
    const state = get();
    if (!state.meta.running || state.meta.raceEnded || !state.meta.durationMs) return;

    const elapsed = Date.now() - state.meta.startTs;
    if (elapsed >= state.meta.durationMs) {
      const finalResults = Object.values(state.players)
        .map(p => ({
          lane: p.lane,
          name: p.name,
          meters: p.effectiveMeters || 0,
          avgWatts: p.watts || 0,
          avgSpm: p.spm || 0
        }))
        .sort((a, b) => b.meters - a.meters);

      set({
        results: { results: finalResults },
        meta: { ...state.meta, running: false, paused: false, raceEnded: true }
      });

      playRaceEndSound();
    }
  },
  applyRaceData: (packet) => {
    console.log("[gameState] applyRaceData called", packet);
    set((state) => {
      const players = { ...state.players };
      for (const row of packet.data) {
        const lane = row.lane;
        if (!players[lane]) {
          const color = bonuses.autoColor(lane);
          players[lane] = {
            lane,
            name: `P${lane}`,
            color,
            meters: 0,
            watts: 0,
            spm: 0,
            effectiveMeters: 0,
          };
        }
        const p = players[lane];
        p.meters = row.meters ?? p.meters;
        p.watts = row.watts ?? p.watts;
        p.spm = row.spm ?? p.spm;

        // appliquer malus global "tout le monde moitié" s'il existe
        const half = bonuses.isGlobalHalfActive(state.meta, p);

        // appliquer multiplicateur individuel (double) + bouclier + cadence forcée
        const mult = bonuses.effectiveMultiplier(state.meta, p, half);
        const delta = Math.max(0, p.meters - (p.rawMetersPrev ?? 0));
        p.rawMetersPrev = p.meters;
        p.effectiveMeters = (p.effectiveMeters ?? 0) + Math.floor(delta * mult);
      }

      // Déclenchement bonus/malus tous les 200 m en prenant le leader "distance moyenne"
      const leaderMeters = Object.values(players).reduce(
        (m, p) => Math.max(m, p?.effectiveMeters ?? 0),
        0
      );
      const nextGate =
        Math.floor(leaderMeters / BONUS_INTERVAL_METERS) *
        BONUS_INTERVAL_METERS;
      let meta = { ...state.meta };
      if (
        nextGate >= state.meta.lastBonusAt + BONUS_INTERVAL_METERS &&
        leaderMeters > 0
      ) {
        meta.lastBonusAt = nextGate;
        // Tirage pondéré en fonction des positions
        const order = Object.values(players)
          .sort((a, b) => (b.effectiveMeters ?? 0) - (a.effectiveMeters ?? 0))
          .map((p, idx) => ({ lane: p.lane, rank: idx + 1 }));
        bonuses.rollAndApply(meta, players, order);
      }

      meta.timeRemaining = packet.time ?? meta.timeRemaining;
      return { players, meta };
    });
    get().checkRaceEnd();
  },
  setName: (lane, name) =>
    set((state) => ({
      players: { ...state.players, [lane]: { ...state.players[lane], name } },
    })),
  resetRace: () =>
    set({
      players: {},
      results: null,
      meta: {
        running: false,
        paused: false,
        startTs: null,
        durationMs: null,
        lastBonusAt: 0,
        raceEnded: false,
        statusCode: null,
        statusDesc: null,
        timeRemaining: null,
        pauseAccum: 0,
        pauseTs: null,
      },
    }),
  setResults: (results) => set({ results }),
}));
