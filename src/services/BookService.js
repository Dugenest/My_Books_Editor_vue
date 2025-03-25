import api from './api';
// import axios from 'axios'; // Nous utilisons api au lieu d'axios

// Mode développement (pour tester sans backend)
const DEV_MODE = false;

class BookService {
  /**
   * Récupère tous les livres avec pagination et filtrage
   * @param {Object} params - Paramètres de pagination et filtrage
   * @returns {Promise} - Promesse contenant les livres
   */
  async getBooks(params = {}) {
    // En mode développement, retourner des données fictives
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockBooks = Array(20)
            .fill(null)
            .map((_, index) => ({
              id: index + 1,
              title: `Livre exemple ${index + 1}`,
              detail: `Description du livre ${index + 1}`,
              price: Math.round(Math.random() * 50 + 10),
              stock: Math.round(Math.random() * 100),
              ISBN: `978-123456789${index.toString().padStart(2, '0')}`,
              coverImage: `/img/default-cover.jpg`,
              publicationDate: new Date(
                Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365 * 5
              ).toISOString(),
              categories: [{ id: 1, name: 'Roman' }],
              author: { id: 1, firstName: 'Auteur', lastName: 'Exemple' },
              editor: { id: 1, name: 'Éditeur Exemple' },
            }));

          const content = mockBooks.slice(
            params.page * params.size,
            (params.page + 1) * params.size
          );

          resolve({
            data: {
              content,
              totalElements: mockBooks.length,
              totalPages: Math.ceil(mockBooks.length / params.size),
              number: params.page,
              size: params.size,
            },
          });
        }, 300); // Simuler un délai réseau
      });
    }

    try {
      console.log(
        'BookService: Tentative de récupération des livres avec params:',
        params
      );
      const response = await api.get('/books', { params });
      console.log('BookService: Réponse brute:', response);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des livres:', error);
      console.error('Message:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);

      // Retourner une réponse vide pour éviter de bloquer l'interface
      return { data: { content: [], totalElements: 0, totalPages: 1 } };
    }
  }

  /**
   * Récupère un livre par son ID
   * @param {number} id - ID du livre
   * @returns {Promise} - Promesse contenant le livre
   */
  async getBookById(id) {
    try {
      const response = await api.get(`/books/${id}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération du livre ${id}:`, error);
      throw error;
    }
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
    return api.get('/books/search/title', {
      params: {
        title: query,
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
      const response = await api.post('/books', bookData);
      return response;
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre:", error);
      throw error;
    }
  }

  /**
   * Upload l'image d'un livre
   * @param {number} bookId - ID du livre
   * @param {FormData} imageData - Données de l'image
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  async uploadBookImage(bookId, imageData) {
    try {
      const response = await api.post(`/books/${bookId}/image`, imageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error("Erreur lors de l'upload de l'image:", error);
      throw error;
    }
  }

  /**
   * Met à jour un livre
   * @param {number} id - ID du livre à modifier
   * @param {Object} bookData - Nouvelles données du livre
   * @returns {Promise} - Promesse contenant le livre mis à jour
   */
  async updateBook(id, bookData) {
    try {
      console.log(
        'Tentative de mise à jour du livre avec les données:',
        bookData
      );

      // Nettoyage des données pour éviter les problèmes de session Hibernate
      const cleanData = {
        id: bookData.id,
        title: bookData.title,
        detail: bookData.detail || '',
        price: parseFloat(bookData.price),
        stock: parseInt(bookData.stock),
        ISBN: bookData.ISBN || '',
        publication_date: bookData.publication_date || null,
        authorId: bookData.authorId,
        editorId: bookData.editorId || null,
        categoryIds: bookData.categoryIds || [],
        userId: bookData.userId,
      };

      const response = await api.put(`/books/${id}`, cleanData);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du livre ${id}:`, error);

      // Si c'est une erreur de lazy loading/session hibernate, enrichir le message
      if (error.response && error.response.status === 500) {
        const errorData = error.response.data;
        if (
          errorData &&
          errorData.message &&
          (errorData.message.includes('lazy') ||
            errorData.message.includes('session') ||
            errorData.message.includes('proxy') ||
            errorData.message.includes('basketBooks'))
        ) {
          console.error(
            'Erreur de chargement lazy détectée:',
            errorData.message
          );
          error.lazyLoadingError = true;
        }
      }

      throw error;
    }
  }

  /**
   * Supprime un livre
   * @param {number} id - ID du livre à supprimer
   * @returns {Promise} - Promesse indiquant le succès de la suppression
   */
  async deleteBook(id) {
    try {
      const response = await api.delete(`/books/${id}`);
      return response;
    } catch (error) {
      console.error(`Erreur lors de la suppression du livre ${id}:`, error);
      throw error;
    }
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
