import api from './api';

/**
 * Service pour gérer les paramètres de l'application
 */
class SettingsService {
  /**
   * Récupère tous les paramètres
   * @returns {Promise} Promesse contenant les paramètres
   */
  async getSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw error;
    }
  }

  /**
   * Met à jour les paramètres généraux
   * @param {Object} generalSettings - Paramètres généraux à mettre à jour
   * @returns {Promise} Promesse contenant les paramètres mis à jour
   */
  async updateGeneralSettings(generalSettings) {
    try {
      const response = await api.put('/settings/general', generalSettings);
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour des paramètres généraux:',
        error
      );
      throw error;
    }
  }

  /**
   * Met à jour les paramètres d'expédition
   * @param {Object} shippingSettings - Paramètres d'expédition à mettre à jour
   * @returns {Promise} Promesse contenant les paramètres mis à jour
   */
  async updateShippingSettings(shippingSettings) {
    try {
      const response = await api.put('/settings/shipping', shippingSettings);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des paramètres d'expédition:",
        error
      );
      throw error;
    }
  }

  /**
   * Met à jour les paramètres d'email
   * @param {Object} emailSettings - Paramètres d'email à mettre à jour
   * @returns {Promise} Promesse contenant les paramètres mis à jour
   */
  async updateEmailSettings(emailSettings) {
    try {
      const response = await api.put('/settings/email', emailSettings);
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour des paramètres d'email:",
        error
      );
      throw error;
    }
  }
}

export default new SettingsService();
