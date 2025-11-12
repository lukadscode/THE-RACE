import { create } from "zustand";
import { BONUS_INTERVAL_METERS, MAX_PLAYERS } from "./constants.js";
import * as bonuses from "./bonuses.js";

export const useGame = create((set, get) => ({
  meta: {
    running: false,
    startTs: null,
    durationMs: null,
    lastBonusAt: 0,
  },
  players: {}, // key: lane -> { lane, name, color, meters, watts, spm, effectiveMeters, shieldUntil, forcedCadenceUntil, metersMultiplierUntil, globalHalfUntil }
  raceDef: null,
  results: null,
  setRaceDef: (def) => set({ raceDef: def }),
  setRunning: (running) =>
    set((state) => ({
      meta: {
        ...state.meta,
        running,
        startTs: running ? Date.now() : state.meta.startTs,
      },
    })),
  setDuration: (ms) =>
    set((state) => ({ meta: { ...state.meta, durationMs: ms } })),
  applyRaceData: (packet) => {
    // packet = { data: [ { lane, meters, watts, spm, ... } ], time }
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

      return { players, meta };
    });
  },
  setName: (lane, name) =>
    set((state) => ({
      players: { ...state.players, [lane]: { ...state.players[lane], name } },
    })),
  resetRace: () =>
    set({
      players: {},
      results: null,
      meta: { running: false, startTs: null, durationMs: null, lastBonusAt: 0 },
    }),
  setResults: (results) => set({ results }),
}));
