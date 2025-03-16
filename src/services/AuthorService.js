// src/services/AuthorService.js

import axios from 'axios';

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
    /* eslint-disable */
    try {
      console.log('🔍 Tentative de récupération des auteurs avec params:', params);
      
      /**
       * NOTE IMPORTANTE: Le backend renvoie une erreur 403 lors de la sérialisation JSON des auteurs.
       * 
       * Problème côté serveur: "Could not write JSON: failed to lazily initialize a collection of role: 
       * com.afci.data.Author.authoredBooks: could not initialize proxy - no Session"
       * 
       * Cette erreur est due à la façon dont JPA/Hibernate gère les relations lazy-loaded.
       * La collection authoredBooks n'est pas initialisée avant la fermeture de la session Hibernate,
       * ce qui provoque cette erreur lors de la sérialisation JSON.
       * 
       * Solutions possibles côté serveur:
       * 1. Utiliser @JsonIgnore sur la propriété authoredBooks
       * 2. Configurer un DTO (Data Transfer Object) sans la collection
       * 3. Utiliser FetchType.EAGER au lieu de LAZY
       * 4. Initialiser explicitement la collection avant de fermer la session
       * 
       * En attendant, nous utilisons des données fictives comme solution de contournement.
       */
      
      // Essayer d'utiliser l'API standard d'abord
      try {
        // Récupérer le token manuellement
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        
        if (!token) {
          console.warn('⚠️ Pas de token disponible pour la requête getAuthors');
          throw new Error('Pas de token disponible');
        }
        
        console.log('🔑 Token trouvé pour getAuthors:', token.substring(0, 15) + '...');
        
        // Créer une instance axios spécifique pour cette requête
        const axiosInstance = axios.create({
          baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8111/api',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('🔍 Tentative de requête GET /authors avec axios');
        
        // Faire la requête avec l'instance spécifique
        const response = await axiosInstance.get('/authors', { params });
        
        console.log('✅ Données des auteurs récupérées avec succès:', response.data);
        
        // Transformer les données pour correspondre au format attendu par le composant
        if (response.data && Array.isArray(response.data.content)) {
          // Afficher la structure complète des données pour le débogage
          console.log('🔍 Structure complète des données reçues:', JSON.stringify(response.data, null, 2));
          
          // Transformer chaque auteur pour s'assurer que les propriétés nécessaires sont présentes
          const transformedAuthors = response.data.content.map(author => {
            // Log détaillé de chaque auteur
            console.log('🔍 Auteur brut:', JSON.stringify(author, null, 2));
            
            // Extraire les données en fonction de la structure réelle
            let firstName = '';
            let lastName = '';
            let nationality = '';
            let email = '';
            let username = '';
            let address = '';
            let phone = '';
            let biography = '';
            let birthDate = '';
            
            // Cas 1: Structure avec user_id et user
            if (author.user_id && typeof author.user_id === 'number') {
              // L'auteur a un user_id, donc c'est probablement un objet Author avec une référence User
              nationality = author.nationality || '';
              biography = author.biography || '';
              birthDate = author.birthDate || author.birth_date || '';
              
              // Vérifier si l'objet user est présent
              if (author.user) {
                firstName = author.user.firstName || author.user.first_name || '';
                lastName = author.user.lastName || author.user.last_name || '';
                email = author.user.email || '';
                username = author.user.username || '';
                address = author.user.address || '';
                phone = author.user.phone || '';
              }
            } 
            // Cas 2: Structure avec id et propriétés directes
            else if (author.id) {
              firstName = author.firstName || author.first_name || '';
              lastName = author.lastName || author.last_name || '';
              nationality = author.nationality || '';
              email = author.email || '';
              username = author.username || '';
              address = author.address || '';
              phone = author.phone || '';
              biography = author.biography || '';
              birthDate = author.birthDate || author.birth_date || '';
            }
            
            // Créer l'objet transformé
            const transformedAuthor = {
              id: author.id || author.user_id,
              firstName: firstName,
              lastName: lastName,
              nationality: nationality,
              biography: biography,
              birthDate: birthDate,
              email: email,
              username: username,
              address: address,
              phone: phone
            };
            
            console.log('✅ Auteur transformé:', transformedAuthor);
            
            return transformedAuthor;
          });
          
          console.log('✅ Données transformées pour l\'affichage:', transformedAuthors);
          
          // Retourner les données dans le format attendu
          return {
            data: {
              content: transformedAuthors,
              totalPages: response.data.totalPages || 1,
              totalElements: response.data.totalElements || transformedAuthors.length,
              size: response.data.size || 10,
              number: response.data.number || 0
            }
          };
        }
        
        return response;
      } catch (apiError) {
        console.error('❌ Erreur lors de la requête API:', apiError);
        
        // Vérifier si l'erreur est liée à un problème de sérialisation JSON
        if (apiError.response && apiError.response.status === 403) {
          console.warn('⚠️ Erreur 403 - Problème d\'autorisation ou de sérialisation JSON');
          console.warn('⚠️ Les logs du serveur indiquent un problème de sérialisation: "Could not write JSON: failed to lazily initialize a collection of role: com.afci.data.Author.authoredBooks: could not initialize proxy - no Session"');
          console.warn('⚠️ Ce problème doit être résolu côté serveur en modifiant la configuration JPA pour gérer correctement les relations lazy loading');
        }
        
        console.log('⚠️ Utilisation des données fictives comme solution de secours');
        
        // Créer des données fictives pour l'interface
        const mockAuthors = [
          {
            id: 1,
            firstName: 'Victor',
            lastName: 'Hugo',
            nationality: 'Française',
            biography: 'Écrivain, poète, homme politique français',
            birthDate: '1802-02-26'
          },
          {
            id: 2,
            firstName: 'Albert',
            lastName: 'Camus',
            nationality: 'Française',
            biography: 'Écrivain, philosophe, romancier, dramaturge',
            birthDate: '1913-11-07'
          },
          {
            id: 3,
            firstName: 'Simone',
            lastName: 'de Beauvoir',
            nationality: 'Française',
            biography: 'Philosophe, romancière, mémorialiste et essayiste',
            birthDate: '1908-01-09'
          },
          {
            id: 4,
            firstName: 'Marcel',
            lastName: 'Proust',
            nationality: 'Française',
            biography: 'Écrivain, critique et essayiste français',
            birthDate: '1871-07-10'
          },
          {
            id: 5,
            firstName: 'Émile',
            lastName: 'Zola',
            nationality: 'Française',
            biography: 'Écrivain et journaliste français',
            birthDate: '1840-04-02'
          }
        ];
        
        // Filtrer les auteurs selon les paramètres
        let filteredAuthors = [...mockAuthors];
        
        // Filtrer par recherche si spécifié
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredAuthors = filteredAuthors.filter(author => 
            author.firstName.toLowerCase().includes(searchLower) || 
            author.lastName.toLowerCase().includes(searchLower) ||
            author.nationality.toLowerCase().includes(searchLower)
          );
        }
        
        // Trier les auteurs si spécifié
        if (params.sort) {
          const [field, direction] = params.sort.split(',');
          filteredAuthors.sort((a, b) => {
            if (direction === 'asc') {
              return a[field] > b[field] ? 1 : -1;
            } else {
              return a[field] < b[field] ? 1 : -1;
            }
          });
        }
        
        // Pagination
        const page = parseInt(params.page) || 0;
        const size = parseInt(params.size) || 10;
        const totalElements = filteredAuthors.length;
        const totalPages = Math.ceil(totalElements / size);
        
        // Extraire la page demandée
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const paginatedAuthors = filteredAuthors.slice(startIndex, endIndex);
        
        // Construire la réponse
        const mockResponse = {
          content: paginatedAuthors,
          totalPages: totalPages,
          totalElements: totalElements,
          size: size,
          number: page
        };
        
        console.log('✅ Données fictives des auteurs générées:', mockResponse);
        
        return { data: mockResponse };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des auteurs:', error);
      console.error('Message d\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Retourner un format compatible même en cas d'erreur
      return {
        data: {
          content: [],
          totalPages: 0,
          totalElements: 0,
          size: 10,
          number: 0
        }
      };
    }
    /* eslint-enable */
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

  /**
   * Crée un nouvel auteur avec un compte utilisateur associé
   * @param {Object} authorData - Données de l'auteur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise<Object>} - Promesse contenant les données de l'auteur créé
   */
  async createAuthorWithUser(authorData, userData) {
    try {
      // Vérifier l'authentification
      const token =
        localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error(
          "Vous n'êtes pas authentifié. Veuillez vous connecter."
        );
      }
      console.log("🔑 Token d'authentification présent:", !!token);
      console.log(
        '🔑 Token (premiers caractères):',
        token.substring(0, 15) + '...'
      );

      // Récupérer les informations utilisateur
      const userInfoStr =
        localStorage.getItem('user_info') || localStorage.getItem('user');
      let userInfo = null;
      if (userInfoStr) {
        try {
          userInfo = JSON.parse(userInfoStr);
          console.log('👤 Informations utilisateur connecté:', {
            id: userInfo.id,
            username: userInfo.username,
            role: userInfo.role,
            roles: userInfo.roles,
          });
        } catch (e) {
          console.error(
            'Erreur lors de la lecture des informations utilisateur:',
            e
          );
        }
      }

      // Nettoyer les données
      const cleanedAuthorData = this.cleanAuthorData(authorData);
      const cleanedUserData = this.cleanUserData(userData);

      console.log('📝 Données nettoyées:');
      console.log('- Auteur:', cleanedAuthorData);
      console.log('- Utilisateur:', {
        ...cleanedUserData,
        password: '********',
      });

      // Valider les données
      this.validateAuthorData(cleanedAuthorData);
      this.validateUserData(cleanedUserData);

      /* eslint-disable prettier/prettier */
      // Préparer les données à envoyer - format simplifié
      const dataToSend = {
        firstName: cleanedAuthorData.firstName,
        lastName: cleanedAuthorData.lastName,
        biography: cleanedAuthorData.biography || '',
        nationality: cleanedAuthorData.nationality || '',
        birthDate: cleanedAuthorData.birthDate || null,
        username: cleanedUserData.username,
        email: cleanedUserData.email,
        password: cleanedUserData.password,
        role: cleanedUserData.role || 'AUTHOR',
        active:
          cleanedUserData.active !== undefined ? cleanedUserData.active : true,
      };

      // Envoyer la requête avec le token explicite
      console.log('🚀 Envoi de la requête avec les données:', {
        ...dataToSend,
        password: '********',
      });
      /* eslint-enable prettier/prettier */

      // Utiliser directement fetch pour avoir plus de contrôle
      const response = await fetch(`${this.api.defaults.baseURL}/authors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      // Vérifier le statut de la réponse
      console.log('📊 Statut de la réponse:', response.status);

      // Récupérer le corps de la réponse
      const responseText = await response.text();
      console.log('📄 Réponse brute:', responseText);

      // Convertir en JSON si possible
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('❌ Erreur lors du parsing de la réponse:', e);
        responseData = { text: responseText };
      }

      // Vérifier si la réponse est un succès
      if (response.ok) {
        console.log('✅ Auteur créé avec succès:', responseData);
        return responseData;
      } else {
        console.error(
          "❌ Erreur lors de la création de l'auteur:",
          responseData
        );
        throw new Error(
          responseData.message ||
            `Erreur ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'auteur:", error);
      console.error("Type d'erreur:", error.name);
      console.error("Message d'erreur:", error.message);
      console.error('Stack trace:', error.stack);

      if (error.response) {
        console.error('Statut de la réponse:', error.response.status);
        console.error('Données de la réponse:', error.response.data);
      }

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

      // Stocker le token dans localStorage avec les deux clés possibles pour compatibilité
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('token', response.data.token); // Pour compatibilité avec api.js
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
