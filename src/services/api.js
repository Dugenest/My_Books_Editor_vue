import axios from 'axios';
import router from '@/router';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    // Vérifier les deux clés possibles pour le token
    const token =
      localStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token ajouté à la requête:', config.url);
    } else {
      console.warn('⚠️ Pas de token disponible pour la requête:', config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log détaillé pour toutes les erreurs
    if (error.response) {
      console.error(`Erreur ${error.response.status} détaillée:`, {
        url: originalRequest.url,
        method: originalRequest.method,
        headers: originalRequest.headers,
        data: originalRequest.data,
        responseData: error.response.data,
      });

      // Gestion spécifique des erreurs d'authentification
      if (error.response.status === 401) {
        console.error("Erreur d'authentification: Token invalide ou expiré");

        // Déconnexion et redirection
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user');

        // Rediriger vers la page de connexion
        if (router && router.currentRoute) {
          router.push(
            '/login?redirect=' +
              router.currentRoute.value.fullPath +
              '&error=session_expired'
          );
        } else {
          window.location.href = '/login?error=session_expired';
        }

        return Promise.reject(
          new Error('Session expirée. Veuillez vous reconnecter.')
        );
      }

      // Gestion des erreurs d'autorisation
      if (error.response.status === 403) {
        console.error("Erreur d'autorisation: Permissions insuffisantes");
        return Promise.reject(
          new Error(
            "Vous n'avez pas les permissions nécessaires pour effectuer cette action."
          )
        );
      }
    } else {
      console.error('Erreur réseau:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
