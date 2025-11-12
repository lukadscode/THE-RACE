# ErgKart (React + Three.js)

- Bridge ErgRace -> Relay WebSocket local (ws://localhost:8090)
- Front React (Vite) + @react-three/fiber
- Deux vues: 3D type kart + 2D top-down
- Admin: players, durée (7:30 par défaut), mode démo, export CSV
- Bonus/malus (tous les 200 m) :
  - +mètres (bonus de mètres instantané)
  - Forcer autres ≤ 20 spm (cadence)
  - Tout le monde ½ mètres
  - Mètres x2 (self)
  - Bouclier (anti-malus)

## Démarrer

1. `npm i`
2. `npm run dev`

- Relay écoute ErgRace `ws://localhost:443` (configurable).
- Front sur `http://localhost:5173`
  - Admin: `/admin`
  - Vue 3D: `/display/3d`
  - Vue 2D: `/display/2d`
