// src/services/AuthService.js
import api from './api';

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
    // Utiliser atob pour décoder
    const decoded = atob(base64);
    // Convertir la chaîne décodée en UTF-8
    return decodeURIComponent(
      Array.from(decoded)
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    console.error('Erreur de décodage base64:', e);
    throw e;
  }
}

class AuthService {
  /**
   * Connecte un utilisateur
   * @param {Object} credentials - Données de connexion
   * @returns {Promise<Object>} - Réponse de l'API avec le token
   */
  async login(credentials) {
    try {
      console.log('🔍 Tentative de connexion:', credentials.email);
      // Utiliser /auth/login au lieu de /api/auth/login car baseURL inclut déjà /api
      const response = await api.post('/auth/login', credentials);
      console.log('✅ Connexion réussie:', response.data);

      // Stocker le token dans le localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_info', JSON.stringify(response.data.user));

      return response;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} credentials - Données d'inscription
   * @returns {Promise<Object>} - Réponse de l'API
   */
  async register(credentials) {
    try {
      console.log("🔍 Tentative d'inscription:", credentials.email);
      // Utiliser /auth/register au lieu de /api/auth/register car baseURL inclut déjà /api
      const response = await api.post('/auth/register', credentials);
      console.log('✅ Inscription réussie:', response.data);
      return response;
    } catch (error) {
      console.error("❌ Erreur d'inscription:", error);
      throw error;
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');
  }

  /**
   * Récupère l'utilisateur connecté
   * @returns {Promise} - Promesse contenant les données de l'utilisateur
   */
  getCurrentUser() {
    return api.get('/users/me');
  }

  /**
   * Vérifie si l'utilisateur est connecté
   * @returns {boolean} - True si l'utilisateur est connecté
   */
  isAuthenticated() {
    const token =
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(base64UrlDecode(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (e) {
      console.error('Erreur lors de la vérification du token:', e);
      return false;
    }
  }

  /**
   * Récupère le token d'authentification
   * @returns {string|null} - Le token d'authentification ou null
   */
  getToken() {
    return (
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    );
  }

  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} userData - Nouvelles données de l'utilisateur
   * @returns {Promise} - Promesse contenant les données mises à jour
   */
  updateProfile(userData) {
    return api.put('/auth/profile', userData);
  }

  /**
   * Change le mot de passe de l'utilisateur
   * @param {Object} passwordData - Données de changement de mot de passe
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  changePassword(passwordData) {
    return api.put('/auth/change-password', passwordData);
  }

  /**
   * Demande de réinitialisation de mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  requestPasswordReset(email) {
    return api.post('/auth/forgot-password', { email });
  }

  /**
   * Réinitialise le mot de passe avec un token
   * @param {Object} resetData - Données de réinitialisation
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  resetPassword(resetData) {
    return api.post('/auth/reset-password', resetData);
  }

  /**
   * Vérifie si un email est déjà utilisé
   * @param {string} email - Email à vérifier
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  checkEmail(email) {
    return api.get('/auth/check-email', { params: { email } });
  }

  /**
   * Vérifie si un nom d'utilisateur est déjà utilisé
   * @param {string} username - Nom d'utilisateur à vérifier
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  checkUsername(username) {
    return api.get('/auth/check-username', { params: { username } });
  }

  /**
   * Active le compte d'un utilisateur
   * @param {string} token - Token d'activation
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  activateAccount(token) {
    return api.post('/auth/activate', { token });
  }

  /**
   * Renvoie l'email d'activation
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  resendActivationEmail(email) {
    return api.post('/auth/resend-activation', { email });
  }
}

export default new AuthService();
