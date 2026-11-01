# Dev-Web-2024-2025 — Casino en ligne

Projet Dev Web : une plateforme de casino en ligne composée d'un **frontend Angular 19 (SSR)**, d'un **backend Node.js/Express** avec **Socket.IO** (chat et roulette temps réel), d'une base **MySQL/MariaDB** et de **Firebase** (données de jeu).

## Architecture du projet

### Vue d'ensemble

```
                    ┌──────────────────────────────────────────────┐
                    │                NAVIGATEUR                    │
                    └──────────────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────▼───────────────────────┐
                    │        FRONTEND — Angular 19 + SSR            │
                    │           http://localhost:4200               │
                    │                                              │
                    │  Pages : home, login, register, balance,      │
                    │  roulette-net, machine-a-sous, stats,        │
                    │  edit-compte, chat-multy, navigation-bar     │
                    │                                              │
                    │  Services : login, register, user, socket,   │
                    │  roulette-net, machine-a-sous, stats,        │
                    │  avatar-upload, new-game, firebase-listener  │
                    │                                              │
                    │  Guards : is-logged-in                       │
                    │  Interceptor : auth-token (cookie JWT)        │
                    └───────┬─────────────────────┬────────────────┘
                            │ HTTP (proxy         │ WebSocket
                            │ /api, /sessions)    │ (socket.io-client)
                            ▼                     ▼
┌───────────────────────────────────────────────────────────────────────┐
│                 BACKEND — Express + Socket.IO                          │
│                      http://localhost:3000                            │
│                                                                       │
│  server.js ── montage des routes :                                    │
│   ├─ /sessions ........ connexion / déconnexion (JWT dans cookie)     │
│   ├─ /register ......... création de compte (bcrypt)                  │
│   ├─ /users, /get_id ... données utilisateurs                         │
│   ├─ /edit-compte ...... modification du profil                       │
│   ├─ /stats ............ statistiques de jeu                         │
│   ├─ /bets, /new-game .. paris et sessions de jeu                     │
│   ├─ /update ........... mise à jour du solde (routes/update_solde)   │
│   ├─ /api/roulette ..... logique roulette (roulette-net)             │
│   ├─ /api/roulette-odds  tableau des mises                           │
│   └─ /avatar ........... upload d'avatar (multer + sharp + clamscan)  │
│                          et fichiers avatar servis en statique        │
│                                                                       │
│  Middlewares : auth.js (verifyToken JWT), socketAuth.js               │
│  Services    : socketService.js (chat multicanal : join-room,         │
│                message, feedback, room-stats, clients-total)          │
└──────┬────────────────────────────────────┬─────────────────────────┘
       │ mysql2 (pool)                       │ SDK Firebase
       ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────┐
│   MySQL / MariaDB    │          │       Firebase       │
│    localhost:3307    │          │  (données machine à  │
│    base : dev3       │          │   sous / temps réel) │
└──────────────────────┘          └──────────────────────┘
```

### Flux d'une partie (exemple : roulette)

```
Joueur ──login──▶ /sessions ──▶ JWT stocké dans le cookie auth_token
Joueur ──mise──▶ /api/roulette ──▶ backend calcule le résultat
                     │                    │
                     │                    ├──▶ UPDATE solde (MySQL)
                     │                    └──▶ UPDATE stats (MySQL)
                     ▼
Frontend ◀── résultat + solde mis à jour ──┘
```

### Schéma de la base de données (db/queries/casino.sql)

| Table | Rôle |
|-------|------|
| `User` | comptes (username, email, password hashé bcrypt, solde, avatar) |
| `Games_session` | sessions de jeu (nom, mise min/max) |
| `Banking_transaction` | dépôts / retraits |
| `Bets` | paris placés |
| `Stats` | statistiques par joueur et par jeu |

## Structure du dépôt

```
Dev-Web-2024/
├── backend/          API Express + Socket.IO (port 3000)
│   ├── config/       dbConfig.js (MySQL), socketConfig.js
│   ├── middlewares/  auth JWT
│   ├── routes/       points d'entrée de l'API
│   ├── services/     socketService.js
│   ├── tests/        tests Jest
│   └── server.js     point d'entrée du backend
├── frontend/         Application Angular 19 (port 4200)
│   ├── src/app/pages/        pages du site
│   ├── src/app/services/     services Angular
│   ├── src/app/guards/       route guards
│   ├── src/app/interceptor/  injection du token
│   └── proxy.conf.json       proxy vers le backend
├── db/
│   ├── queries/      casino.sql (structure), data-casino.sql (données)
│   ├── data/         fichiers de données MariaDB
│   └── *.dio         schémas de la base (draw.io)
├── maquette/         maquettes du projet
└── Projet-Elec-2025/ (projet électronique associé)
```

## Lancer le projet

