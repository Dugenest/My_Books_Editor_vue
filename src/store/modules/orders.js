import OrderService from '@/services/OrderService';

export default {
  namespaced: true,

  state: {
    orders: [],
    loading: false,
    error: null,
  },

  mutations: {
    SET_ORDERS(state, orders) {
      state.orders = orders;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
  },

  actions: {
    async getOrders({ commit }) {
      commit('SET_LOADING', true);
      try {
        const userId = localStorage.getItem('userId');
        const response = await OrderService.getUserOrders(userId);
        commit('SET_ORDERS', response.data);
        return response.data;
      } catch (error) {
        commit('SET_ERROR', error.message);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
  },
};
