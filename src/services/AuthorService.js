// src/services/AuthorService.js

import apiClient from './api';

// Gestion du token d'authentification
const AuthInterceptor = {
  // Ajouter le token à chaque requête
  addToken(config) {
    // Vérifier les deux clés possibles pour le token
    const token =
      localStorage.getItem('auth_token') || localStorage.getItem('token');

    if (token) {
      // S'assurer que les headers existent
      if (!config.headers) {
        config.headers = {};
      }

      // Ajouter le token d'authentification
      config.headers['Authorization'] = `Bearer ${token}`;

      console.log('🔍 Token ajouté à la requête:', config.url);
    } else {
      console.warn('⚠️ Pas de token disponible pour la requête:', config.url);

      // Vérifier si le token existe sous d'autres formes
      const authToken = localStorage.getItem('auth_token');
      const regularToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');

      console.log('🔎 Recherche de tokens:');
      console.log('- auth_token dans localStorage:', !!authToken);
      console.log('- token dans localStorage:', !!regularToken);
      console.log('- token dans sessionStorage:', !!sessionToken);
    }

    console.log('🔍 Intercepteur - Config de requête:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      hasData: !!config.data,
      authToken: token ? `${token.substring(0, 10)}...` : 'Non défini',
    });
    return config;
  },

  // Gestion des erreurs d'authentification
  handleAuthError(error) {
    console.log('🔍 Intercepteur - Erreur de réponse:', {
      status: error.response?.status,
      message: error.message,
    });

    // Si erreur 401 (non autorisé) ou 403 (interdit), problème d'authentification
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      console.warn(
        "⚠️ Erreur d'authentification détectée:",
        error.response.status
      );

      // Vérifier si le token existe
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.error("❌ Pas de token d'authentification trouvé");
      } else {
        console.error('❌ Token invalide ou expiré');
      }

      // Déconnexion si le token est invalide
      this.logout();
    }
    return Promise.reject(error);
  },

  // Déconnexion de l'utilisateur
  logout() {
    console.log('🔄 Déconnexion en cours...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');

    // Rediriger vers la page de connexion
    window.location.href = '/login';
  },
};