### Prérequis

- **Node.js 18+** (recommandé : 20 ou plus — `sharp` 0.33 fonctionne dès Node 18)
- **Docker** (Docker Engine + Compose) pour la base de données
- npm

### 1. Base de données (Docker)

Le backend attend une base MySQL sur `localhost:3307`, utilisateur `root`,
mot de passe `c@sino`, base `dev3` (voir `backend/config/dbConfig.js`).

Un `docker-compose.yml` à la racine du projet fournit un container MariaDB 11
calé sur cette config :

```sh
docker compose up -d
```

- Le container expose MariaDB sur le port **3307**.
- Au **premier** démarrage, la base `dev3` est créée et les scripts
  `db/queries/casino.sql` (structure) puis `data-casino.sql` (données de
  démonstration) sont importés automatiquement.
- Les données sont persistées dans le volume Docker `casino-db-data` :
  `docker compose down` les conserve, `docker compose down -v` réinitialise
  tout.

Vérifier que la base répond :

```sh
mysql -h 127.0.0.1 -P 3307 -u root -pc@sino -e "USE dev3; SHOW TABLES;"
```

> Alternative sans Docker : importer `db/queries/casino.sql` puis
> `data-casino.sql` dans un MySQL/MariaDB local écoutant sur le port 3307
> (les scripts `commandes.sh` / `.bat` utilisent le nom de base `casino` :
> l'adapter en `dev3` et le mot de passe en `c@sino`).

### 2. Backend (API + WebSocket, port 3000)

```sh
cd backend
npm install
npm start          # node server.js
# ou pour le développement :
npm run dev        # nodemon server.js
```

### 3. Frontend (Angular, port 4200)

```sh
cd frontend
npm install
npm start          # ng serve avec proxy vers http://localhost:3000
```

L'application est ensuite accessible sur **http://localhost:4200**.
Le proxy (`frontend/proxy.conf.json`) redirige `/api` et `/sessions` vers le
backend. Les services utilisent aussi des URLs directes
(`http://localhost:3000`) pour Socket.IO.

> Note : le frontend nécessite une configuration Firebase valide dans
> `frontend/src/environments/environments.ts` (utilisée par la machine à
> sous et le listener temps réel).

### Build de production

```sh
cd frontend
npm run build          # build SSR dans dist/frontend
npm run serve:ssr:frontend   # sert le build SSR
```

## Tests

### Backend (Jest)

```sh
cd backend
npm test
```

Les tests sont dans `backend/tests/` (extension `.test.js`).
État actuel : 198/198 tests passent, 9 suites sur 9.

### Frontend (Jest)

```sh
cd frontend
npm test
```

Les tests sont des fichiers `.spec.ts` / `.test.ts` dans `src/`.

## Problèmes connus / à corriger

- **Secret JWT en dur** (`"ton_secret"` dans `middlewares/auth.js`,
  `routes/sessions.js`, `middlewares/socketAuth.js`) : à déplacer dans une
  variable d'environnement (`.env` + `dotenv`).
- **Identifiants MySQL en dur** dans `backend/config/dbConfig.js`.
- **Blacklist de tokens en mémoire** (perdue au redémarrage) : à migrer en base.
- **Upload d'avatar non authentifié** : `userId` vient de `req.body` sans
  vérification de token.
- **Infrastructure de tests frontend fragile** : les mocks dans
  `frontend/__mocks__/` simulent Angular à la main ; la migration vers
  `jest-preset-angular` (déjà installé) est recommandée.
- **Incohérence de nom de base** dans `db/queries/commandes.sh` : le script crée
  `casino` avec le mot de passe `casino`, alors que le backend attend `dev3` /
  `c@sino`. Sans incidence avec Docker (le compose crée `dev3` directement).

---

## Comment copier ce Wiki (template d'origine)

Pour récupérer le template et l'utiliser dans le cadre de votre projet, vous allez devoir faire un "fork" de ce repo. Cependant, le wiki n'est pas copié automatiquement. Suivez donc la procédure ci-dessous :

1. Créez un fork de ce repository. Ce sera votre repo de projet, avec une URL de type `https://github.com/<username>/<repo-name>`.
2. Créez un wiki dans ce nouveau repo, avec une Home page vide par exemple.
3. Clonez le repo git du wiki original sur votre machine : `git clone https://github.com/EphecLLN/Dev-Web-2024.wiki.git`
4. Pour "pousser" le wiki présent sur votre machine vers votre repository de projet, vous allez changer le pointeur "remote" de votre copie locale : `git remote add fork https://github.com/<username>/<repo-name>.wiki.git`
5. Forcez à présent la copie du wiki sur votre machine vers votre repository de projet. Cela écrasera le wiki vide que vous aviez créé plus tôt avec le template : `git push -f fork master`
