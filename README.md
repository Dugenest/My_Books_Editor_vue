# My Books Editor - Frontend

## Description
Interface utilisateur pour l'application "My Books Editor", une application de gestion d'achat de livres développée avec Vue.js 3.

## Prérequis
- Node.js (v14.x ou supérieur)
- NPM (v6.x ou supérieur)

## Technologies
- **Vue.js 3**: Framework JavaScript pour le développement d'interfaces utilisateur
- **Vuex 4**: Gestion d'état centralisée pour Vue.js
- **Vue Router 4**: Gestion du routage côté client
- **Axios**: Client HTTP pour les requêtes API
- **Chart.js**: Création de graphiques et visualisations
- **SASS**: Préprocesseur CSS

## Structure du projet
```
frontend/
├── public/                  # Fichiers publics statiques
├── src/                     # Code source
│   ├── assets/              # Images, polices, etc.
│   ├── components/          # Composants Vue réutilisables
│   ├── router/              # Configuration du routeur
│   ├── store/               # État Vuex et modules
│   ├── views/               # Composants de page
│   ├── services/            # Services pour l'API
│   ├── utils/               # Fonctions utilitaires
│   ├── App.vue              # Composant racine
│   └── main.js              # Point d'entrée de l'application
├── tests/                   # Tests unitaires et d'intégration
└── .env.local               # Variables d'environnement locales (à créer)
```

## Installation

1. Cloner le dépôt:
```bash
git clone [URL_DU_DEPOT]
cd [NOM_DU_DEPOT]/frontend
```

2. Installer les dépendances:
```bash
npm install
```

3. Créer un fichier `.env.local` à la racine du projet frontend avec le contenu suivant:
```
VUE_APP_API_URL=http://localhost:8111/api
```

## Développement

### Lancer le serveur de développement
```bash
npm run serve
```
L'application sera disponible à l'adresse [http://localhost:8080](http://localhost:8080)

### Linting et correction des fichiers
```bash
npm run lint
```

### Exécuter les tests unitaires
```bash
npm run test:unit
```

## Déploiement

### Compiler et minifier pour la production
```bash
npm run build
```
Les fichiers générés se trouveront dans le dossier `dist`.

## Fonctionnalités principales

### Authentification
- Inscription d'utilisateur
- Connexion/Déconnexion
- Gestion des profils

### Gestion des livres
- Consultation du catalogue de livres
- Ajout/Édition/Suppression de livres
- Recherche et filtrage avancés

### Gestion des achats
- Ajout de livres au panier
- Processus d'achat
- Historique des achats

### Administration
- Gestion des utilisateurs
- Gestion des stocks
- Statistiques et rapports de vente

## Communication avec le back-end

### Configuration Axios
Axios est configuré pour communiquer avec l'API REST du backend Spring Boot:

```javascript
// src/services/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
  withCredentials: false,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token JWT aux requêtes
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Exemples de services
Les services d'API sont organisés par fonctionnalité:

```javascript
// src/services/BookService.js
import apiClient from './api';

export default {
  getBooks(page = 0, size = 20) {
    return apiClient.get(`/books?page=${page}&size=${size}`);
  },
  getBook(id) {
    return apiClient.get(`/books/${id}`);
  },
  createBook(book) {
    return apiClient.post('/books', book);
  },
  updateBook(id, book) {
    return apiClient.put(`/books/${id}`, book);
  },
  deleteBook(id) {
    return apiClient.delete(`/books/${id}`);
  },
  searchBooks(query) {
    return apiClient.get(`/books/search?query=${query}`);
  }
};
```

## Gestion d'état avec Vuex

### Structure des modules Vuex
```
store/
├── index.js                # Configuration principale du store
├── modules/
│   ├── auth.js             # Authentification et utilisateurs
│   ├── basket.js           # Panier d'achat
│   ├── dashboard.js        # Tableau de bord
│   └── orders.js           # Commandes
```

### Exemple de module Vuex
```javascript
// store/modules/auth.js
import AuthService from '@/services/AuthService';

export default {
  namespaced: true,
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || '',
    status: ''
  },
  getters: {
    isAuthenticated: state => !!state.token,
    authStatus: state => state.status,
    currentUser: state => state.user
  },
  mutations: {
    AUTH_REQUEST(state) {
      state.status = 'loading';
    },
    AUTH_SUCCESS(state, { token, user }) {
      state.status = 'success';
      state.token = token;
      state.user = user;
    },
    AUTH_ERROR(state) {
      state.status = 'error';
    },
    LOGOUT(state) {
      state.status = '';
      state.token = '';
      state.user = null;
    }
  },
  actions: {
    login({ commit }, credentials) {
      return new Promise((resolve, reject) => {
        commit('AUTH_REQUEST');
        AuthService.login(credentials)
          .then(response => {
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            commit('AUTH_SUCCESS', { token, user });
            resolve(response);
          })
          .catch(err => {
            commit('AUTH_ERROR');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            reject(err);
          });
      });
    },
    logout({ commit }) {
      return new Promise(resolve => {
        commit('LOGOUT');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        resolve();
      });
    }
  }
};
```

## Personnalisation

### Styles
Le projet utilise SASS pour les styles. Les fichiers principaux se trouvent dans:
```
src/assets/scss/
```

### Configuration Vue CLI
La configuration de Vue CLI peut être personnalisée dans le fichier `vue.config.js` à la racine du projet.

## Bonnes pratiques

### Conventions de nommage
- **Composants**: PascalCase (ex: `BookList.vue`)
- **Fichiers JS**: camelCase (ex: `bookService.js`)
- **Dossiers**: kebab-case (ex: `user-profile/`)

### Structure des composants
Suivre l'approche "Single-File Component" de Vue:
```vue
<template>
  <!-- HTML -->
</template>

<script>
// JavaScript
export default {
  name: 'ComponentName',
  // ...
}
</script>

<style lang="scss" scoped>
/* CSS/SCSS */
</style>
```

## Résolution des problèmes

### CORS
Si vous rencontrez des problèmes de CORS:
1. Vérifiez que le backend autorise les requêtes depuis l'origine du frontend
2. Assurez-vous que le frontend et le backend utilisent les ports corrects

### Authentification
Si vous rencontrez des problèmes d'authentification:
1. Vérifiez que le token JWT est correctement stocké dans le localStorage
2. Assurez-vous que l'intercepteur Axios ajoute correctement le token aux en-têtes

## Ressources
- [Documentation Vue.js](https://vuejs.org/)
- [Documentation Vuex](https://vuex.vuejs.org/)
- [Documentation Vue Router](https://router.vuejs.org/)
- [Documentation Axios](https://axios-http.com/docs/intro)