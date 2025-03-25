import { createStore } from 'vuex';
import auth from './modules/auth';
import basket from './modules/basket';
import dashboard from './modules/dashboard';
import orders from './modules/orders';

export default createStore({
  state: {
    // État global de l'application
    appLoading: false,
    appError: null,
    notifications: [],
  },

  getters: {
    // Récupère les notifications actives
    activeNotifications: (state) => {
      return state.notifications.filter((n) => !n.dismissed);
    },
  },

  mutations: {
    // Active l'état de chargement global
    SET_LOADING(state, isLoading) {
      state.appLoading = isLoading;
    },

    // Définit une erreur globale
    SET_ERROR(state, error) {
      state.appError = error;
    },

    // Ajoute une notification
    ADD_NOTIFICATION(state, notification) {
      // Génère un ID unique pour la notification
      const id = Date.now();
      state.notifications.push({
        id,
        ...notification,
        dismissed: false,
      });

      // Si la notification a une durée, la supprimer après cette durée
      if (notification.duration) {
        setTimeout(() => {
          const index = state.notifications.findIndex((n) => n.id === id);
          if (index !== -1) {
            state.notifications[index].dismissed = true;
          }
        }, notification.duration);
      }
    },

    // Supprime une notification
    DISMISS_NOTIFICATION(state, id) {
      const index = state.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        state.notifications[index].dismissed = true;
      }
    },

    // Supprime toutes les notifications
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = state.notifications.map((n) => ({
        ...n,
        dismissed: true,
      }));
    },
  },

  actions: {
    // Affiche une notification
    notify({ commit }, notification) {
      // Type par défaut: 'info'
      const type = notification.type || 'info';

      // Durée par défaut selon le type
      const defaultDurations = {
        success: 3000,
        info: 5000,
        warning: 5000,
        error: 8000,
      };

      // Si aucune durée n'est spécifiée, utiliser la durée par défaut selon le type
      const duration =
        notification.duration !== undefined
          ? notification.duration
          : defaultDurations[type];

      commit('ADD_NOTIFICATION', {
        ...notification,
        type,
        duration,
      });
    },

    // Affiche une notification de succès
    notifySuccess({ dispatch }, message) {
      dispatch('notify', {
        type: 'success',
        message,
      });
    },

    // Affiche une notification d'information
    notifyInfo({ dispatch }, message) {
      dispatch('notify', {
        type: 'info',
        message,
      });
    },

    // Affiche une notification d'avertissement
    notifyWarning({ dispatch }, message) {
      dispatch('notify', {
        type: 'warning',
        message,
      });
    },

    // Affiche une notification d'erreur
    notifyError({ dispatch }, message) {
      dispatch('notify', {
        type: 'error',
        message,
      });
    },

    // Supprime une notification
    dismissNotification({ commit }, id) {
      commit('DISMISS_NOTIFICATION', id);
    },

    // Supprime toutes les notifications
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS');
    },

    // Initialisation globale de l'application
    init({ dispatch, state }) {
      // Vérifier l'authentification au démarrage
      dispatch('auth/checkAuth');

      // Initialiser le panier
      dispatch('basket/initializeBasket');

      // Si l'utilisateur est authentifié, charger son panier sauvegardé
      if (state.auth.token) {
        dispatch('basket/loadSavedBasket');
      }
    },
  },

  modules: {
    auth,
    basket,
    dashboard,
    orders,
  },
});
