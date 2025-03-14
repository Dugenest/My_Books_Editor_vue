// src/services/AuthService.js
import axios from 'axios';
import apiClient from './api';

const API_URL = 'http://localhost:8111/api/auth';

// Mode de développement sans backend
const DEV_MODE = true; // Mettre à true pour utiliser des données fictives

// Fonction utilitaire pour l'encodage base64url (compatible JWT)
function base64UrlEncode(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Fonction utilitaire pour le décodage base64url
function base64UrlDecode(str) {
  // Ajouter le padding si nécessaire
  let base64 = str;
  switch (base64.length % 4) {
    case 2:
      base64 += '==';
      break;
    case 3:
      base64 += '=';
      break;
  }

  // Remplacer les caractères spéciaux
  base64 = base64.replace(/-/g, '+').replace(/_/g, '/');

  try {
    return atob(base64);
  } catch (e) {
    console.error('Erreur de décodage base64:', e);
    throw e;
  }
}

class AuthService {
  /**
   * Connexion utilisateur
   * @param {Object} credentials - Informations de connexion
   * @param {string} credentials.username - Nom d'utilisateur ou email
   * @param {string} credentials.password - Mot de passe
   * @returns {Promise} - Promesse contenant les données d'authentification
   */
  login(credentials) {
    // En mode développement, simuler une connexion réussie
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: 1,
            email: credentials.email || credentials.username,
            username:
              credentials.username ||
              (credentials.email ? credentials.email.split('@')[0] : 'user'),
            firstName: 'Utilisateur',
            lastName: 'Test',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
          };

          // Créer un vrai token JWT au format correct
          const header = base64UrlEncode(
            JSON.stringify({ alg: 'HS256', typ: 'JWT' })
          );
          const payload = base64UrlEncode(
            JSON.stringify({
              id: mockUser.id,
              email: mockUser.email,
              role: mockUser.role,
              exp: Math.floor(Date.now() / 1000) + 3600, // Expiration dans 1 heure
            })
          );
          const signature = base64UrlEncode('simulated-signature');
          const token = `${header}.${payload}.${signature}`;

          console.log('Token de développement généré:', token);

          // Stocker le token et les infos utilisateur
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(mockUser));

          const response = {
            data: {
              token: token,
              user: mockUser,
            },
          };

          resolve(response);
        }, 500); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return axios.post(`${API_URL}/login`, credentials).then((response) => {
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response;
    });
  }

  /**
   * Inscription utilisateur
   * @param {Object} user - Informations de l'utilisateur
   * @param {string} user.username - Nom d'utilisateur
   * @param {string} user.email - Email
   * @param {string} user.password - Mot de passe
   * @param {string} user.firstName - Prénom (optionnel)
   * @param {string} user.lastName - Nom (optionnel)
   * @returns {Promise} - Promesse contenant les données d'authentification
   */
  async register(user) {
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockResponse = {
            data: {
              message: 'Inscription réussie',
              user: {
                id: Math.floor(Math.random() * 1000) + 1,
                ...user,
                role: 'USER',
                createdAt: new Date().toISOString(),
              },
            },
          };
          console.log(
            'Utilisateur enregistré (mode dev):',
            mockResponse.data.user
          );
          resolve(mockResponse);
        }, 500);
      });
    }

    try {
      const response = await apiClient.post('/auth/register', user);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  }

  /**
   * Récupère l'utilisateur connecté
   * @returns {Object|null} - Les informations de l'utilisateur ou null
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error(
        'Erreur lors de la récupération des données utilisateur:',
        e
      );
      return null;
    }
  }

  /**
   * Récupère les informations utilisateur depuis l'API
   * @returns {Promise} - Promesse contenant les données de l'utilisateur
   */
  fetchUserProfile() {
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              resolve({ data: user });
            } catch (e) {
              resolve({ data: null });
            }
          } else {
            resolve({ data: null });
          }
        }, 300);
      });
    }

    return axios.get(`${API_URL}/me`);
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Utilisateur déconnecté');
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * @returns {boolean} - True si l'utilisateur est authentifié, sinon False
   */
  isAuthenticated() {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    // Vérifier si le token est un JWT valide et non expiré
    try {
      // Décodage du JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Format de token invalide');
        return false;
      }

      try {
        const payloadJson = base64UrlDecode(parts[1]);
        const payload = JSON.parse(payloadJson);

        // Vérifier l'expiration si elle existe
        if (payload.exp) {
          return payload.exp * 1000 > Date.now();
        }

        return true;
      } catch (decodeError) {
        console.error('Erreur lors du décodage du payload:', decodeError);
        // Lors du développement, on peut tolérer un token mal formé
        if (DEV_MODE) {
          return true;
        }
        return false;
      }
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
      return false;
    }
  }

  /**
   * Configure l'en-tête d'autorisation pour les futures requêtes API
   * @param {string} token - Token JWT
   */
  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Supprime l'en-tête d'autorisation
   */
  removeAuthHeader() {
    delete axios.defaults.headers.common['Authorization'];
  }

  /**
   * Demande de réinitialisation de mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  requestPasswordReset(email) {
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`Demande de réinitialisation pour ${email} (mode dev)`);
          resolve({
            data: {
              message: 'Un email de réinitialisation a été envoyé (simulation)',
            },
          });
        }, 500);
      });
    }

    return axios.post(`${API_URL}/password-reset-request`, { email });
  }

  /**
   * Réinitialisation du mot de passe
   * @param {Object} resetData - Données de réinitialisation
   * @param {string} resetData.token - Token de réinitialisation
   * @param {string} resetData.password - Nouveau mot de passe
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  resetPassword(resetData) {
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(
            'Réinitialisation du mot de passe (mode dev):',
            resetData.token
          );
          resolve({
            data: {
              message: 'Mot de passe réinitialisé avec succès (simulation)',
            },
          });
        }, 500);
      });
    }

    return axios.post(`${API_URL}/password-reset`, resetData);
  }

  /**
   * Vérifie si un token de réinitialisation est valide
   * @param {string} token - Token de réinitialisation
   * @returns {Promise} - Promesse contenant la validité du token
   */
  validateResetToken(token) {
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // En mode dev, considérer tout token qui commence par "valid" comme valide
          const isValid = token.startsWith('valid');
          console.log(
            `Validation du token ${token} (mode dev): ${
              isValid ? 'valide' : 'invalide'
            }`
          );

          if (isValid) {
            resolve({
              data: {
                valid: true,
                message: 'Token valide',
              },
            });
          } else {
            resolve({
              data: {
                valid: false,
                message: 'Token invalide ou expiré',
              },
            });
          }
        }, 300);
      });
    }

    return axios.get(`${API_URL}/validate-reset-token/${token}`);
  }

  /**
   * Configure l'intercepteur pour actualiser le token
   * @param {Function} refreshCallback - Fonction appelée lorsque le token est expiré
   * @param {Function} logoutCallback - Fonction appelée lorsque l'actualisation échoue
   */
  setupTokenRefresh(refreshCallback, logoutCallback) {
    // Intercepteur de requête
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si l'erreur est 401 (Non autorisé) et que nous n'avons pas déjà tenté de rafraîchir le token
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          try {
            // Tentative de rafraîchissement du token
            await refreshCallback();

            // Actualisation du header d'autorisation avec le nouveau token
            const token = localStorage.getItem('token');
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }

            // Réessayer la requête originale
            return axios(originalRequest);
          } catch (refreshError) {
            // Si le rafraîchissement échoue, déconnexion
            logoutCallback();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Récupère le token JWT
   * @returns {string|null} - Le token JWT ou null
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string} role - Le rôle à vérifier
   * @returns {boolean} - True si l'utilisateur a le rôle, sinon False
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Selon votre structure de données utilisateur
    if (typeof user.role === 'string') {
      return user.role === role;
    } else if (Array.isArray(user.roles)) {
      return user.roles.includes(role);
    }

    return false;
  }
}

export default new AuthService();
