import api from './api';

class OrderService {
  /**
   * Récupère toutes les commandes avec pagination et filtres
   * @param {Object} params - Paramètres de la requête
   * @param {number} params.page - Numéro de la page (commence à 0)
   * @param {number} params.size - Nombre d'éléments par page
   * @param {string} params.sort - Champ et direction de tri (ex: "date,desc")
   * @param {string} params.search - Terme de recherche
   * @param {string} params.status - Statut de la commande
   * @param {string} params.startDate - Date de début (format YYYY-MM-DD)
   * @param {string} params.endDate - Date de fin (format YYYY-MM-DD)
   * @returns {Promise} - Promesse contenant les données des commandes
   */
  getOrders(params = {}) {
    // Valeurs par défaut
    const defaultParams = {
      page: 0,
      size: 10,
    };

    // Fusionner les paramètres par défaut avec ceux fournis
    const queryParams = { ...defaultParams, ...params };

    return api.get('/orders', {
      params: queryParams,
    });
  }

  /**
   * Crée une nouvelle commande
   * @param {Object} orderData - Données de la commande
   * @returns {Promise} - Promesse contenant les données de la commande créée
   */
  createOrder(orderData) {
    return api.post('/orders', orderData);
  }

  /**
   * Récupère les commandes de l'utilisateur connecté
   * @param {number} page - Numéro de page (commence à 1)
   * @param {number} size - Nombre d'éléments par page
   * @returns {Promise} - Promesse contenant les commandes de l'utilisateur
   */
  getUserOrders(userId) {
    return api.get(`/orders/user/${userId}?page=0&size=10`);
  }

  /**
   * Récupère une commande spécifique
   * @param {number} orderId - ID de la commande
   * @returns {Promise} - Promesse contenant les détails de la commande
   */
  getOrderById(orderId) {
    return api.get(`/orders/${orderId}`);
  }

  /**
   * Annule une commande
   * @param {number} orderId - ID de la commande
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  cancelOrder(orderId) {
    return api.put(`/orders/${orderId}/cancel`);
  }

  /**
   * Valide un code promo
   * @param {string} code - Code promo à valider
   * @returns {Promise} - Promesse contenant les informations du code promo
   */
  validatePromoCode(code) {
    return api.post('/promo-codes/validate', { code });
  }

  /**
   * Passe une nouvelle commande avec les mêmes articles qu'une commande précédente
   * @param {number} orderId - ID de la commande à réutiliser
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  reorder(orderId) {
    return api.post(`/orders/${orderId}/reorder`);
  }

  /**
   * Suit l'état d'une commande
   * @param {string} orderNumber - Numéro de la commande
   * @returns {Promise} - Promesse contenant les informations de suivi
   */
  trackOrder(orderNumber) {
    return api.get(`/orders/track/${orderNumber}`);
  }

  /**
   * Récupère les statistiques des commandes pour l'administration
   * @returns {Promise} - Promesse contenant les statistiques
   */
  getOrderStats() {
    return api.get('/admin/orders/stats');
  }

  /**
   * Met à jour le statut d'une commande (pour l'administration)
   * @param {number} orderId - ID de la commande
   * @param {string} status - Nouveau statut
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  updateOrderStatus(orderId, status) {
    return api.put(`/admin/orders/${orderId}/status`, { status });
  }

  /**
   * Récupère les statistiques des commandes pour un utilisateur spécifique
   * @param {number} userId - ID de l'utilisateur
   * @returns {Promise} - Promesse contenant les statistiques de l'utilisateur
   */
  getUserStats(userId) {
    return api.get(`/orders/user/${userId}/stats`);
  }
}

export default new OrderService();
