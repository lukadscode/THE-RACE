# Guide du Mode Simulation ErgKart

## Comment lancer une simulation

### 1. Démarrer les serveurs

```bash
# Dans un terminal
npm run dev
```

Cela démarre :
- Le serveur relay WebSocket (port 8090)
- Le serveur web Vite (port 5173)

### 2. Accéder à l'interface

Ouvrez votre navigateur et allez sur : `http://localhost:5173`

### 3. Configurer la simulation

Sur la page d'accueil, vous pouvez configurer :

- **Mode** : Choisir "Mode Simulation" (rameurs virtuels)
- **Nombre de Karts** : De 1 à 16 participants
- **Durée** : Minutes et secondes de la course
- **Noms** : Personnaliser le nom de chaque kart

### 4. Lancer la course

1. Cliquez sur "Démarrer la Course"
2. Un compte à rebours commence :
   - "ATTENTION AU DÉPART" (2s)
   - "PRÊT" (1.5s)
   - "3" (1s)
   - "2" (1s)
   - "1" (1s)
   - "GO!" (1s)
3. La simulation démarre automatiquement

### 5. Pendant la course

- Les karts avancent automatiquement avec des données simulées (watts, cadence, distance)
- Tous les 200m, des bonus/malus sont attribués aléatoirement
- Le classement se met à jour en temps réel
- Le timer décompte le temps restant

### 6. Fin de course

- À la fin du temps imparti, l'écran de podium s'affiche
- Les 3 premiers sont affichés avec leurs statistiques
- Cliquez sur "Nouvelle Course" pour recommencer

## Données simulées

Le serveur génère automatiquement pour chaque kart :
- **Watts** : Entre 150 et 300W avec variations aléatoires
- **Cadence (SPM)** : Entre 22 et 30 coups/minute
- **Distance** : Calculée en fonction des watts (~3.5km en 7:30)

## Console de débogage

Ouvrez la console du navigateur (F12) pour voir les logs :
- `[front] connected to relay` : Connexion établie
- `[front] sending simulation config` : Configuration envoyée
- `[front] simulation config sent successfully` : Envoi réussi

Dans la console du serveur :
- `[relay] Starting custom simulation` : Simulation démarrée
- `[relay] Broadcasting race_definition` : Définition envoyée
- `[relay] Race started, beginning tick loop` : Boucle de mise à jour lancée

## Troubleshooting

### Les karts n'avancent pas
- Vérifiez que le serveur relay est bien démarré
- Regardez la console du navigateur pour les erreurs
- Rafraîchissez la page et relancez la simulation

### La page ne charge pas
- Vérifiez que Vite est démarré sur le port 5173
- Essayez `npm run web` dans le dossier du projet

### WebSocket ne se connecte pas
- Vérifiez que le relay est sur le port 8090
- Regardez les logs du serveur pour les erreurs
