# API CRUD Étudiants — Full Stack

Projet full stack réalisé avec :

* **Frontend :** React 18 + Vite
* **Backend :** Node.js + Express 4 + TypeScript
* **Base de données :** PostgreSQL 15
* **Authentification :** JWT
* **Protection HTTP :** Helmet + CORS + Rate Limiting
* **Conteneurisation de la base de données :** Docker Compose

---

# 1. Présentation du projet

Cette application est une démonstration full stack permettant :

1. de se connecter avec un nom d'utilisateur et un mot de passe ;
2. de générer un token JWT après authentification ;
3. de gérer des étudiants via une API REST ;
4. de stocker les étudiants dans PostgreSQL ;
5. de gérer un système de blocage temporaire après plusieurs tentatives de connexion incorrectes.

Le projet est séparé en deux parties :

```text
api-crud-etudiants-complete/
│
├── Backend/
│   ├── src/
│   ├── db/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── docker-compose.yml
│
├── Frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

Le navigateur communique avec le frontend React sur :

```text
http://localhost:5173
```

Le frontend communique avec le backend Express sur :

```text
http://localhost:3000
```

Le backend communique ensuite avec PostgreSQL.

Architecture globale :

```text
Navigateur
    │
    ▼
Frontend React / Vite
http://localhost:5173
    │
    │ /api/*
    ▼
Vite Proxy
    │
    ▼
Backend Express
http://localhost:3000
    │
    ├── Authentification
    │
    ├── JWT
    │
    ├── CRUD Étudiants
    │
    ▼
PostgreSQL
localhost:5432
```

---

# 2. Prérequis

Pour exécuter le projet, installer :

* Node.js
* npm
* Docker Desktop ou Docker Engine + Docker Compose
* Git

Node.js 20 LTS ou une version plus récente est recommandé.

Vérifier les installations :

```bash
node --version
npm --version
docker --version
docker compose version
git --version
```

---

# 3. Installation du projet

Cloner le projet :

```bash
git clone <URL_DU_DEPOT>
cd api-crud-etudiants-complete
```

Le projet contient deux applications Node indépendantes :

```text
Backend/
Frontend/
```

Il faut donc installer les dépendances dans les deux dossiers.

---

# 4. Installation du Backend

Se placer dans le backend :

```bash
cd Backend
```

Installer les dépendances :

```bash
npm install
```

Les dépendances principales sont :

* `express` : serveur HTTP et création de l'API REST
* `pg` : connexion à PostgreSQL
* `dotenv` : lecture du fichier `.env`
* `jsonwebtoken` : création et validation des JWT
* `cors` : gestion du CORS
* `helmet` : ajout de protections HTTP
* `express-rate-limit` : limitation du nombre de requêtes
* `typescript` : compilation TypeScript
* `ts-node` : exécution de TypeScript
* `nodemon` : redémarrage automatique pendant le développement

---

# 5. Configuration du fichier `.env`

Le fichier :

```text
Backend/.env
```

contient des informations sensibles.

Il **ne doit pas être envoyé sur GitHub/GitLab** et ne doit pas être inclus dans le dépôt.

Le professeur doit créer lui-même son fichier :

```text
Backend/.env
```

à partir du modèle suivant :

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=etudiants_db

JWT_SECRET=changer_cette_valeur

LOGIN_USERNAME=sammyfoxxy@gmail.com
LOGIN_PASSWORD=mot_de_passe_a_definir

LOCK_ATTEMPTS=3
LOCK_DURATION_MS=60000
```

Les valeurs doivent être adaptées à la machine du professeur.

## Description des variables

### `PORT`

Port utilisé par Express.

Exemple :

```env
PORT=3000
```

Le backend sera alors disponible sur :

```text
http://localhost:3000
```

---

### `DB_HOST`

Adresse du serveur PostgreSQL.

Avec Docker Compose lancé sur la machine locale :

```env
DB_HOST=localhost
```

---

### `DB_PORT`

Port PostgreSQL :

```env
DB_PORT=5432
```

---

### `DB_USER`

Utilisateur PostgreSQL.

La configuration Docker fournie utilise :

```env
DB_USER=postgres
```

---

### `DB_PASSWORD`

Mot de passe PostgreSQL.

Dans le `docker-compose.yml` fourni :

```text
postgres
```

est utilisé comme mot de passe.

Si le professeur utilise une autre base, cette valeur doit être remplacée par le mot de passe de sa propre base.

---

### `DB_NAME`

Nom de la base de données :

```env
DB_NAME=etudiants_db
```

Ce nom correspond à la configuration Docker du projet.

---

### `JWT_SECRET`

Clé secrète utilisée pour signer les tokens JWT.

Exemple :

```env
JWT_SECRET=une_cle_secrete_complexe
```

Cette valeur peut être différente de celle utilisée par les développeurs.

---

### `LOGIN_USERNAME`

Nom d'utilisateur utilisé pour la connexion.

Important : le code vérifie également que cet identifiant correspond à l'email d'un étudiant existant dans la base.

La valeur doit donc correspondre à une ligne de la table `etudiants`.

Par exemple :

```env
LOGIN_USERNAME=sammyfoxxy@gmail.com
```

---

### `LOGIN_PASSWORD`

Mot de passe de connexion au frontend.

Exemple :

```env
LOGIN_PASSWORD=mon_mot_de_passe
```

Ce mot de passe est comparé à la variable d'environnement.

Le mot de passe n'est pas stocké dans la table `etudiants`.

---

### `LOCK_ATTEMPTS`

Nombre maximum d'échecs avant blocage.

Exemple :

```env
LOCK_ATTEMPTS=3
```

Avec cette valeur, le compte est bloqué après 3 échecs consécutifs.

---

### `LOCK_DURATION_MS`

Durée du blocage en millisecondes.

Par exemple :

```env
LOCK_DURATION_MS=60000
```

correspond à :

```text
60000 ms = 60 secondes
```

---

# 6. Base de données PostgreSQL

## Méthode recommandée : Docker

Le projet contient :

```text
Backend/docker-compose.yml
```

Cette configuration démarre PostgreSQL 15.

Depuis le dossier `Backend` :

```bash
docker compose up -d
```

Vérifier que le conteneur fonctionne :

```bash
docker compose ps
```

Le service PostgreSQL est exposé sur :

```text
localhost:5432
```

Configuration utilisée par Docker :

```text
Utilisateur : postgres
Mot de passe : postgres
Base        : etudiants_db
Port        : 5432
```

---

# 7. Initialisation de la base

Le fichier :

```text
Backend/db/init.sql
```

est automatiquement exécuté par PostgreSQL lors de la première création du volume Docker.

Il crée la table :

```sql
CREATE TABLE etudiants (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);
```

Puis il insère un étudiant de test :

```text
Nom    : Fox
Prénom : Sammy
Age    : 19
Email  : sammyfoxxy@gmail.com
```

La table finale est :

```text
etudiants
│
├── id
├── nom
├── prenom
├── age
└── email
```

---

# 8. Important : fonctionnement du script `init.sql`

Le fichier `init.sql` est exécuté par PostgreSQL lors de l'initialisation du volume.

Cela signifie que si le volume Docker existe déjà, modifier `init.sql` ne recrée pas automatiquement les données.

Pour repartir de zéro :

```bash
docker compose down -v
docker compose up -d
```

Le paramètre `-v` supprime également le volume PostgreSQL.

Attention : cela supprime les données présentes dans la base Docker.

---

# 9. Lancement du Backend

Depuis :

```text
Backend/
```

Compiler le projet TypeScript :

```bash
npm run build
```

Cette commande utilise :

```text
Backend/tsconfig.json
```

et génère :

```text
Backend/dist/
```

Le serveur compilé peut ensuite être lancé avec :

```bash
npm start
```

Ce qui exécute :

```bash
node dist/index.js
```

Le backend est alors disponible sur :

```text
http://localhost:3000
```

Tester simplement :

```text
GET http://localhost:3000/
```

Réponse :

```json
{
  "success": true,
  "message": "Hello world"
}
```

---

# 10. Développement du Backend

Le script actuel du `package.json` est :

```json
"dev": "nodemon"
```

Cependant, la configuration actuelle ne fournit pas explicitement à Nodemon le fichier `src/index.ts`.

Pour démarrer directement la version TypeScript en développement, utiliser :

```bash
npx nodemon --exec ts-node src/index.ts
```

Cela permet à Nodemon de relancer automatiquement le serveur lorsque les fichiers TypeScript sont modifiés.

---

# 11. Structure complète du Backend

```text
Backend/
│
├── db/
│   └── init.sql
│
├── src/
│   ├── config/
│   │   └── database.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   └── etudiant.controller.ts
│   │
│   ├── middlewares/
│   │   ├── error.middleware.ts
│   │   ├── jwt.middleware.ts
│   │   └── security.middleware.ts
│   │
│   ├── models/
│   │   └── etudiant.model.ts
│   │
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   └── etudiant.routes.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── etudiant.service.ts
│   │   └── lockout.service.ts
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   ├── utils/
│   │   └── app-error.ts
│   │
│   ├── app.ts
│   └── index.ts
│
├── .env
├── docker-compose.yml
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

# 12. `src/index.ts`

Ce fichier est le point d'entrée de l'application backend.

Il commence par charger les variables d'environnement :

```ts
dotenv.config();
```

Cela permet au code d'accéder aux valeurs de :

```text
Backend/.env
```

Ensuite :

```ts
import app from './app';
```

importe l'application Express.

Le port est récupéré avec :

```ts
const PORT = process.env.PORT || 3000;
```

Puis le serveur est lancé :

```ts
app.listen(PORT)
```

Enfin, un handler `SIGINT` ferme proprement le serveur lorsqu'on arrête le processus.

---

# 13. `src/app.ts`

Ce fichier configure Express.

Création de l'application :

```ts
const app = express();
```

Lecture automatique des corps JSON :

```ts
app.use(json());
```

Protection HTTP avec Helmet :

```ts
app.use(helmet());
```

Configuration du CORS :

```ts
app.use(securityMiddleware);
```

Rate limiting :

```ts
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
```

Cela signifie qu'une IP ne peut normalement pas effectuer plus de 100 requêtes pendant une fenêtre de 15 minutes.

Routes :

```text
/api/auth
/api/etudiants
```

Puis le middleware global d'erreur est enregistré à la fin :

```ts
app.use(errorHandler);
```

---

# 14. `src/config/database.ts`

Ce fichier crée la connexion à PostgreSQL.

Le code vérifie d'abord la présence de :

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Si une variable manque, une erreur est générée.

La connexion est ensuite créée avec :

```ts
new Pool({
    host,
    port,
    user,
    password,
    database
});
```

`Pool` permet de gérer plusieurs connexions PostgreSQL de manière réutilisable.

Le pool est exporté :

```ts
export const pool = new Pool(...)
```

Les services utilisent ensuite ce pool pour exécuter des requêtes SQL.

---

# 15. `src/models/etudiant.model.ts`

Ce fichier définit le type TypeScript représentant un étudiant :

```ts
export type Etudiant = {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  age: number;
};
```

Description :

| Variable | Type     | Description            |
| -------- | -------- | ---------------------- |
| `id`     | `number` | Identifiant PostgreSQL |
| `nom`    | `string` | Nom de famille         |
| `prenom` | `string` | Prénom                 |
| `email`  | `string` | Adresse email          |
| `age`    | `number` | Age                    |

`id` est optionnel car il est généré automatiquement par PostgreSQL.

---

# 16. `src/services/etudiant.service.ts`

Ce fichier contient la logique métier liée aux étudiants.

Il utilise directement le pool PostgreSQL.

## `getAll()`

```ts
getAll()
```

Exécute :

```sql
SELECT * FROM etudiants ORDER BY id
```

Retourne tous les étudiants triés par identifiant.

---

## `getById(id)`

```ts
getById(id)
```

Exécute :

```sql
SELECT * FROM etudiants WHERE id=$1
```

Le `$1` est remplacé par l'identifiant transmis.

L'utilisation de paramètres PostgreSQL permet d'éviter de construire directement du SQL à partir des entrées utilisateur.

Retour :

```text
Etudiant
```

ou :

```text
null
```

si l'étudiant n'existe pas.

---

## `createEtudiant(e)`

Cette méthode insère un nouvel étudiant.

SQL :

```sql
INSERT INTO etudiants
(nom, prenom, email, age)
VALUES ($1,$2,$3,$4)
RETURNING *
```

La méthode retourne directement l'étudiant créé.

---

## `updateEtudiant(id, e)`

Cette méthode modifie un étudiant existant.

Le fonctionnement est :

1. rechercher l'étudiant ;
2. retourner `null` s'il n'existe pas ;
3. conserver les anciennes valeurs des champs non fournis ;
4. effectuer l'`UPDATE` ;
5. retourner l'étudiant mis à jour.

Les champs concernés sont :

```text
nom
prenom
email
age
```

---

## `deleteEtudiant(id)`

Supprime l'étudiant :

```sql
DELETE FROM etudiants WHERE id=$1
```

La méthode retourne :

```text
true
```

si une ligne a été supprimée.

Sinon :

```text
false
```

---

# 17. `src/controllers/etudiant.controller.ts`

Les controllers reçoivent les requêtes HTTP et appellent les services.

---

## `parseId()`

```ts
const parseId = (v: unknown): number
```

Cette fonction convertit le paramètre d'URL en nombre.

Par exemple :

```text
/api/etudiants/5
```

donne :

```text
id = 5
```

Si la valeur n'est pas numérique, une erreur est générée.

---

## `getAll()`

Appelle :

```ts
EtudiantService.getAll()
```

puis retourne :

```json
{
  "success": true,
  "data": [...]
}
```

---

## `getById()`

Récupère :

```text
req.params.id
```

puis appelle :

```ts
EtudiantService.getById(id)
```

Si l'étudiant n'existe pas :

```http
404 Not Found
```

avec :

```json
{
  "success": false,
  "error": {
    "message": "Étudiant introuvable"
  }
}
```

---

## `create()`

Récupère :

```ts
req.body
```

et le transmet au service.

Réponse :

```http
201 Created
```

---

## `update()`

Récupère l'id dans l'URL puis appelle :

```ts
EtudiantService.updateEtudiant(id, req.body)
```

Les méthodes `PUT` et `PATCH` utilisent toutes les deux cette fonction.

---

## `remove()`

Supprime l'étudiant correspondant à l'id.

Retour :

```json
{
  "success": true,
  "message": "Supprimé"
}
```

---

# 18. `src/routes/etudiant.routes.ts`

Ce fichier associe les URL aux controllers.

Routes disponibles :

```text
GET    /api/etudiants
GET    /api/etudiants/:id
POST   /api/etudiants
PUT    /api/etudiants/:id
PATCH  /api/etudiants/:id
DELETE /api/etudiants/:id
```

Correspondance :

```text
GET    /              -> getAll
GET    /:id           -> getById
POST   /              -> create
PUT    /:id           -> update
PATCH  /:id           -> update
DELETE /:id           -> remove
```

---

# 19. `src/routes/auth.routes.ts`

Une seule route d'authentification existe :

```text
POST /api/auth/login
```

Elle appelle :

```ts
login
```

dans `auth.controller.ts`.

---

# 20. Authentification

L'authentification fonctionne selon les étapes suivantes :

```text
Frontend
   │
   │ username + password
   ▼
POST /api/auth/login
   │
   ▼
auth.controller.ts
   │
   ▼
auth.service.ts
   │
   ├── vérification du verrouillage
   │
   ├── recherche de l'email dans PostgreSQL
   │
   ├── comparaison username/password
   │
   └── génération du JWT
   │
   ▼
Frontend
   │
   ▼
localStorage
```

---

# 21. `src/services/auth.service.ts`

Cette fonction :

```ts
login(username, password)
```

contient toute la logique d'authentification.

## Étape 1 : vérification du blocage

```ts
checkLockout(username)
```

Si l'utilisateur est déjà bloqué, le service retourne une erreur de type :

```text
423 Locked
```

---

## Étape 2 : recherche dans PostgreSQL

La requête est :

```sql
SELECT * FROM etudiants WHERE email = $1
```

Le username est envoyé comme valeur de `$1`.

---

## Étape 3 : vérification des identifiants

Le code vérifie deux choses :

```text
username === LOGIN_USERNAME
```

et :

```text
password === LOGIN_PASSWORD
```

Il vérifie également qu'un étudiant correspondant à cet email existe dans PostgreSQL.

Il faut donc que les trois éléments soient cohérents :

```text
LOGIN_USERNAME
        │
        ▼
email présent dans etudiants
        │
        ▼
mot de passe correspondant à LOGIN_PASSWORD
```

---

# 22. Génération du JWT

Lorsque les identifiants sont valides :

```ts
jwt.sign(...)
```

crée un token contenant :

```json
{
  "sub": "id_de_l_etudiant",
  "username": "email_de_l_etudiant"
}
```

Le token expire après :

```text
1 heure
```

La réponse est :

```json
{
  "success": true,
  "data": {
    "token": "...",
    "username": "..."
  }
}
```

---

# 23. `src/services/lockout.service.ts`

Ce fichier gère le blocage des tentatives de connexion.

Les informations sont conservées en mémoire dans :

```ts
Map<string, Record>
```

Chaque utilisateur possède :

```text
attempts
lockedUntil
```

---

## `registerFailed(key)`

Incrémente le nombre d'échecs.

Lorsque le nombre atteint :

```text
LOCK_ATTEMPTS
```

le compte est temporairement bloqué.

Le timestamp de fin est :

```text
Date.now() + LOCK_DURATION_MS
```

---

## `reset(key)`

Supprime l'état de blocage et remet donc le compteur à zéro.

Cette fonction est appelée après une authentification réussie.

---

## `checkLockout(key)`

Retourne :

```ts
{
    attemptsLeft,
    lockedMs
}
```

Exemple :

```json
{
  "attemptsLeft": 2,
  "lockedMs": null
}
```

ou, pendant un blocage :

```json
{
  "attemptsLeft": 0,
  "lockedMs": 45000
}
```

---

# 24. `src/controllers/auth.controller.ts`

Le controller reçoit :

```json
{
  "username": "...",
  "password": "..."
}
```

et appelle :

```ts
AuthService.login(username, password)
```

En cas d'échec, il renvoie une réponse adaptée.

Compte bloqué :

```http
423 Locked
```

Identifiants incorrects :

```http
401 Unauthorized
```

Connexion réussie :

```http
200 OK
```

---

# 25. `src/middlewares/jwt.middleware.ts`

Ce middleware contient :

```ts
authenticateToken
```

Son rôle est de lire :

```text
Authorization: Bearer <TOKEN>
```

dans les headers HTTP.

Il extrait le token puis vérifie :

```ts
jwt.verify(token, JWT_SECRET)
```

Si le token est valide :

```ts
req.user = ...
```

est rempli avec les informations du JWT.

## Important

Le middleware existe dans le projet, mais **il n'est actuellement branché sur aucune route CRUD**.

Cela signifie que dans l'état actuel du projet :

```text
GET    /api/etudiants
POST   /api/etudiants
PUT    /api/etudiants/:id
PATCH  /api/etudiants/:id
DELETE /api/etudiants/:id
```

peuvent être appelées sans JWT.

Le JWT est bien généré lors de la connexion, mais il n'est actuellement pas utilisé comme protection obligatoire des routes CRUD.

---

# 26. `src/middlewares/security.middleware.ts`

Ce middleware configure le CORS.

Les origines autorisées sont :

```text
http://localhost:5173
http://localhost:3000
```

Les méthodes autorisées :

```text
GET
POST
PUT
PATCH
DELETE
```

Les headers autorisés :

```text
Content-Type
Authorization
```

---

# 27. `src/middlewares/error.middleware.ts`

Ce middleware récupère les erreurs non traitées.

Il affiche l'erreur dans la console :

```ts
console.error(err)
```

Puis renvoie une réponse JSON.

Dans l'implémentation actuelle, toute erreur possédant un champ `message` est renvoyée avec le statut :

```http
400 Bad Request
```

Sinon :

```http
500 Internal Server Error
```

---

# 28. `src/utils/app-error.ts`

Ce fichier définit une classe :

```ts
AppError
```

avec :

```text
message
status
code
```

Exemple théorique :

```ts
new AppError('Étudiant introuvable', 404, 'STUDENT_NOT_FOUND')
```

## Important

Cette classe est présente dans le projet mais n'est pas actuellement utilisée par les controllers/services existants.

---

# 29. `src/types/express.d.ts`

Ce fichier étend le type Express `Request`.

Il permet d'avoir :

```ts
req.user
```

dans le code TypeScript.

Le champ est utilisé pour stocker les informations provenant du JWT.

---

# 30. `tsconfig.json`

Le compilateur TypeScript utilise :

```text
target: ES2020
module: CommonJS
```

Le dossier source est :

```text
src/
```

La sortie de compilation est :

```text
dist/
```

Le mode :

```text
strict: true
```

active les vérifications strictes de TypeScript.

---

# 31. Frontend

Le frontend est une application :

```text
React + Vite
```

Structure :

```text
Frontend/
│
├── src/
│   ├── components/
│   │   └── LoginForm.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

---

# 32. Installation du Frontend

Depuis la racine :

```bash
cd Frontend
npm install
```

---

# 33. `Frontend/src/main.jsx`

Ce fichier est le point d'entrée React.

Il récupère :

```html
<div id="root"></div>
```

depuis `index.html`.

Puis :

```jsx
createRoot(...)
```

monte le composant :

```jsx
<App />
```

Enfin, le CSS global est chargé :

```jsx
import './index.css';
```

---

# 34. `Frontend/src/App.jsx`

Le composant principal gère l'état de connexion.

Deux variables importantes :

```jsx
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

et :

```jsx
const [username, setUsername] = useState(null);
```

---

## `handleLoginSuccess(user, token)`

Cette fonction est appelée après une authentification correcte.

Elle passe :

```text
isAuthenticated = true
```

et sauvegarde le nom d'utilisateur affiché dans l'interface.

Le token lui-même est déjà stocké dans `localStorage` par `LoginForm`.

---

## `handleLogout()`

Supprime :

```text
jwt_token
```

du `localStorage`.

Puis remet :

```text
isAuthenticated = false
username = null
```

---

# 35. `Frontend/src/components/LoginForm.jsx`

C'est le composant principal de connexion.

Il gère :

```text
username
password
message
attemptsLeft
lockedUntil
remainingSeconds
```

---

## `username`

Contient le nom d'utilisateur saisi.

---

## `password`

Contient le mot de passe saisi.

---

## `attemptsLeft`

Contient le nombre de tentatives restantes retourné par le backend.

---

## `lockedUntil`

Timestamp correspondant à la fin du blocage.

---

## `remainingSeconds`

Nombre de secondes restantes avant la fin du blocage.

---

# 36. `LOCK_STORAGE_KEY`

Constante :

```jsx
const LOCK_STORAGE_KEY = 'login_lock';
```

Elle correspond à la clé utilisée dans `localStorage` pour conserver l'état du blocage.

Cela permet de conserver l'information de blocage même après un refresh du navigateur.

---

# 37. `useEffect()` de restauration du verrouillage

Au chargement du composant, le code lit :

```text
localStorage.login_lock
```

Si un verrouillage est présent et toujours valide, l'interface est remise en état.

Si le verrouillage a expiré :

```text
login_lock
```

est supprimé.

---

# 38. `useEffect()` du timer

Lorsqu'un compte est bloqué, un :

```js
setInterval(...)
```

met à jour le compteur chaque seconde.

Lorsque le compteur atteint zéro :

```text
lockedUntil = null
remainingSeconds = 0
```

et l'utilisateur peut de nouveau essayer de se connecter.

---

# 39. `startLockout(lockedMs)`

Cette fonction démarre le verrouillage côté frontend.

Elle calcule :

```text
Date.now() + lockedMs
```

puis sauvegarde :

```json
{
  "username": "...",
  "lockedUntil": 123456789
}
```

dans `localStorage`.

---

# 40. `login()`

Cette fonction est responsable de l'appel API.

Elle exécute :

```http
POST /api/auth/login
```

avec :

```json
{
  "username": "...",
  "password": "..."
}
```

Le serveur répond ensuite avec un token JWT en cas de succès.

---

# 41. Stockage du JWT

Lors d'une authentification réussie :

```jsx
localStorage.setItem('jwt_token', token);
```

Le token est donc stocké dans le navigateur.

Le frontend peut ensuite le récupérer grâce à :

```js
localStorage.getItem('jwt_token')
```

---

# 42. `handleSubmit()`

Cette fonction est appelée lorsque l'utilisateur valide le formulaire.

Elle :

1. empêche le comportement HTML par défaut ;
2. vérifie si le compte est bloqué ;
3. vérifie que les champs ne sont pas vides ;
4. appelle `login()`.

---

# 43. `Frontend/src/index.css`

Contient les styles de :

* page principale ;
* header ;
* formulaire ;
* bouton ;
* message d'erreur ;
* compteur de verrouillage ;
* message de tentatives restantes.

---

# 44. `Frontend/vite.config.js`

Vite utilise le port :

```text
5173
```

La partie importante est le proxy :

```js
proxy: {
  '/api': {
    target: 'http://localhost:3000'
  }
}
```

Cela signifie qu'une requête frontend :

```text
/api/auth/login
```

est automatiquement envoyée au backend :

```text
http://localhost:3000/api/auth/login
```

Cela évite d'avoir à mettre l'adresse complète du backend dans le code React.

---

# 45. Lancement du Frontend

Depuis :

```text
Frontend/
```

lancer :

```bash
npm run dev
```

Vite démarre normalement sur :

```text
http://localhost:5173
```

Ouvrir cette adresse dans le navigateur.

---

# 46. Ordre de démarrage complet

Pour tester le projet correctement :

## Étape 1 — Démarrer PostgreSQL

Depuis :

```text
Backend/
```

```bash
docker compose up -d
```

---

## Étape 2 — Vérifier le fichier `.env`

Créer :

```text
Backend/.env
```

et renseigner les valeurs correspondant à la base de données utilisée.

---

## Étape 3 — Installer les dépendances Backend

```bash
cd Backend
npm install
```

---

## Étape 4 — Compiler le Backend

```bash
npm run build
```

---

## Étape 5 — Démarrer le Backend

```bash
npm start
```

Le backend doit afficher quelque chose ressemblant à :

```text
Server running on http://localhost:3000
```

---

## Étape 6 — Installer les dépendances Frontend

Dans un autre terminal :

```bash
cd Frontend
npm install
```

---

## Étape 7 — Démarrer React

```bash
npm run dev
```

---

## Étape 8 — Ouvrir le navigateur

```text
http://localhost:5173
```

---

# 47. Test de connexion

Le compte de test doit correspondre aux valeurs du `.env`.

Par exemple :

```env
LOGIN_USERNAME=sammyfoxxy@gmail.com
LOGIN_PASSWORD=mot_de_passe
```

Le navigateur envoie :

```http
POST /api/auth/login
Content-Type: application/json
```

avec :

```json
{
  "username": "sammyfoxxy@gmail.com",
  "password": "mot_de_passe"
}
```

Une réponse réussie ressemble à :

```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "username": "sammyfoxxy@gmail.com"
  }
}
```

Le token est ensuite conservé dans :

```text
localStorage.jwt_token
```

---

# 48. Test des routes CRUD

Ces tests peuvent être effectués avec Postman, Insomnia ou directement avec curl.

Base URL :

```text
http://localhost:3000
```

---

## GET tous les étudiants

```http
GET /api/etudiants
```

Exemple :

```bash
curl http://localhost:3000/api/etudiants
```

Réponse :

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nom": "Fox",
      "prenom": "Sammy",
      "age": 19,
      "email": "sammyfoxxy@gmail.com"
    }
  ]
}
```

---

# 49. GET un étudiant

```http
GET /api/etudiants/1
```

Réponse :

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nom": "Fox",
    "prenom": "Sammy",
    "age": 19,
    "email": "sammyfoxxy@gmail.com"
  }
}
```

Si l'id n'existe pas :

```http
404 Not Found
```

---

# 50. POST créer un étudiant

URL :

```text
POST http://localhost:3000/api/etudiants
```

Header :

```text
Content-Type: application/json
```

Body :

```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 21,
  "email": "jean.dupont@example.com"
}
```

La réponse est :

```http
201 Created
```

---

# 51. PUT modifier complètement un étudiant

URL :

```text
PUT /api/etudiants/1
```

Body :

```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "age": 22,
  "email": "jean.dupont@example.com"
}
```

Le backend récupère d'abord l'étudiant existant puis remplace les valeurs.

---

# 52. PATCH modifier un étudiant

URL :

```text
PATCH /api/etudiants/1
```

Exemple :

```json
{
  "age": 23
}
```

Les autres informations sont conservées.

---

# 53. DELETE supprimer un étudiant

URL :

```text
DELETE /api/etudiants/1
```

Réponse :

```json
{
  "success": true,
  "message": "Supprimé"
}
```

---

# 54. Tests de sécurité

## Test du rate limiting

Le backend applique :

```text
100 requêtes / 15 minutes / IP
```

Une fois la limite dépassée, les requêtes supplémentaires sont limitées par `express-rate-limit`.

---

## Test du verrouillage du login

Avec :

```env
LOCK_ATTEMPTS=3
LOCK_DURATION_MS=60000
```

faire trois tentatives incorrectes.

Après la troisième tentative :

```text
Compte temporairement bloqué.
```

Le backend renvoie :

```http
423 Locked
```

Le frontend affiche alors un compte à rebours.

---

# 55. Différence entre le verrouillage Backend et Frontend

Le backend garde son propre état de verrouillage en mémoire dans :

```ts
Map<string, Record>
```

Le frontend garde également un état temporaire dans :

```text
localStorage
```

Le verrouillage backend reste la référence réelle pour l'authentification.

Le verrouillage frontend sert principalement à afficher l'état et empêcher l'utilisateur d'envoyer immédiatement une nouvelle requête depuis l'interface.

---

# 56. Important concernant le redémarrage du Backend

Le système de blocage du backend est stocké uniquement en mémoire.

Cela signifie qu'un redémarrage du serveur vide :

```text
Map<string, Record>
```

et donc les blocages côté backend disparaissent.

Le frontend peut toutefois encore conserver temporairement les informations dans `localStorage`.

---

# 57. Fichiers générés

Les dossiers suivants sont générés automatiquement et ne doivent pas être versionnés :

```text
node_modules/
dist/
```

Ils sont recréés avec :

```bash
npm install
```

et :

```bash
npm run build
```

---

# 58. Fichiers qui ne doivent pas être envoyés sur Git

Le fichier :

```text
Backend/.env
```

contient notamment :

```text
DB_PASSWORD
JWT_SECRET
LOGIN_PASSWORD
```

Il ne doit donc pas être commité.

Le professeur doit créer son propre `.env` selon sa configuration.

---

# 59. Reproduire le projet sur une nouvelle machine

Pour qu'une autre personne récupère le projet :

```bash
git clone <URL_DU_PROJET>
cd api-crud-etudiants-complete
```

Puis :

```bash
cd Backend
npm install
```

Créer :

```text
Backend/.env
```

Démarrer PostgreSQL :

```bash
docker compose up -d
```

Compiler :

```bash
npm run build
```

Lancer :

```bash
npm start
```

Dans un deuxième terminal :

```bash
cd Frontend
npm install
npm run dev
```

Puis ouvrir :

```text
http://localhost:5173
```

---

# 60. Résumé des ports

| Service         |   Port |
| --------------- | -----: |
| Frontend Vite   | `5173` |
| Backend Express | `3000` |
| PostgreSQL      | `5432` |

---

# 61. Résumé des endpoints

| Méthode | Endpoint             | Fonction                |
| ------- | -------------------- | ----------------------- |
| GET     | `/`                  | Vérification du backend |
| POST    | `/api/auth/login`    | Connexion               |
| GET     | `/api/etudiants`     | Liste des étudiants     |
| GET     | `/api/etudiants/:id` | Détail d'un étudiant    |
| POST    | `/api/etudiants`     | Création                |
| PUT     | `/api/etudiants/:id` | Modification            |
| PATCH   | `/api/etudiants/:id` | Modification partielle  |
| DELETE  | `/api/etudiants/:id` | Suppression             |

---

# 62. Points importants sur l'état actuel du projet

Le projet contient un système JWT avec :

```text
création du token
vérification du token
stockage du token côté frontend
```

Cependant, dans l'implémentation actuelle, le middleware :

```text
authenticateToken
```

n'est pas branché sur les routes `/api/etudiants`.

Par conséquent, les routes CRUD restent accessibles sans authentification.

De la même manière, la classe :

```text
AppError
```

existe mais n'est pas utilisée par les services/controllers actuels.

Ces éléments sont présents dans le projet mais ne sont pas encore intégrés dans le flux principal.

---

# 63. Technologies utilisées

## Frontend

```text
React
React DOM
Vite
JavaScript / JSX
CSS
```

## Backend

```text
Node.js
Express
TypeScript
PostgreSQL
pg
JSON Web Token
Helmet
CORS
Express Rate Limit
dotenv
Nodemon
```

## Infrastructure

```text
Docker
Docker Compose
PostgreSQL 15
```

---

# 64. Commandes essentielles

## Base de données

```bash
cd Backend
docker compose up -d
```

Arrêter :

```bash
docker compose down
```

Arrêter et supprimer les données :

```bash
docker compose down -v
```

---

## Backend

Installation :

```bash
cd Backend
npm install
```

Compilation :

```bash
npm run build
```

Production / exécution de la version compilée :

```bash
npm start
```

Développement TypeScript :

```bash
npx nodemon --exec ts-node src/index.ts
```

---

## Frontend

Installation :

```bash
cd Frontend
npm install
```

Développement :

```bash
npm run dev
```

Build :

```bash
npm run build
```

Preview du build :

```bash
npm run preview
```

---

# 65. Dépannage

## Erreur de connexion PostgreSQL

Vérifier :

```text
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

Puis vérifier Docker :

```bash
docker compose ps
```

Le conteneur PostgreSQL doit être en fonctionnement.

---

## Le frontend affiche une erreur réseau

Vérifier que le backend fonctionne :

```text
http://localhost:3000/
```

Si cette URL ne répond pas, démarrer le backend.

---

## Le login est toujours refusé

Vérifier les trois éléments suivants :

1. `LOGIN_USERNAME` ;
2. `LOGIN_PASSWORD` ;
3. présence d'un étudiant dont `email` correspond exactement à `LOGIN_USERNAME`.

Par exemple :

```text
LOGIN_USERNAME=sammyfoxxy@gmail.com
```

doit correspondre à :

```text
email = sammyfoxxy@gmail.com
```

dans la table `etudiants`.

---

## Le script SQL ne recrée pas les données

Le volume PostgreSQL existe probablement déjà.

Exécuter :

```bash
docker compose down -v
docker compose up -d
```

Attention : toutes les données Docker seront supprimées.

---

# 66. Conclusion

Le projet fonctionne selon une architecture simple :

```text
React
  ↓
Vite Proxy
  ↓
Express
  ↓
Services
  ↓
PostgreSQL
```

L'authentification fonctionne indépendamment du CRUD :

```text
React Login
    ↓
POST /api/auth/login
    ↓
AuthService
    ↓
PostgreSQL + variables .env
    ↓
JWT
    ↓
localStorage
```

Le CRUD fonctionne avec :

```text
Controller
    ↓
Service
    ↓
PostgreSQL
```

Pour tester le projet dans des conditions propres, la procédure recommandée est donc :

```text
1. Créer Backend/.env
2. Démarrer PostgreSQL avec Docker
3. npm install dans Backend
4. npm run build
5. npm start
6. npm install dans Frontend
7. npm run dev
8. Ouvrir http://localhost:5173
9. Tester le login
10. Tester les endpoints CRUD avec Postman
```
