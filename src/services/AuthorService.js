import axios from 'axios';

// Gestion du token d'authentification
const AuthInterceptor = {
  // Ajouter le token à chaque requête
  addToken(config) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },

  // Gestion des erreurs d'authentification
  handleAuthError(error) {
    if (error.response && error.response.status === 403) {
      // Déconnexion si le token est invalide
      this.logout();
    }
    return Promise.reject(error);
  },

  // Déconnexion de l'utilisateur
  logout() {
    localStorage.removeItem('auth_token');
    // Rediriger vers la page de connexion
    window.location.href = '/login';
  },
};

class AuthorService {
  constructor() {
    // Configuration de l'instance Axios
    this.api = axios.create({
      baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8111/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Ajouter les intercepteurs
    this.api.interceptors.request.use(
      (config) => AuthInterceptor.addToken(config),
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => AuthInterceptor.handleAuthError(error)
    );
  }

  // Récupérer tous les auteurs
  async getAuthors(params = {}) {
    try {
      const response = await this.api.get('/authors', { params });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des auteurs:', error);
      throw error;
    }
  }

  // Créer un nouvel auteur avec utilisateur
  async createAuthorWithUser(authorData, userData) {
    try {
      // Nettoyer et valider les données
      const cleanedAuthorData = this.cleanAuthorData(authorData);
      const cleanedUserData = this.cleanUserData(userData);

      // Préparation des données complètes
      const combinedData = {
        ...cleanedAuthorData,
        user: {
          ...cleanedUserData,
          role: userData.role || 'AUTHOR', // Role par défaut
          active: userData.active !== undefined ? userData.active : true, // Actif par défaut
        },
      };

      console.group('📋 Données Préparées pour Création');
      console.log('Données Combinées:', JSON.stringify(combinedData, null, 2));
      console.groupEnd();

      // Validation des données
      this.validateAuthorData(cleanedAuthorData);
      this.validateUserData(combinedData.user);

      // Envoi de la requête
      const response = await this.api.post('/authors', combinedData);
      return response.data;
    } catch (error) {
      // Gestion détaillée des erreurs
      console.group('🔥 Erreur de Création Complète');
      console.log("Type d'erreur:", error.name);
      console.log('Message:', error.message);

      if (error.response) {
        console.log('Statut:', error.response.status);
        console.log(
          "Données de l'erreur:",
          JSON.stringify(error.response.data, null, 2)
        );
      }

      console.groupEnd();

      // Extraction et génération d'un message d'erreur significatif
      const errorMessage = this.extractErrorMessage(error);

      // Lancer une nouvelle erreur avec des détails
      const fullError = new Error(errorMessage);
      fullError.originalError = error;

      throw fullError;
    }
  }

  // Méthodes de nettoyage et validation (identiques à la version précédente)
  cleanAuthorData(data) {
    const cleaned = { ...data };

    // Trim des champs texte
    ['firstName', 'lastName', 'biography', 'nationality'].forEach((field) => {
      if (cleaned[field] && typeof cleaned[field] === 'string') {
        cleaned[field] = cleaned[field].trim();
      }
    });

    // Conversion de la date de naissance
    if (cleaned.birthDate) {
      const birthDate = new Date(cleaned.birthDate);
      if (!isNaN(birthDate.getTime())) {
        cleaned.birthDate = birthDate.toISOString().split('T')[0];
      } else {
        delete cleaned.birthDate;
      }
    }

    // Supprimer les champs vides
    Object.keys(cleaned).forEach((key) => {
      if (
        cleaned[key] === '' ||
        cleaned[key] === null ||
        cleaned[key] === undefined
      ) {
        delete cleaned[key];
      }
    });

    return cleaned;
  }

  cleanUserData(data) {
    const cleaned = { ...data };

    // Trim et mise en minuscules
    ['username', 'email'].forEach((field) => {
      if (cleaned[field] && typeof cleaned[field] === 'string') {
        cleaned[field] = cleaned[field].trim().toLowerCase();
      }
    });

    // Supprimer les champs vides
    Object.keys(cleaned).forEach((key) => {
      if (
        cleaned[key] === '' ||
        cleaned[key] === null ||
        cleaned[key] === undefined
      ) {
        delete cleaned[key];
      }
    });

    return cleaned;
  }

  validateAuthorData(data) {
    const errors = {};

    // Champs obligatoires
    if (!data.firstName || data.firstName.trim() === '') {
      errors.firstName = 'Le prénom est obligatoire';
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.lastName = 'Le nom est obligatoire';
    }

    // Validation de la date de naissance
    if (data.birthDate) {
      const birthDate = new Date(data.birthDate);
      const currentDate = new Date();
      const minDate = new Date(1800, 0, 1);

      if (isNaN(birthDate.getTime())) {
        errors.birthDate = 'Format de date invalide';
      } else if (birthDate > currentDate) {
        errors.birthDate =
          'La date de naissance ne peut pas être dans le futur';
      } else if (birthDate < minDate) {
        errors.birthDate = 'La date de naissance semble incorrecte';
      }
    }

    // Levée d'exception si des erreurs existent
    if (Object.keys(errors).length > 0) {
      const validationError = new Error("Données de l'auteur invalides");
      validationError.details = errors;
      throw validationError;
    }
  }

  validateUserData(data) {
    const errors = {};

    // Validation du nom d'utilisateur
    if (!data.username || data.username.trim() === '') {
      errors.username = "Le nom d'utilisateur est obligatoire";
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = 'Email invalide';
    }

    // Validation du mot de passe
    if (!data.password || data.password.length < 8) {
      errors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    // Levée d'exception si des erreurs existent
    if (Object.keys(errors).length > 0) {
      const validationError = new Error('Données utilisateur invalides');
      validationError.details = errors;
      throw validationError;
    }
  }

  extractErrorMessage(error) {
    // Extraction du message d'erreur le plus pertinent
    if (error.response && error.response.data) {
      // Si le backend renvoie un message spécifique
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }

      // Si le backend renvoie un objet avec des messages d'erreur
      if (error.response.data.message) {
        return error.response.data.message;
      }

      // Si le backend renvoie des détails d'erreur
      if (error.response.data.details) {
        return JSON.stringify(error.response.data.details);
      }
    }

    // Message par défaut
    return error.message || 'Erreur de création non spécifiée';
  }

  // Méthode de connexion
  async login(credentials) {
    try {
      const response = await this.api.post('/login', credentials);

      // Stocker le token
      localStorage.setItem('auth_token', response.data.token);

      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  // Méthode de déconnexion
  logout() {
    AuthInterceptor.logout();
  }
}

// Exportation d'une instance unique du service
export default new AuthorService();

// Exemple d'utilisation avec gestion d'erreur complète
export const createAuthorWithDetailedErrorHandling = async (
  authorData,
  userData
) => {
  try {
    const newAuthor = await AuthorService.createAuthorWithUser(
      authorData,
      userData
    );
    console.log('✅ Auteur créé avec succès:', newAuthor);
    return newAuthor;
  } catch (error) {
    console.group("❌ Échec de création d'auteur");
    console.log('Message:', error.message);
    console.log('Détails complets:', error);
    console.groupEnd();

    // Affichage pour l'utilisateur
    const errorMessage = error.details
      ? `Création impossible : ${error.message}\nDétails : ${JSON.stringify(
          error.details
        )}`
      : `Erreur de création : ${error.message}`;

    alert(errorMessage);

    throw error;
  }
};
