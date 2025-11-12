export const MAX_PLAYERS = 16;
export const BONUS_INTERVAL_METERS = 200;
export const DEFAULT_DURATION_MS = 7 * 60 * 1000 + 30 * 1000; // 7:30
export const RELAY_URL =
  (location.protocol === "https:" ? "wss://" : "ws://") +
  (location.hostname || "localhost") +
  ":8090";
