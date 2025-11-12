import * as THREE from 'three';

const FALLBACK_COLOR = '#66ccff';

const HSL_REGEX_COMMA = /^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i;
const HSL_REGEX_SPACE = /^hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)$/i;

function sanitizeHsl(style) {
  if (typeof style !== 'string') return style;
  const trimmed = style.trim();
  if (HSL_REGEX_COMMA.test(trimmed)) {
    return trimmed;
  }
  const spaceMatch = trimmed.match(HSL_REGEX_SPACE);
  if (spaceMatch) {
    const [, h, s, l] = spaceMatch;
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return trimmed;
}

export function normalizeColorHex(input, fallback = FALLBACK_COLOR) {
  const color = new THREE.Color();
  const fallbackColor = new THREE.Color(fallback);

  if (!input) {
    return `#${fallbackColor.getHexString()}`;
  }

  const sanitized = sanitizeHsl(input);

  try {
    color.setStyle(sanitized);
  } catch (err) {
    console.warn('[color] Impossible de parser la couleur, fallback utilisé', input, err);
    color.copy(fallbackColor);
  }

  return `#${color.getHexString()}`;
}

export function buildKartPalette(color) {
  const bodyHex = normalizeColorHex(color);
  const base = new THREE.Color(bodyHex);

  const accent = base.clone().lerp(new THREE.Color('#ffffff'), 0.25);
  const trim = base.clone().lerp(new THREE.Color('#000000'), 0.45);
  const stripe = base.clone().lerp(new THREE.Color('#ffffff'), 0.55);
  const glow = base.clone().lerp(new THREE.Color('#00ffff'), 0.2);

  return {
    bodyColor: `#${base.getHexString()}`,
    accentColor: `#${accent.getHexString()}`,
    trimColor: `#${trim.getHexString()}`,
    stripeColor: `#${stripe.getHexString()}`,
    glowColor: `#${glow.getHexString()}`
  };
}

