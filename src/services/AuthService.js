// AuthService.js
import axios from 'axios';

// Configuration de base pour les requêtes API
const API_URL = process.env.VUE_APP_API_URL || '/api';

const AuthService = {
  // Obtenir le token depuis le localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    const token = this.getToken();
    if (!token) {
      console.log('Pas de token trouvé, utilisateur non authentifié');
      return false;
    }

    try {
      // Vérifier la validité du token (format simple)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.log('Format de token invalide, utilisateur non authentifié');
        return false;
      }

      // Vérifier si le token est expiré (si possible)
      try {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          console.log('Token expiré, utilisateur non authentifié');
          this.logout(); // Nettoyer le localStorage si le token est expiré
          return false;
        }
      } catch (e) {
        console.log('Impossible de décoder le token, mais on continue');
        // Continuer même si on ne peut pas décoder le token
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      // En cas d'erreur dans la validation du token, considérer l'utilisateur comme non authentifié
      this.logout();
      return false;
    }
  },

  // Récupérer l'utilisateur courant à partir du token
  async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      this.logout();
      return null;
    }
  },

  // Connexion utilisateur
  async login(credentials) {
    try {
      // Assurez-vous que cette URL correspond à votre endpoint d'API
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        credentials
      );

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);

        // Stockage des informations utilisateur pour un accès rapide
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        // Configuration de l'en-tête Authorization pour toutes les futures requêtes
        axios.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${response.data.token}`;
      }
      return response;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // Déconnexion utilisateur
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  },

  // Récupération de l'utilisateur du localStorage (pour un accès rapide sans API)
  getUserFromLocalStorage() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Erreur lors du parsing des données utilisateur:', e);
        localStorage.removeItem('user');
      }
    }
    return null;
  },

  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role) {
    const user = this.getUserFromLocalStorage();
    if (!user || !user.role) return false;

    // Normalisation du rôle (supprimer ROLE_ si présent et mettre en majuscules)
    let userRole = user.role.toUpperCase();
    if (userRole.startsWith('ROLE_')) {
      userRole = userRole.substring(5);
    }

    const normalizedRole = role.toUpperCase().replace('ROLE_', '');
    return userRole === normalizedRole;
  },

  // Vérifier si l'utilisateur est admin
  isAdmin() {
    return this.hasRole('ADMIN');
  },

  // Vérifier si l'utilisateur est auteur
  isAuthor() {
    return this.hasRole('AUTHOR');
  },

  // Vérifier si l'utilisateur est éditeur
  isEditor() {
    return this.hasRole('EDITOR');
  },

  // Initialisation du service au démarrage de l'application
  async initAuth() {
    const token = this.getToken();
    if (!token) {
      console.log('Pas de token au démarrage, utilisateur non authentifié');
      return false;
    }

    // Configuration de l'en-tête Authorization
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Vérifier la validité du token
    if (this.isAuthenticated()) {
      try {
        // Récupérer les informations utilisateur à jour
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.data) {
          // Mettre à jour les informations de l'utilisateur dans le localStorage
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          console.log('Informations utilisateur mises à jour au démarrage');
        }

        return true;
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        // Si l'API renvoie une erreur (token invalide, etc.), nettoyer
        if (
          error.response &&
          (error.response.status === 401 || error.response.status === 403)
        ) {
          console.log('Token invalide ou expiré, déconnexion...');
          this.logout();
        }
        return false;
      }
    }

    return false;
  },
};

export default AuthService;