class AuthorService {
  constructor() {
    // Configuration de l'instance API
    this.api = apiClient;

    // Ajouter les intercepteurs
    this.api.interceptors.request.use(
      (config) => AuthInterceptor.addToken(config),
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ Intercepteur - Réponse réussie:', {
          status: response.status,
          url: response.config.url,
          method: response.config.method,
        });
        return response;
      },
      (error) => AuthInterceptor.handleAuthError(error)
    );
  }

  // Récupérer tous les auteurs
  async getAuthors(params = {}) {
    try {
      console.log(
        '🔍 Tentative de récupération des auteurs avec params:',
        params
      );
      const response = await this.api.get('/authors', { params });
      console.log(
        '✅ Données des auteurs récupérées avec succès:',
        response.data
      );
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des auteurs:', error);
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);

      // Retourner une réponse vide pour éviter de bloquer l'interface
      return { data: { content: [], totalElements: 0, totalPages: 1 } };
    }
  }

  async resetPassword(authorId, passwordData) {
    try {
      const response = await this.api.post(
        `/authors/${authorId}/reset-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la réinitialisation du mot de passe:',
        error
      );
      throw error;
    }
  }

  // Récupérer un auteur par son ID
  async getAuthorById(authorId) {
    try {
      const response = await this.api.get(`/authors/${authorId}`);
      return response;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération de l'auteur:", error);
      throw error;
    }
  }

  // Créer un nouvel auteur
  async createAuthorWithUser(authorData, userData) {
    try {
      const response = await this.api.post('/authors', {
        ...authorData,
        user: userData,
      });
      return response;
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'auteur:", error);
      throw error;
    }
  }

  // Mettre à jour un auteur
  async updateAuthor(authorId, authorData, userData = {}) {
    try {
      const response = await this.api.put(`/authors/${authorId}`, {
        ...authorData,
        user: userData,
      });
      return response;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'auteur:", error);
      throw error;
    }
  }

  // Supprimer un auteur
  async deleteAuthor(authorId) {
    try {
      const response = await this.api.delete(`/authors/${authorId}`);
      return response;
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'auteur:", error);
      throw error;
    }
  }

  // Récupérer les livres d'un auteur
  async getAuthorBooks(authorId) {
    try {
      const response = await this.api.get(`/authors/${authorId}/books`);
      return response;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des livres de l'auteur:",
        error
      );
      throw error;
    }
  }

  // Méthodes de nettoyage et validation (identiques à la version précédente)
  cleanAuthorData(data) {
    console.log('🔍 cleanAuthorData - Entrée:', JSON.stringify(data, null, 2));
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
        // Ajouter également birth_date pour compatibilité avec le backend
        cleaned.birth_date = cleaned.birthDate;
      } else {
        delete cleaned.birthDate;
        delete cleaned.birth_date;
      }
    }

    // Ajouter les versions snake_case pour compatibilité avec le backend
    if (cleaned.firstName) {
      cleaned.first_name = cleaned.firstName;
    }

    if (cleaned.lastName) {
      cleaned.last_name = cleaned.lastName;
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

    console.log(
      '🔍 cleanAuthorData - Sortie:',
      JSON.stringify(cleaned, null, 2)
    );
    return cleaned;
  }

  cleanUserData(data) {
    console.log('🔍 cleanUserData - Entrée:', JSON.stringify(data, null, 2));
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

    console.log('🔍 cleanUserData - Sortie:', JSON.stringify(cleaned, null, 2));
    return cleaned;
  }

  validateAuthorData(data) {
    console.log(
      '🔍 validateAuthorData - Données à valider:',
      JSON.stringify(data, null, 2)
    );
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
      console.log('🔍 validateAuthorData - Erreurs détectées:', errors);
      const validationError = new Error("Données de l'auteur invalides");
      validationError.details = errors;
      throw validationError;
    }

    console.log('🔍 validateAuthorData - Validation réussie');
  }

  validateUserData(data) {
    console.log(
      '🔍 validateUserData - Données à valider:',
      JSON.stringify(data, null, 2)
    );
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
      console.log('🔍 validateUserData - Erreurs détectées:', errors);
      const validationError = new Error('Données utilisateur invalides');
      validationError.details = errors;
      throw validationError;
    }

    console.log('🔍 validateUserData - Validation réussie');
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
      console.log('🔍 Tentative de connexion avec:', {
        username: credentials.username || credentials.email,
        hasPassword: !!credentials.password,
      });

      // Appel à l'API pour la connexion
      const response = await this.api.post('/auth/login', credentials);
      console.log('✅ Réponse de connexion reçue:', response.data);

      // Vérifier que le token est au format JWT valide (contient 2 points)
      if (response.data.token) {
        const token = response.data.token;

        // Vérifier le format du token JWT
        if (token.split('.').length !== 3) {
          console.error('❌ Format de token invalide:', token);
          console.error(
            'Un token JWT valide doit contenir exactement 2 points (3 parties)'
          );
          return Promise.reject(new Error('Format de token invalide'));
        }

        console.log('✅ Token JWT valide reçu');
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token); // Pour compatibilité avec api.js
        console.log(
          '✅ Token stocké dans localStorage sous deux clés: auth_token et token'
        );
      } else {
        console.error('❌ Pas de token reçu dans la réponse');
        return Promise.reject(new Error('Pas de token reçu dans la réponse'));
      }

      // Récupérer les informations de l'utilisateur connecté
      try {
        // Utiliser l'endpoint /auth/me au lieu de /users/current
        const userResponse = await this.api.get('/auth/me');
        console.log(
          '✅ Informations utilisateur récupérées:',
          userResponse.data
        );

        // Stocker les informations utilisateur dans localStorage avec les deux clés possibles
        localStorage.setItem('user_info', JSON.stringify(userResponse.data));
        localStorage.setItem('user', JSON.stringify(userResponse.data)); // Pour compatibilité avec api.js

        // Mettre à jour le store Vuex si disponible
        if (window.store) {
          window.store.commit('auth/loginSuccess', {
            token: response.data.token,
            user: userResponse.data,
          });
        }

        // Retourner les données complètes
        return {
          data: {
            token: response.data.token,
            user: userResponse.data,
          },
        };
      } catch (userError) {
        console.error(
          '❌ Erreur lors de la récupération des informations utilisateur:',
          userError
        );
        // Essayer un autre endpoint si le premier échoue
        try {
          const alternativeUserResponse = await this.api.get('/users/me');
          console.log(
            '✅ Informations utilisateur récupérées (alternative):',
            alternativeUserResponse.data
          );

          localStorage.setItem(
            'user_info',
            JSON.stringify(alternativeUserResponse.data)
          );
          localStorage.setItem(
            'user',
            JSON.stringify(alternativeUserResponse.data)
          );

          return {
            data: {
              token: response.data.token,
              user: alternativeUserResponse.data,
            },
          };
        } catch (alternativeError) {
          console.error(
            '❌ Échec de la récupération des informations utilisateur (alternative):',
            alternativeError
          );
          return {
            data: {
              token: response.data.token,
            },
          };
        }
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  }

  // Méthode de déconnexion
  logout() {
    AuthInterceptor.logout();
  }

  /**
   * Supprime plusieurs auteurs en une seule opération
   * @param {Array<number>} authorIds - Tableau des IDs des auteurs à supprimer
   * @returns {Promise<Object>} - Promesse contenant le résultat de l'opération
   */
  async bulkDeleteAuthors(authorIds) {
    try {
      // Vérifier l'authentification
      const token =
        localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error(
          "Vous n'êtes pas authentifié. Veuillez vous connecter."
        );
      }

      console.log(
        `🗑️ Tentative de suppression en masse des auteurs:`,
        authorIds
      );
      // Vérifier si les auteurs ont des livres associés
      const authorsWithBooks = [];
      for (const authorId of authorIds) {
        try {
          const authorDetails = await this.getAuthorById(authorId);
          if (authorDetails.books && authorDetails.books.length > 0) {
            authorsWithBooks.push(authorId);
          }
          console.log(
            `📚 Vérification des associations pour l'auteur ${authorId}:`,
            authorDetails
          );
        } catch (detailsError) {
          console.warn(
            `⚠️ Impossible de vérifier les détails de l'auteur ${authorId}: ${detailsError.message}`
          );
        }
      }

      // Envoyer la requête avec le token explicite
      const response = await fetch(
        `${this.api.defaults.baseURL}/authors/bulk-delete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: authorIds }),
        }
      );

      // Vérifier le statut de la réponse
      console.log(
        '📊 Statut de la réponse de suppression en masse:',
        response.status
      );

      // Si la réponse est un succès
      if (response.ok) {
        const responseText = await response.text();
        let responseData = {};

        try {
          responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          responseData = { message: responseText || 'Suppression réussie' };
        }

        console.log(`✅ ${authorIds.length} auteurs supprimés avec succès`);
        return responseData;
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur lors de la suppression en masse:', errorText);

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        // Vérifier si l'erreur est liée à une contrainte de clé étrangère
        if (
          response.status === 400 ||
          response.status === 403 ||
          errorText.includes('basket_id') ||
          errorText.includes('SQLSyntaxErrorException') ||
          errorText.includes('constraint')
        ) {
          console.error('❌ Erreur de contrainte de base de données détectée');

          // Message d'erreur plus convivial pour l'utilisateur
          const userFriendlyMessage =
            "Impossible de supprimer certains auteurs car ils possèdent des livres ou d'autres éléments associés. " +
            "Veuillez d'abord supprimer ces éléments ou contacter l'administrateur système.";

          const enhancedError = new Error(userFriendlyMessage);
          enhancedError.originalError =
            errorData.message ||
            `Erreur ${response.status}: ${response.statusText}`;
          enhancedError.technicalDetails =
            'Erreur SQL: Problème de relation dans la base de données';
          throw enhancedError;
        }

        throw new Error(
          errorData.message ||
            `Erreur ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error(
        '❌ Erreur lors de la suppression en masse des auteurs:',
        error
      );
      console.error("Message d'erreur:", error.message);

      // Afficher un message d'erreur convivial à l'utilisateur
      if (error.originalError) {
        alert(error.message);
        console.error('Détails techniques:', error.technicalDetails);
        console.error('Erreur originale:', error.originalError);
      } else {
        alert(`Erreur lors de la suppression en masse: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Vérifie si un auteur a des livres ou d'autres éléments associés
   * @param {number} authorId - ID de l'auteur à vérifier
   * @returns {Promise<boolean>} - Promesse indiquant si l'auteur a des associations
   */
  async checkAuthorAssociations(authorId) {
    try {
      console.log(`🔍 Vérification des associations pour l'auteur ${authorId}`);

      // Récupérer le token
      const token =
        localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error(
          "Vous n'êtes pas authentifié. Veuillez vous connecter."
        );
      }

      // Faire une requête pour vérifier les livres associés
      const response = await fetch(
        `${this.api.defaults.baseURL}/authors/${authorId}/books`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Si la requête échoue, considérer qu'il n'y a pas d'associations
      if (!response.ok) {
        console.warn(
          `⚠️ Impossible de vérifier les livres de l'auteur ${authorId}: ${response.status}`
        );
        return false;
      }

      // Analyser la réponse
      const responseText = await response.text();
      let books = [];

      try {
        const data = responseText ? JSON.parse(responseText) : {};
        books = data.content || [];
      } catch (e) {
        console.error('❌ Erreur lors du parsing de la réponse:', e);
      }

      const hasBooks = books.length > 0;
      console.log(
        `📚 L'auteur ${authorId} a ${books.length} livres associés:`,
        hasBooks
      );

      return hasBooks;
    } catch (error) {
      console.error(
        `❌ Erreur lors de la vérification des associations pour l'auteur ${authorId}:`,
        error
      );
      // En cas d'erreur, supposer qu'il n'y a pas d'associations pour éviter de bloquer la suppression
      return false;
    }
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
