// Bonus / malus:
// 1) metersPlus: +X mètres instant
// 2) forceOthersCadenceMax20: force cadence <=20 spm (période)
// 3) globalHalfMeters: tout le monde compte moitié (période)
// 4) selfDoubleMeters: self compte x2 (période)
// 5) shield: immunise (période)

export function autoColor(i) {
  const lane = Math.max(1, Number(i));
  const goldenAngle = 137.508;
  const hue = (lane * goldenAngle) % 360;
  const sat = 70 + ((lane * 11) % 20); // 70-89%
  const light = 45 + ((lane * 7) % 15); // 45-59%
  return `hsl(${hue.toFixed(1)}, ${sat}%, ${light}%)`;
}

const NOW = () => Date.now();
const PERIOD = 10_000; // 10s par défaut

export function isShieldActive(p) {
  return (p.shieldUntil || 0) > NOW();
}
export function isGlobalHalfActive(meta, p) {
  return (meta.globalHalfUntil || 0) > NOW();
}
export function isCadenceForced(p) {
  return (p.forcedCadenceUntil || 0) > NOW();
}
export function effectiveMultiplier(meta, p, globalHalf) {
  let mult = 1;
  if (globalHalf) mult *= 0.5;
  if ((p.metersMultiplierUntil || 0) > NOW()) mult *= 2; // self double
  return Math.max(0, mult);
}

export function metersPlus(p, amount = 50) {
  p.effectiveMeters = (p.effectiveMeters || 0) + amount;
}
export function selfDoubleMeters(p) {
  p.metersMultiplierUntil = NOW() + PERIOD;
}
export function shield(p) {
  p.shieldUntil = NOW() + PERIOD;
}
export function forceOthersCadence(players, exceptLane) {
  const until = NOW() + PERIOD;
  for (const lane in players) {
    if (Number(lane) === Number(exceptLane)) continue;
    const pl = players[lane];
    if (isShieldActive(pl)) continue;
    pl.forcedCadenceUntil = until;
  }
}
export function globalHalf(meta) {
  meta.globalHalfUntil = NOW() + PERIOD;
}

export function applyCadenceCap(pl) {
  if (isCadenceForced(pl)) pl.spm = Math.min(pl.spm ?? 0, 20);
}

// Roulette pondérée: les derniers ont + de chances d’avoir des bonus bénéfiques
export function rollAndApply(meta, players, order) {
  // Pour chaque joueur, on lance un tirage
  for (const { lane, rank } of order) {
    const p = players[lane];
    // pondération simple (plus le rank est grand => plus de bonus bons)
    const favor = rank / order.length; // 0..1
    const r = Math.random();

    // ordre de décision :
    // 30% metersPlus pour tous
    if (r < 0.3) {
      metersPlus(p, 40 + Math.round(40 * favor));
      continue;
    }
    // 20% selfDouble (plus fréquent pour derniers)
    if (r < 0.5 && Math.random() < 0.5 + 0.4 * favor) {
      selfDoubleMeters(p);
      continue;
    }
    // 15% shield (un peu plus rare)
    if (r < 0.65 && Math.random() < 0.4 + 0.4 * favor) {
      shield(p);
      continue;
    }
    // 10% globalHalf (malus global) -> déclenché seulement par les leaders
    if (r < 0.75 && rank <= 3 && !isGlobalHalfActive(meta)) {
      globalHalf(meta);
      continue;
    }
    // 25% forceOthersCadenceMax20 (plus fréquent pour leaders)
    if (r < 1.0 && rank <= Math.ceil(order.length / 2)) {
      forceOthersCadence(players, lane);
    }
  }

  // appliquer cap de cadence pour l’affichage
  for (const lane in players) applyCadenceCap(players[lane]);
}
