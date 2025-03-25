import api from './api';

class UserService {
  constructor() {
    this.api = api;
  }

  /**
   * Récupère tous les utilisateurs avec pagination et filtres
   * @param {Object} params - Paramètres de la requête
   * @param {number} params.page - Numéro de la page (commence à 0)
   * @param {number} params.size - Nombre d'éléments par page
   * @param {string} params.sort - Champ et direction de tri (ex: "lastName,asc")
   * @param {string} params.search - Terme de recherche
   * @returns {Promise} - Promesse contenant les données des utilisateurs
   */
  async getUsers(params = {}) {
    try {
      console.log(
        '🔍 Tentative de récupération des utilisateurs avec params:',
        params
      );
      const response = await this.api.get('/users', { params });
      console.log(
        '✅ Données des utilisateurs récupérées avec succès:',
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        '❌ Erreur lors de la récupération des utilisateurs:',
        error
      );
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);

      // Retourner une réponse vide pour éviter de bloquer l'interface
      return { data: { content: [], totalElements: 0, totalPages: 1 } };
    }
  }

  /**
   * Récupère tous les utilisateurs
   * @returns {Promise} - Promesse contenant les données des utilisateurs
   */
  getAll() {
    return this.api.get('/users');
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur
   */
  async get(id) {
    try {
      console.log("🔍 Tentative de récupération de l'utilisateur:", id);
      const response = await this.api.get(`/users/${id}`);
      console.log(
        "✅ Données de l'utilisateur récupérées avec succès:",
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  /**
   * Crée un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur créé
   */
  async create(userData) {
    try {
      console.log("🔍 Tentative de création d'un utilisateur:", userData);
      const response = await this.api.post('/users', userData);
      console.log('✅ Utilisateur créé avec succès:', response.data);
      return response;
    } catch (error) {
      console.error("❌ Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  /**
   * Met à jour un utilisateur existant
   * @param {number} id - ID de l'utilisateur
   * @param {Object} userData - Nouvelles données de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur mis à jour
   */
  async update(id, userData) {
    try {
      console.log("🔍 Tentative de mise à jour de l'utilisateur:", id);
      console.log('🔍 Données envoyées:', userData);

      // Assurez-vous que registrationDate est préservé
      if (!userData.registrationDate && userData.createdAt) {
        userData.registrationDate = userData.createdAt;
      }

      const response = await this.api.put(`/users/${id}`, userData);
      console.log('✅ Utilisateur mis à jour avec succès:', response.data);
      return response;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  /**
   * Supprime un utilisateur
   * @param {number} id - ID de l'utilisateur à supprimer
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  async delete(id) {
    try {
      console.log("🔍 Tentative de suppression de l'utilisateur:", id);
      const response = await this.api.delete(`/users/${id}`);
      console.log('✅ Utilisateur supprimé avec succès:', response.data);
      return response;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la suppression de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {boolean} active - Nouveau statut de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur mis à jour
   */
  async updateUserStatus(id, active) {
    try {
      console.log(
        "🔍 Tentative de mise à jour du statut de l'utilisateur:",
        id
      );
      const response = await this.api.put(`/users/${id}/status`, { active });
      console.log(
        "✅ Statut de l'utilisateur mis à jour avec succès:",
        response.data
      );
      return response;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour du statut de l'utilisateur:",
        error
      );
      throw error;
    }
  }
}

export default new UserService();
