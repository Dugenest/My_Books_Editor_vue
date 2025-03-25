import ActivityService from '@/services/ActivityService';
import OrderService from '@/services/OrderService';

export default {
  namespaced: true,

  state: {
    stats: {
      totalOrders: 0,
      wishlistItems: 0,
      totalBooks: 0,
      totalSpent: 0,
    },
    recentActivities: [],
  },

  mutations: {
    SET_STATS(state, stats) {
      state.stats = stats;
    },
    SET_RECENT_ACTIVITIES(state, activities) {
      state.recentActivities = activities;
    },
  },

  actions: {
    async getStats({ commit }) {
      try {
        const userId = localStorage.getItem('userId');
        const response = await OrderService.getUserStats(userId);
        commit('SET_STATS', response.data);
        return response.data;
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des statistiques:',
          error
        );
        throw error;
      }
    },

    async getRecentActivities({ commit }) {
      try {
        const response = await ActivityService.getRecentActivity();
        commit('SET_RECENT_ACTIVITIES', response.data);
        return response.data;
      } catch (error) {
        console.error(
          'Erreur lors de la récupération des activités récentes:',
          error
        );
        throw error;
      }
    },
  },
};
