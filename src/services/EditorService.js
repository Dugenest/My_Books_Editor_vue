import api from './api';

class EditorService {
  /**
   * Récupère tous les éditeurs
   * @param {Object} params - Paramètres de pagination
   * @returns {Promise} - Promesse contenant les éditeurs
   */
  async getEditors(params = {}) {
    try {
      console.log(
        'EditorService: Tentative de récupération des éditeurs avec params:',
        params
      );
      const response = await api.get('/editors', { params });
      console.log('EditorService: Réponse brute:', response);

      // Si la réponse est vide, retourner un tableau vide formaté
      if (!response || !response.data) {
        console.log('EditorService: Aucune donnée reçue, retour tableau vide');
        return { data: { content: [], totalElements: 0, totalPages: 1 } };
      }

      return response;
    } catch (error) {
      console.error(
        'EditorService: Erreur lors de la récupération des éditeurs:',
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
   * Récupère un éditeur par son ID
   * @param {number} id - ID de l'éditeur
   * @returns {Promise} - Promesse contenant l'éditeur
   */
  getEditorById(id) {
    return api.get(`/editors/${id}`);
  }

  /**
   * Recherche des éditeurs
   * @param {string} query - Terme de recherche
   * @returns {Promise} - Promesse contenant les résultats de recherche
   */
  searchEditors(query) {
    return api.get('/editors/search', { params: { query } });
  }

  /**
   * Ajoute un nouvel éditeur
   * @param {Object} editorData - Données de l'éditeur
   * @returns {Promise} - Promesse contenant l'éditeur créé
   */
  addEditor(editorData) {
    return api.post('/editors', editorData);
  }

  /**
   * Met à jour un éditeur existant
   * @param {number} id - ID de l'éditeur
   * @param {Object} editorData - Nouvelles données de l'éditeur
   * @returns {Promise} - Promesse contenant l'éditeur mis à jour
   */
  updateEditor(id, editorData) {
    return api.put(`/editors/${id}`, editorData);
  }

  /**
   * Supprime un éditeur
   * @param {number} id - ID de l'éditeur à supprimer
   * @returns {Promise} - Promesse de confirmation de suppression
   */
  deleteEditor(id) {
    return api.delete(`/editors/${id}`);
  }
}

export default new EditorService();
