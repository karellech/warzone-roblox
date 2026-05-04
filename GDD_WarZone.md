# Game Design Document — WarZone

> Version 1.0 | Projet B2 | Roblox-ts + FastAPI/Symfony + Angular/Vue/React

---

## 1. Vision du jeu

WarZone est un jeu de guerre multijoueur en équipes sur Roblox. Deux équipes (Rouge vs Bleu) s'affrontent dans une arène fermée. L'objectif est de cumuler le maximum de kills en 5 minutes. Les statistiques de chaque partie sont persistées dans une base de données externe et consultables via un dashboard web d'administration.

---

## 2. Boucle de jeu

```
LOBBY (30 s) → COMBAT (5 min) → FIN DE PARTIE (15 s) → RETOUR LOBBY
```

| Phase | Durée | Détail |
|---|---|---|
| Lobby | 30 s | Attente de joueurs, compte à rebours affiché |
| Combat | 5 min | Arène active, kills comptabilisés localement |
| Fin | 15 s | Affichage du gagnant, envoi batch à l'API |
| Reset | — | Retour lobby, réinitialisation des scores |

---

## 3. Équipes

| Équipe | Couleur Roblox | Spawn |
|---|---|---|
| Rouge | BrickColor "Bright red" | Zone Sud de l'arène |
| Bleue | BrickColor "Bright blue" | Zone Nord de l'arène |

- Gestion via `TeamService` de Roblox (natif)
- Spawn automatique par `SpawnLocation.TeamColor`
- Nombre de joueurs : 2 à 10 par équipe (auto-équilibrage Roblox)

---

## 4. Arène

- Terrain plat (baseplate Roblox standard)
- Murs périmétriques pour limiter la zone de jeu
- 4–6 obstacles/abris simples (blocs ou assets Toolbox gratuits)
- Dimensions cibles : ~200 × 200 studs
- Pas de modélisation custom — assets gratuits Toolbox uniquement

---

## 5. Système d'armes

### Arme mêlée — ClassicSword
- Outil intégré Roblox (aucun code custom nécessaire)
- Dégâts : 30 HP par coup
- Portée : contact direct
- Placé dans le StarterPack de chaque joueur au spawn

### Arme distance — RaycastGun (custom simple)
- Outil Roblox avec un `RemoteEvent` côté client → serveur
- Détection via `Workspace:Raycast()` (API Roblox native)
- Dégâts : 25 HP par tir
- Pas d'animation custom — simple `Raycast` + particule d'impact
- Munitions illimitées, cooldown de 0.5 s entre tirs

---

## 6. Système de vie et de mort

- Vie initiale : 100 HP (Humanoid.Health)
- À la mort : respawn automatique au spawn de l'équipe après 3 s
- Kill crédité au dernier joueur ayant infligé des dégâts
- KillTracker serveur : `killsBuffer: KillEvent[]` (tableau local pendant la partie)

---

## 7. Condition de victoire

- **Priorité 1** : L'équipe qui atteint **25 kills** en premier gagne (fin anticipée)
- **Priorité 2** : À la fin du timer (5 min), l'équipe avec le plus de kills gagne
- **Égalité** : La partie est comptée nulle, aucune équipe n'est créditée

---

## 8. HUD (Head-Up Display)

| Élément | Position | Contenu |
|---|---|---|
| Timer | Centre haut | Compte à rebours MM:SS |
| Score Rouge | Haut gauche | Nombre de kills équipe rouge |
| Score Bleu | Haut droit | Nombre de kills équipe bleue |
| Barre de vie | Bas gauche | HP actuels / 100 |
| Kill feed | Bas droit | 3 derniers kills (texte, 5 s d'affichage) |

---

## 9. Écrans

### Lobby
- GUI simple : titre, compteur de joueurs connectés, compte à rebours
- Bouton "Prêt" (cosmétique uniquement — pas de blocage de partie)

### Fin de partie
- Affichage : équipe gagnante, scores Rouge vs Bleu, MVP (joueur avec le plus de kills)
- Durée : 15 s puis retour automatique au lobby

---

## 10. Contraintes techniques Roblox

- Code TypeScript compilé via **roblox-ts** (npm init roblox-ts)
- Synchronisation Studio ↔ code via **Rojo**
- Les appels HTTP (`HttpService`) **ne fonctionnent que côté serveur** (ServerScript)
- Limite Roblox : 500 requêtes HTTP/min/serveur → **batch obligatoire** des kills en fin de partie
- `HttpService` doit être activé dans Game Settings → Security

---

## 11. Structure du code roblox-ts

```
src/
├── server/
│   ├── GameManager.ts      # Boucle de jeu, phases, timer
│   ├── KillTracker.ts      # Buffer kills, RemoteEvents
│   └── ApiClient.ts        # Appels HttpService vers le backend
├── client/
│   ├── HUD.ts              # Mise à jour GUI (vie, scores, timer)
│   └── WeaponClient.ts     # Raycast gun côté client → RemoteEvent
└── shared/
    ├── types.ts             # KillEvent, MatchData, TeamColor, etc.
    └── constants.ts         # MATCH_DURATION, MAX_KILLS, API_URL
```
