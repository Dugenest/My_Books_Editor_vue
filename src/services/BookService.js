import api from './api';
import axios from 'axios';

class BookService {
  /**
   * Récupère la liste des livres avec pagination
   * @param {Object} params - Paramètres de la requête
   * @param {number} params.page - Numéro de la page (commence à 0)
   * @param {number} params.size - Nombre d'éléments par page
   * @param {string} params.sort - Champ et direction de tri (ex: "title,asc")
   * @param {string} params.search - Terme de recherche
   * @param {string} params.categoryId - ID de la catégorie
   * @param {string} params.status - Statut du livre
   * @returns {Promise} - Promesse contenant les données des livres
   */
  getBooks(params = {}) {
    // Valeurs par défaut
    const defaultParams = {
      page: 0,
      size: 10,
    };

    // Fusionner les paramètres par défaut avec ceux fournis
    const queryParams = { ...defaultParams, ...params };

    return api.get(`/books`, {
      params: queryParams,
    });
  }

  /**
   * Récupère un livre par son ID
   * @param {number} id - ID du livre
   * @returns {Promise} - Promesse contenant les données du livre
   */
  getBookById(id) {
    return api.get(`/books/${id}`);
  }

  /**
   * Récupère les livres par catégorie
   * @param {number} categoryId - ID de la catégorie
   * @param {number} page - Numéro de la page (commence à 1)
   * @param {number} size - Nombre d'éléments par page
   * @returns {Promise} - Promesse contenant les livres de la catégorie
   */
  getBooksByCategory(categoryId, page = 1, size = 10) {
    return api.get(`/books/category/${categoryId}`, {
      params: {
        page: page - 1,
        size,
      },
    });
  }

  /**
   * Récupère les livres par auteur
   * @param {number} authorId - ID de l'auteur
   * @param {number} page - Numéro de la page (commence à 1)
   * @param {number} size - Nombre d'éléments par page
   * @returns {Promise} - Promesse contenant les livres de l'auteur
   */
  getBooksByAuthor(authorId, page = 1, size = 10) {
    return api.get(`/books/author/${authorId}`, {
      params: {
        page: page - 1,
        size,
      },
    });
  }

  /**
   * Recherche de livres
   * @param {string} query - Texte de recherche
   * @param {number} page - Numéro de la page (commence à 1)
   * @param {number} size - Nombre d'éléments par page
   * @returns {Promise} - Promesse contenant les résultats de recherche
   */
  searchBooks(query, page = 1, size = 10) {
    return api.get(`/books/search`, {
      params: {
        query,
        page: page - 1,
        size,
      },
    });
  }

  /**
   * Récupère les livres populaires
   * @param {number} limit - Nombre maximum de livres à récupérer
   * @returns {Promise} - Promesse contenant les livres populaires
   */
  getPopularBooks(limit = 10) {
    return api.get(`/books/popular`, {
      params: { limit },
    });
  }

  /**
   * Récupère les nouveautés
   * @param {number} limit - Nombre maximum de livres à récupérer
   * @returns {Promise} - Promesse contenant les nouveautés
   */
  getNewReleases(limit = 10) {
    return api.get(`/books/new-releases`, {
      params: { limit },
    });
  }

  /**
   * Récupère les recommandations pour un utilisateur
   * @param {number} limit - Nombre maximum de livres à récupérer
   * @returns {Promise} - Promesse contenant les recommandations
   */
  getRecommendations(limit = 10) {
    return api.get(`/books/recommendations`, {
      params: { limit },
    });
  }

  /**
   * Récupère les livres similaires à un livre donné
   * @param {number} bookId - ID du livre
   * @param {number} limit - Nombre maximum de livres à récupérer
   * @returns {Promise} - Promesse contenant les livres similaires
   */
  getSimilarBooks(bookId, limit = 5) {
    return api.get(`/books/${bookId}/similar`, {
      params: { limit },
    });
  }

  /**
   * Ajoute un nouveau livre
   * @param {Object} bookData - Données du livre à ajouter
   * @returns {Promise} - Promesse contenant le livre ajouté
   */
  async addBook(bookData) {
    try {
      // If file upload is involved, use FormData
      const formData = new FormData();
      Object.keys(bookData).forEach((key) => {
        if (key === 'picture' && bookData[key]) {
          formData.append('picture', bookData[key]);
        } else if (key !== 'picture') {
          formData.append(key, JSON.stringify(bookData[key]));
        }
      });

      const response = await axios.post('/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre:", error);
      throw error;
    }
  }

  /**
   * Met à jour un livre existant
   * @param {number} id - ID du livre à mettre à jour
   * @param {Object} bookData - Nouvelles données du livre
   * @returns {Promise} - Promesse contenant le livre mis à jour
   */
  updateBook(id, bookData) {
    // Si bookData contient un fichier d'image, utiliser FormData
    if (bookData.coverImage instanceof File) {
      const formData = new FormData();
      Object.keys(bookData).forEach((key) => {
        if (key === 'coverImage') {
          formData.append(key, bookData[key]);
        } else if (key === 'categoryIds') {
          // Pour les tableaux, ajouter chaque élément séparément
          bookData[key].forEach((categoryId) => {
            formData.append('categoryIds', categoryId);
          });
        } else {
          formData.append(key, bookData[key]);
        }
      });
      return api.put(`/books/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // Sinon, envoyer les données JSON normalement
    return api.put(`/books/${id}`, bookData);
  }

  /**
   * Supprime un livre
   * @param {number} id - ID du livre à supprimer
   * @returns {Promise} - Promesse de confirmation de suppression
   */
  deleteBook(id) {
    return api.delete(`/books/${id}`);
  }

  /**
   * Met à jour le stock d'un livre
   * @param {number} id - ID du livre
   * @param {number} quantity - Nouvelle quantité en stock
   * @returns {Promise} - Promesse contenant le livre mis à jour
   */
  updateBookStock(id, quantity) {
    return api.patch(`/books/${id}/stock`, { quantity });
  }
}

export default new BookService();
