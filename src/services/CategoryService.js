// src/services/CategoryService.js
import api from './api';

// Mode de développement sans backend
const DEV_MODE = true; // Mettre à true pour utiliser des données fictives

class CategoryService {
  /**
   * Récupère toutes les catégories
   * @returns {Promise} - Promesse contenant les catégories
   */
  getCategories() {
    // En mode développement, retourner des données fictives
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockCategories = [
            {
              id: 1,
              name: 'Roman',
              description: 'Romans littéraires et contemporains',
              icon: 'fas fa-book',
              booksCount: 45,
              activeBooks: 42,
            },
            {
              id: 2,
              name: 'Science Fiction',
              description: 'Univers futuristes et dystopiques',
              icon: 'fas fa-rocket',
              booksCount: 28,
              activeBooks: 26,
            },
            {
              id: 3,
              name: 'Policier',
              description: 'Enquêtes et mystères',
              icon: 'fas fa-search',
              booksCount: 32,
              activeBooks: 30,
            },
            {
              id: 4,
              name: 'Fantasy',
              description: 'Mondes imaginaires et magie',
              icon: 'fas fa-dragon',
              booksCount: 24,
              activeBooks: 22,
            },
            {
              id: 5,
              name: 'Biographie',
              description: 'Histoires de vie et témoignages',
              icon: 'fas fa-user',
              booksCount: 18,
              activeBooks: 16,
            },
          ];

          resolve({ data: mockCategories });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.get(`/categories`);
  }

  // Reste du code inchangé...
  getCategoryById(id) {
    // Code existant...
    if (DEV_MODE) {
      // Code existant...
    }
    return api.get(`/categories/${id}`);
  }

  addCategory(categoryData) {
    // Code existant...
    if (DEV_MODE) {
      // Code existant...
    }
    return api.post(`/categories`, categoryData);
  }

  updateCategory(id, categoryData) {
    // Code existant...
    if (DEV_MODE) {
      // Code existant...
    }
    return api.put(`/categories/${id}`, categoryData);
  }

  deleteCategory(id) {
    // Code existant...
    if (DEV_MODE) {
      // Code existant...
    }
    return api.delete(`/categories/${id}`);
  }
}

export default new CategoryService();
