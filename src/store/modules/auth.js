// store/modules/auth.js
// Module Vuex pour la gestion de l'authentification

import AuthService from '@/services/AuthService';

const state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,
};

const getters = {
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated: (state) => !!state.token,

  /**
   * Récupère l'utilisateur actuel
   */
  currentUser: (state) => state.user,

  /**
   * Vérifie si la demande d'authentification est en cours
   */
  isLoading: (state) => state.loading,

  /**
   * Récupère l'erreur d'authentification
   */
  authError: (state) => state.error,
};

const mutations = {
  /**
   * Démarre le processus d'authentification
   */
  AUTH_REQUEST(state) {
    state.loading = true;
    state.error = null;
  },

  /**
   * Authentification réussie
   */
  AUTH_SUCCESS(state, { token, user }) {
    state.token = token;
    state.user = user;
    state.loading = false;
    state.error = null;
  },

  /**
   * Échec d'authentification
   */
  AUTH_ERROR(state, error) {
    state.loading = false;
    state.error = error;
  },

  /**
   * Déconnexion
   */
  AUTH_LOGOUT(state) {
    state.token = null;
    state.user = null;
  },

  /**
   * Met à jour les informations de l'utilisateur
   */
  UPDATE_USER(state, user) {
    state.user = { ...state.user, ...user };
  },
};

const actions = {
  /**
   * Connexion utilisateur
   */
  async login({ commit }, credentials) {
    commit('AUTH_REQUEST');

    try {
      // Assurer la compatibilité avec le backend qui attend peut-être username au lieu de email
      const loginCredentials = {
        username: credentials.email, // Utiliser email comme username
        password: credentials.password,
        ...credentials, // Garder les autres propriétés comme rememberMe
      };

      const response = await AuthService.login(loginCredentials);
      const { token, user } = response.data;

      // Stockage dans localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Configuration de l'en-tête d'autorisation pour les futures requêtes API
      AuthService.setAuthHeader(token);

      commit('AUTH_SUCCESS', { token, user });
      return user;
    } catch (error) {
      commit(
        'AUTH_ERROR',
        error.response?.data?.message || 'Erreur de connexion'
      );
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Inscription utilisateur
   */
  async register({ commit }, user) {
    commit('AUTH_REQUEST');

    try {
      const response = await AuthService.register(user);
      const { token, user: newUser } = response.data;

      // Stockage dans localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));

      // Configuration de l'en-tête d'autorisation pour les futures requêtes API
      AuthService.setAuthHeader(token);

      commit('AUTH_SUCCESS', { token, user: newUser });
      return newUser;
    } catch (error) {
      commit(
        'AUTH_ERROR',
        error.response?.data?.message || "Erreur d'inscription"
      );
      throw error;
    }
  },

  /**
   * Déconnexion utilisateur
   */
  logout({ commit }) {
    // Suppression des données d'authentification du localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Suppression de l'en-tête d'autorisation
    AuthService.removeAuthHeader();

    commit('AUTH_LOGOUT');
  },

  /**
   * Met à jour les informations de l'utilisateur
   */
  updateUserInfo({ commit }, user) {
    // Mise à jour du localStorage
    localStorage.setItem('user', JSON.stringify({ ...state.user, ...user }));

    commit('UPDATE_USER', user);
  },

  /**
   * Récupère l'utilisateur actuel depuis le serveur
   */
  async fetchCurrentUser({ commit }) {
    try {
      const response = await AuthService.getCurrentUser();
      const user = response.data;

      // Mise à jour du localStorage
      localStorage.setItem('user', JSON.stringify(user));

      commit('UPDATE_USER', user);
      return user;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations utilisateur:',
        error
      );
      throw error;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
