// store/modules/auth.js
import AuthService from '@/services/AuthService';

export default {
  namespaced: true,

  state: {
    token: localStorage.getItem('token') || null,
    user: AuthService.getUserFromLocalStorage() || null,
    isAuthChecked: false, // Indicateur si l'auth a été vérifiée
  },

  getters: {
    // L'utilisateur est-il authentifié?
    isAuthenticated: (state) => !!state.token,

    // Obtenir l'utilisateur courant
    currentUser: (state) => state.user,

    // Obtenir le jeton d'authentification
    token: (state) => state.token,

    // Vérifier si l'utilisateur a un rôle spécifique
    hasRole: (state) => (role) => {
      if (!state.user || !state.user.role) return false;

      // Normalisation du rôle (supprimer ROLE_ si présent et mettre en majuscules)
      let userRole = state.user.role.toUpperCase();
      if (userRole.startsWith('ROLE_')) {
        userRole = userRole.substring(5);
      }

      const normalizedRole = role.toUpperCase().replace('ROLE_', '');
      return userRole === normalizedRole;
    },

    // Vérifier si l'utilisateur est admin
    isAdmin: (state, getters) => getters.hasRole('ADMIN'),

    // Vérifier si l'utilisateur est auteur
    isAuthor: (state, getters) => getters.hasRole('AUTHOR'),

    // Vérifier si l'utilisateur est éditeur
    isEditor: (state, getters) => getters.hasRole('EDITOR'),

    // Vérifier si l'authentification a été vérifiée
    isAuthChecked: (state) => state.isAuthChecked,

    // Obtenir le rôle de l'utilisateur (pour les composants)
    userRole: (state) => (state.user ? state.user.role : null),
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
    },

    SET_USER(state, user) {
      state.user = user;
    },

    SET_AUTH_CHECKED(state, status) {
      state.isAuthChecked = status;
    },

    LOGOUT(state) {
      state.token = null;
      state.user = null;
    },
  },

  actions: {
    // Connexion utilisateur
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await AuthService.login(credentials);

        commit('SET_TOKEN', response.data.token);
        commit('SET_USER', response.data.user);
        commit('SET_AUTH_CHECKED', true);

        return response;
      } catch (error) {
        dispatch(
          'notifyError',
          'Échec de la connexion: ' +
            (error.response?.data?.message || error.message),
          { root: true }
        );
        throw error;
      }
    },

    // Déconnexion utilisateur
    logout({ commit }) {
      AuthService.logout();
      commit('LOGOUT');
    },

    // Vérifier l'état d'authentification actuel
    async checkAuth({ commit, state }) {
      try {
        console.log("Vérification de l'authentification...");

        // Vérifier d'abord si un utilisateur existe déjà dans le state
        if (state.user) {
          console.log(
            'Utilisateur déjà dans le state, authentification valide'
          );
          commit('SET_AUTH_CHECKED', true);
          return true;
        }

        // Vérifier le token et initialiser l'authentification
        const isAuth = await AuthService.initAuth();
        console.log('Résultat initAuth:', isAuth);

        if (!isAuth) {
          console.log(
            'Pas de token ou token invalide, utilisateur non authentifié'
          );
          commit('LOGOUT');
          commit('SET_AUTH_CHECKED', true);
          return false;
        }

        try {
          // Récupérer l'utilisateur courant depuis l'API
          console.log('Récupération des informations utilisateur...');
          const response = await AuthService.getCurrentUser();

          if (response && response.data) {
            console.log(
              'Informations utilisateur récupérées avec succès:',
              response.data
            );
            commit('SET_USER', response.data);
            commit('SET_AUTH_CHECKED', true);

            // Mettre à jour le localStorage avec les dernières données utilisateur
            localStorage.setItem('user', JSON.stringify(response.data));

            return true;
          } else {
            console.log('API a renvoyé une réponse vide');
            commit('LOGOUT');
            commit('SET_AUTH_CHECKED', true);
            return false;
          }
        } catch (userError) {
          console.error(
            "Erreur lors de la récupération de l'utilisateur:",
            userError
          );

          if (userError.response && userError.response.status === 401) {
            // Si erreur 401, le token est probablement expiré
            AuthService.logout();
          }

          commit('LOGOUT');
          commit('SET_AUTH_CHECKED', true);
          return false;
        }
      } catch (error) {
        console.error(
          "Erreur lors de la vérification de l'authentification:",
          error
        );

        // En cas d'erreur, considérer l'utilisateur comme non authentifié
        commit('LOGOUT');
        commit('SET_AUTH_CHECKED', true);
        return false;
      }
    },
  },
};
