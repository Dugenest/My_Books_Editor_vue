// src/services/api.js
import axios from 'axios';
import router from '@/router'; // Importez votre router

// URL de l'API avec le port correct
const API_URL = 'http://localhost:8111'; // URL directe vers le backend

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token JWT si nécessaire
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token présent, ajout aux headers');
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('Aucun token trouvé dans localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Journaliser les détails de l'erreur pour le débogage
    console.error('Erreur API:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
    });

    // Si le serveur répond avec un code 401 (Non autorisé) ou 403 (Interdit)
    if (error.response) {
      if (error.response.status === 401) {
        // Token expiré ou invalide
        console.warn('Session expirée ou non authentifiée');
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirection vers la page de connexion si nous ne sommes pas déjà sur cette page
        if (router.currentRoute.value.name !== 'Login') {
          router.push({
            name: 'Login',
            query: { redirect: router.currentRoute.value.fullPath },
          });
        }
      } else if (error.response.status === 403) {
        console.warn('Accès refusé (403 Forbidden)');
        // Ne pas rediriger automatiquement, mais informer l'utilisateur du problème d'accès
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
