# WarZone — Documentation Roblox
> Rédigé par Joseph — Nuit du 18 au 19 mai 2026

---

## Ce qui a été fait cette nuit

### Gameplay Roblox (roblox-ts + Rojo)
- ✅ Configuration complète de roblox-ts + Rojo
- ✅ 2 équipes Rouge / Bleu avec SpawnLocations séparés
- ✅ Armes intégrées (AutoBlaster + Blaster depuis le Toolbox)
- ✅ Boucle de jeu : **Lobby (30s) → Combat (5min) → Fin → retour Lobby**
- ✅ Kills comptés et stockés localement pendant le match
- ✅ HUD affiché sur le client : score des équipes + timer en temps réel
- ✅ Intégration API complète :
  - `POST /api/matches/` → crée le match au début
  - `POST /api/matches/{id}/kills` → envoie le batch de kills en fin de partie
  - `POST /api/matches/{id}/end` → termine le match avec le gagnant
- ✅ Données vérifiées dans PostgreSQL via Swagger

---

## Architecture du dossier `roblox/`

```
roblox/
├── src/
│   ├── server/
│   │   └── GameManager.server.ts   ← boucle de jeu + appels API
│   ├── client/
│   │   └── HUD.client.ts           ← affichage score + timer
│   └── shared/                     ← (types partagés si besoin)
├── out/                            ← fichiers .luau compilés (généré auto)
├── node_modules/                   ← dépendances npm (ne pas toucher)
├── package.json
├── tsconfig.json
└── default.project.json            ← config Rojo
```

---

## Prérequis pour travailler sur la partie Roblox

### 1. Node.js
Télécharge et installe Node.js (version 18+) :
👉 https://nodejs.org

### 2. Roblox Studio
Télécharge et installe Roblox Studio :
👉 https://www.roblox.com/create

### 3. Plugin Rojo dans Studio
- Va sur https://rojo.space
- Clique **Download Plugin**
- Installe-le dans Roblox Studio

---

## Installation du projet

```bash
# 1. Clone le repo
git clone https://github.com/votre-repo/warzone-roblox.git
cd warzone-roblox/roblox

# 2. Installe les dépendances
npm install

# 3. Lance la compilation en mode watch (terminal 1)
npm run watch

# 4. Lance le serveur Rojo (terminal 2)
npx rojo serve
```

---

## Ouvrir le jeu dans Studio

1. Ouvre Roblox Studio
2. **Fichier → Ouvrir depuis un fichier** → sélectionne `zone de guerre.rbxl`
3. Dans Studio, clique sur le plugin **Rojo** → **Connect**
4. Tu dois voir "Connected" — les scripts se synchronisent automatiquement

> ⚠️ **Important** : garde `npm run watch` ET `npx rojo serve` qui tournent en permanence pendant que tu travailles.

---

## Tester le jeu

1. Clique **Play** dans Studio
2. Ouvre **Voir → Sortie** pour voir les logs du serveur
3. Tu dois voir :
```
=== LOBBY : partie dans 30s ===
=== COMBAT COMMENCE ===
Match créé : <uuid>
=== FIN : Rouge gagne | Rouge 3 - Bleu 1 ===
Match terminé : Rouge
```

### Tester avec 2 joueurs
- Dans l'onglet **Test** → change le nombre de joueurs à **2** → **Start**
- Ou publie le jeu sur Roblox et rejoins depuis ton téléphone

---

## Intégration API

### Variables à configurer dans `GameManager.server.ts`

```typescript
const API_URL = "https://TON-URL-NGROK.ngrok-free.app"; // ou URL de prod
const API_KEY = "warzone-secret-key";
```

### Utiliser ngrok pour le développement local

```bash
# Installe ngrok
winget install Ngrok.Ngrok

# Configure ton authtoken (crée un compte sur dashboard.ngrok.com)
ngrok config add-authtoken TON_TOKEN

# Lance le tunnel
ngrok http 8000
# → copie l'URL https://xxx.ngrok-free.app dans API_URL
```

### Activer HttpService dans Studio
**Fichier → Paramètres du jeu → Sécurité → Autoriser les requêtes HTTP** ✅

---

## Ce qu'il reste à faire

| Tâche | Responsable | Priorité |
|-------|-------------|----------|
| Dashboard web (leaderboard + stats) | À assigner | 🔴 Critique |
| Docker + docker-compose | À assigner | 🔴 Critique |
| CI/CD GitHub Actions | À assigner | 🟡 Important |
| Publication Roblox (File → Publish) | Joseph | 🟡 Important |
| Tests manuels structurés | Tous | 🟡 Important |

---

## Structure du projet global

```
warzone-roblox/
├── backend/          ← FastAPI + SQLAlchemy + PostgreSQL
│   └── app/
│       ├── routers/  ← players.py, matches.py
│       └── models.py, schemas.py, main.py
├── dashboard/        ← React/Vue/Angular + TypeScript
├── roblox/           ← roblox-ts (ce dossier)
├── docker-compose.yml
└── .env
```

---

## Endpoints API disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/matches/` | Créer un match |
| GET | `/api/matches/` | Liste des matchs |
| POST | `/api/matches/{id}/kills` | Envoyer les kills (batch) |
| POST | `/api/matches/{id}/end` | Terminer un match |
| GET | `/api/leaderboard/` | Classement global |
| GET | `/api/players/{id}/stats` | Stats d'un joueur |

Doc Swagger complète : http://localhost:8000/docs

---

## Commandes utiles

```bash
# Backend
docker-compose up -d          # Lance le backend + PostgreSQL

# Roblox
npm run watch                 # Compile TypeScript → Luau en continu
npx rojo serve                # Synchronise avec Studio

# Vérifier que l'API tourne
curl http://localhost:8000/docs
```

---

## Problèmes connus et solutions

| Problème | Solution |
|----------|----------|
| `npx rojo serve` → "no project file found" | Vérifier que `default.project.json` existe dans `roblox/` |
| Erreurs TypeScript dans VS Code | Ctrl+Shift+P → "TypeScript: Select TypeScript Version" → Workspace Version |
| Script ne se lance pas dans Studio | Vérifier que le script est dans `ServerScriptService` directement (pas dans un sous-dossier) |
| HttpService ne fonctionne pas | Activer "Autoriser les requêtes HTTP" dans Paramètres du jeu |
| Réponse ngrok vide | Ajouter le header `"ngrok-skip-browser-warning": "true"` dans les requêtes |

---

*Bonne chance pour la soutenance ! 💪*
