import api from './api';

class CategoryService {
  /**
   * Récupère toutes les catégories
   * @returns {Promise} - Promesse contenant les catégories
   */
  async getCategories() {
    try {
      console.log('Tentative de récupération des catégories...');
      const response = await api.get('/categories');

      // Log de débogage détaillé
      console.log('Réponse brute du serveur:', response);
      console.log('Structure des données:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        hasPagination: response.data && response.data.content !== undefined,
      });

      // Retourner la réponse complète pour uniformité avec les autres services
      return response;
    } catch (error) {
      console.error(
        'Erreur détaillée lors de la récupération des catégories:',
        {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        }
      );

      if (error.response?.status === 500) {
        console.error('Erreur serveur 500 - Vérifiez les logs du backend');
      }

      throw error;
    }
  }

  /**
   * Récupère une catégorie par son ID
   * @param {number} id - ID de la catégorie
   * @returns {Promise} - Promesse contenant la catégorie
   */
  getCategoryById(id) {
    return api.get(`/categories/${id}`);
  }

  /**
   * Ajoute une nouvelle catégorie
   * @param {object} categoryData - Données de la catégorie
   * @returns {Promise} - Promesse contenant la catégorie créée
   */
  addCategory(categoryData) {
    // Format attendu par l'API
    const formattedData = {
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || 'fas fa-book',
      color: categoryData.color || 'blue', // Utiliser un nom de couleur en anglais
    };

    // Pour déboguer
    console.log('Données formatées envoyées :', formattedData);

    return api.post('/categories', formattedData);
  }

  /**
   * Met à jour une catégorie existante
   * @param {number} id - ID de la catégorie à mettre à jour
   * @param {object} categoryData - Données de la catégorie
   * @returns {Promise} - Promesse contenant la catégorie mise à jour
   */
  updateCategory(id, categoryData) {
    // Format attendu par l'API
    const formattedData = {
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || 'fas fa-book',
      color: categoryData.color || 'blue',
    };

    // Pour déboguer
    console.log('Données de mise à jour envoyées :', formattedData);

    return api.put(`/categories/${id}`, formattedData);
  }

  /**
   * Supprime une catégorie
   * @param {number} id - ID de la catégorie à supprimer
   * @returns {Promise} - Promesse contenant la réponse de suppression
   */
  deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  }
}

export default new CategoryService();
