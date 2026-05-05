gi# 📋 Documentation Projet WarZone Roblox

> **Version 1.0** | Projet B2 Développement | Date: 5 mai 2026

## 🎯 Vue d'ensemble

WarZone est un jeu de guerre multijoueur en équipes développé sur Roblox avec une architecture complète backend/frontend. Le projet comprend :

- **🎮 Jeu Roblox** : Combat en équipes (Rouge vs Bleu) avec système de kills
- **🚀 API Backend** : FastAPI avec PostgreSQL pour la persistance des données
- **📊 Dashboard Admin** : Interface web React/TypeScript pour consulter les statistiques
- **🐳 Docker** : Conteneurisation complète pour un déploiement multi-plateforme

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Jeu Roblox    │    │    API FastAPI  │    │  Dashboard Web  │
│                 │    │                 │    │                 │
│ • TeamService   │◄──►│ • PostgreSQL    │◄──►│ • React/TypeScript│
│ • Combat System │    │ • Pydantic      │    │ • Vite          │
│ • Kill Tracking │    │ • SQLAlchemy    │    │ • API Client    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Base de données │
                       │   PostgreSQL      │
                       │ • Players         │
                       │ • Matches         │
                       │ • Kills           │
                       │ • Grades          │
                       └─────────────────┘
```

---

## 🎮 Mécaniques de Jeu

### Boucle de Partie
```
LOBBY (30s) → COMBAT (5min) → FIN (15s) → RESET
```

### Équipes
- **🔴 Équipe Rouge** : Spawn zone Sud
- **🔵 Équipe Bleue** : Spawn zone Nord
- **👥 Nombre de joueurs** : 2-10 par équipe (auto-équilibrage Roblox)

### Système de Grades
| Grade | Condition Kills | Condition K/D |
|-------|----------------|---------------|
| Recrue | 0 | - |
| Soldat | ≥10 | ≥0.5 |
| Sergent | ≥50 | ≥1.0 |
| Lieutenant | ≥200 | ≥1.5 |
| Général | ≥500 | ≥2.0 |

---

## 🚀 API Backend (FastAPI)

### Technologies
- **Framework** : FastAPI 0.115.0
- **Base de données** : PostgreSQL 15
- **ORM** : SQLAlchemy 2.0.35
- **Validation** : Pydantic 2.9.2
- **Serveur** : Uvicorn 0.30.6

### Endpoints Principaux

#### 👤 Gestion des Joueurs
```
POST /api/players/           # Créer/Mettre à jour joueur
GET  /api/players/{id}       # Profil joueur
```

#### 🏟️ Gestion des Parties
```
POST /api/matches/           # Créer nouvelle partie
POST /api/matches/{id}/kills # Envoyer batch de kills
GET  /api/matches/{id}       # Détails partie
```

#### 🏆 Leaderboard
```
GET /api/leaderboard/        # Classement général
GET /api/leaderboard/top     # Top joueurs
```

### Modèles de Données

#### Player
```python
{
  "id": "UUID",
  "roblox_user_id": "int",
  "username": "string",
  "total_kills": "int",
  "total_deaths": "int",
  "total_matches": "int",
  "grade": "string",
  "created_at": "datetime"
}
```

#### Match
```python
{
  "id": "UUID",
  "started_at": "datetime",
  "ended_at": "datetime|null",
  "duration_seconds": "int|null",
  "winning_team": "string|null",
  "status": "ongoing|finished"
}
```

#### Kill
```python
{
  "id": "UUID",
  "match_id": "UUID",
  "killer_id": "UUID",
  "victim_id": "UUID",
  "weapon": "string",
  "killed_at": "datetime"
}
```

---

## 📊 Dashboard Administration

### Technologies
- **Framework** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : CSS Modules + Tailwind (optionnel)
- **API Client** : Axios/Fetch

### Pages Implémentées
- **🏠 Accueil** : Statistiques générales
- **🏆 Leaderboard** : Classement des joueurs
- **📈 Match History** : Historique des parties

### Structure des Composants
```
src/
├── components/     # Composants réutilisables
├── pages/         # Pages principales
│   ├── Leaderboard.tsx
│   ├── MatchHistory.tsx
│   └── ...
├── services/      # API client
└── types/         # Types TypeScript
```

---

## 🐳 Déploiement Docker

### Services
```yaml
services:
  db:           # PostgreSQL 15
  backend:      # API FastAPI
  dashboard:    # Frontend React (à venir)
```

### Commandes Essentielles
```bash
# Lancer tout
docker-compose up -d

# Suivre les logs
docker-compose logs -f

# Arrêter tout
docker-compose down

# Reconstruire
docker-compose up --build -d
```

### Variables d'Environnement
```env
# Base de données
DB_CONTAINER=warzone_db
DB_NAME=warzone
DB_USER=warzone_user
DB_PASSWORD=warzone_pass

# Backend
DB_BACK=warzone_backend
```

---

## 🔧 Installation & Développement

### Prérequis
- **Docker & Docker Compose**
- **Node.js 18+** (pour le dashboard)
- **Python 3.13+** (optionnel, développement local)

### Démarrage Rapide
```bash
# Cloner le repo
git clone <repository-url>
cd warzone-roblox

# Lancer avec Docker
docker-compose up -d

# Accès
# API: http://localhost:8000
# Docs API: http://localhost:8000/docs
# Dashboard: http://localhost:3000 (à venir)
```

### Développement Local
```bash
# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Dashboard
cd dashboard
npm install
npm run dev
```

---

## 📈 État du Projet

### ✅ Terminé
- [x] **Architecture backend** : FastAPI + PostgreSQL + SQLAlchemy
- [x] **Modèles de données** : Players, Matches, Kills, Grades
- [x] **API REST complète** : CRUD pour toutes les entités
- [x] **Système de grades** : Calcul automatique basé sur stats
- [x] **Dockerisation** : Conteneurs pour backend + DB
- [x] **Dashboard React** : Structure de base et composants
- [x] **Documentation API** : Swagger/OpenAPI automatique

### 🚧 En Cours
- [ ] **Dashboard complet** : Toutes les pages fonctionnelles
- [ ] **Authentification** : Système d'admin sécurisé
- [ ] **Tests unitaires** : Backend + Frontend
- [ ] **CI/CD** : Pipeline de déploiement automatisé

### 🔮 À Venir
- [ ] **Jeu Roblox** : Intégration complète avec l'API
- [ ] **Temps réel** : WebSockets pour mises à jour live
- [ ] **Analytics avancés** : Graphiques et métriques détaillées
- [ ] **API Rate limiting** : Protection contre les abus
- [ ] **Monitoring** : Logs et métriques de performance

---

## 🤝 Contribution

### Branches
- `main` : Code de production
- `develop` : Développement actif
- `feature/*` : Nouvelles fonctionnalités

### Commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: mise à jour documentation
style: formatage du code
refactor: réorganisation du code
test: ajout/modification de tests
```

### Code Style
- **Backend** : Black + isort + flake8
- **Frontend** : ESLint + Prettier
- **Commits** : Conventional Commits

---

## 📞 Support & Contact

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les issues GitHub
3. Créer une nouvelle issue si nécessaire

---

*Documentation générée automatiquement - Dernière mise à jour : 5 mai 2026*