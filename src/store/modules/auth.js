// src/store/modules/auth.js
import AuthService from '@/services/AuthService';

// État initial
const initialState = {
  status: {
    loggedIn: false,
    loading: false,
    error: null,
  },
  user: null,
  token: null,
};

// Getters
const getters = {
  isLoggedIn: (state) => state.status.loggedIn,
  isLoading: (state) => state.status.loading,
  error: (state) => state.status.error,
  currentUser: (state) => state.user,
  hasRole: (state) => (role) => {
    if (!state.user) return false;
    return (
      state.user.role === role ||
      (state.user.roles && state.user.roles.includes(role))
    );
  },
};

// Actions
const actions = {
  // Action de connexion
  async login({ commit }, credentials) {
    commit('loginRequest');

    try {
      const response = await AuthService.login(credentials);

      // Vérifier que response.data existe et contient token et user
      if (response && response.data && response.data.token) {
        const { token, user } = response.data;
        commit('loginSuccess', { token, user });
        return { success: true, user };
      } else {
        // Si les données ne sont pas dans le format attendu
        commit('loginFailure', 'Format de réponse inattendu');
        return { success: false, message: 'Format de réponse inattendu' };
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      commit(
        'loginFailure',
        error.response?.data?.error || 'Erreur de connexion'
      );
      throw error;
    }
  },

  // Action d'inscription
  async register({ commit }, user) {
    commit('registerRequest');

    try {
      const response = await AuthService.register(user);

      // Vérifier si le backend a renvoyé une structure de données attendue
      if (response && typeof response === 'object') {
        // Si un token est fourni, connecter automatiquement l'utilisateur
        if (response.token) {
          commit('loginSuccess', {
            token: response.token,
            user: response.user,
          });
          return { success: true, user: response.user };
        }
        // Si seulement un message de succès est fourni (confirmation par email nécessaire)
        else {
          commit('registerSuccess');
          return {
            success: true,
            message: response.message || 'Inscription réussie',
            requiresEmailConfirmation: true,
          };
        }
      } else {
        // Si la réponse n'est pas un objet structuré comme attendu
        console.log('Format de réponse inattendu:', response);
        commit('registerSuccess');
        return { success: true, message: 'Inscription réussie' };
      }
    } catch (error) {
      commit('registerFailure');
      console.error("Erreur d'inscription:", error);
      throw error;
    }
  },

  // Action de déconnexion
  logout({ commit }) {
    AuthService.logout();
    commit('logout');
  },

  // Action pour vérifier l'état d'authentification actuel
  checkAuth({ commit }) {
    const isAuthenticated = AuthService.isAuthenticated();
    const user = AuthService.getCurrentUser();
    const token = AuthService.getToken();

    if (isAuthenticated && user) {
      commit('loginSuccess', { token, user });
    } else {
      commit('logout');
    }
  },

  // Action de mise à jour du profil utilisateur
  async updateProfile({ commit }, updatedUser) {
    try {
      const response = await AuthService.updateProfile(updatedUser);
      const user = response.data;
      commit('updateProfileSuccess', user);
      return { success: true, user };
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      commit(
        'updateProfileFailure',
        error.response?.data?.message || 'Erreur de mise à jour'
      );
      throw error;
    }
  },

  // Action pour définir un message d'erreur
  setError({ commit }, message) {
    commit('setError', message);
  },

  // Action pour effacer un message d'erreur
  clearError({ commit }) {
    commit('clearError');
  },
};

// Mutations
const mutations = {
  // Mutations de connexion
  loginRequest(state) {
    state.status = { loggedIn: false, loading: true, error: null };
  },
  loginSuccess(state, { token, user }) {
    state.status = { loggedIn: true, loading: false, error: null };
    state.token = token;
    state.user = user;
  },
  loginFailure(state, error) {
    state.status = { loggedIn: false, loading: false, error };
    state.token = null;
    state.user = null;
  },

  // Mutations d'inscription
  registerRequest(state) {
    state.status = { ...state.status, loading: true, error: null };
  },
  registerSuccess(state) {
    state.status = { ...state.status, loading: false, error: null };
  },
  registerFailure(state, error) {
    state.status = { ...state.status, loading: false, error };
  },

  // Mutation de déconnexion
  logout(state) {
    state.status = { loggedIn: false, loading: false, error: null };
    state.token = null;
    state.user = null;
  },

  // Mutations de mise à jour du profil
  updateProfileSuccess(state, user) {
    state.user = user;
    // Mise à jour du stockage local
    localStorage.setItem('user', JSON.stringify(user));
  },
  updateProfileFailure(state, error) {
    state.status = { ...state.status, error };
  },

  // Mutations pour la gestion des erreurs
  setError(state, message) {
    state.status.error = message;
  },
  clearError(state) {
    state.status.error = null;
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
