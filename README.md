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