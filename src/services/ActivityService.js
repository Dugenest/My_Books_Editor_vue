import api from './api';

// Mode de développement sans backend
const DEV_MODE = false; // Mettre à false pour utiliser le vrai backend

/**
 * Service pour gérer les activités de l'application
 */
class ActivityService {
  /**
   * Récupère les activités récentes
   * @param {Number} limit - Nombre d'activités à récupérer
   * @returns {Promise} Promesse contenant les activités récentes
   */
  async getRecentActivity(limit = 10) {
    // En mode développement, retourner des données fictives
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockActivities = [
            {
              id: 1,
              type: 'order',
              message: 'Nouvelle commande #ORD-12345',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              userId: 1,
              data: { orderId: 12345 },
            },
            {
              id: 2,
              type: 'user',
              message: 'Nouvel utilisateur inscrit',
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 2
              ).toISOString(), // 2 hours ago
              userId: 2,
              data: { userId: 2 },
            },
            {
              id: 3,
              type: 'book',
              message: 'Nouveau livre ajouté: "1984"',
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 5
              ).toISOString(), // 5 hours ago
              userId: 1,
              data: { bookId: 101 },
            },
            {
              id: 4,
              type: 'category',
              message: 'Nouvelle catégorie créée: "Science Fiction"',
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 24
              ).toISOString(), // 1 day ago
              userId: 1,
              data: { categoryId: 5 },
            },
            {
              id: 5,
              type: 'author',
              message: 'Nouvel auteur ajouté: "George Orwell"',
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 24 * 2
              ).toISOString(), // 2 days ago
              userId: 1,
              data: { authorId: 42 },
            },
          ];

          resolve({ data: mockActivities.slice(0, limit) });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    try {
      const response = await api.get(`/activities/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des activités récentes:',
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les activités d'un utilisateur
   * @param {String} userId - ID de l'utilisateur
   * @param {Number} limit - Nombre d'activités à récupérer
   * @returns {Promise} Promesse contenant les activités de l'utilisateur
   */
  async getUserActivity(userId, limit = 10) {
    // En mode développement, retourner des données fictives
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUserActivities = [
            {
              id: 1,
              type: 'order',
              message: 'Commande #ORD-12345 passée',
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              userId: userId,
              data: { orderId: 12345 },
            },
            {
              id: 2,
              type: 'book',
              message: 'Livre ajouté au panier: "1984"',
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 2
              ).toISOString(), // 2 hours ago
              userId: userId,
              data: { bookId: 101 },
            },
            {
              id: 3,
              type: 'user',
              message: 'Profil mis à jour',
              timestamp: new Date(
                Date.now() - 1000 * 60 * 60 * 24
              ).toISOString(), // 1 day ago
              userId: userId,
              data: { userId: userId },
            },
          ];

          resolve({ data: mockUserActivities.slice(0, limit) });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    try {
      const response = await api.get(
        `/activities/user/${userId}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des activités de l'utilisateur:",
        error
      );
      throw error;
    }
  }

  /**
   * Enregistre une nouvelle activité
   * @param {Object} activity - Activité à enregistrer
   * @returns {Promise} Promesse contenant l'activité enregistrée
   */
  async logActivity(activity) {
    // En mode développement, simuler l'enregistrement d'une activité
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockActivity = {
            id: Math.floor(Math.random() * 1000) + 100,
            timestamp: new Date().toISOString(),
            ...activity,
          };

          console.log('Activité enregistrée (mode dev):', mockActivity);
          resolve({ data: mockActivity });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    try {
      const response = await api.post('/activities', activity);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'activité:", error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques du tableau de bord
   * @returns {Promise} Promesse contenant les statistiques
   */
  getStats() {
    // En mode développement, retourner des données fictives
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockStats = {
            totalOrders: 156,
            ordersChange: 12.5,
            totalRevenue: 8750.25,
            revenueChange: 8.3,
            totalUsers: 243,
            usersChange: 5.7,
            totalBooks: 512,
            outOfStock: 8,
            totalCategories: 18,
            totalAuthors: 45,
            totalEditors: 12,
            totalSeries: 24,
            totalComments: 320,
          };

          resolve({ data: mockStats });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api
      .get('/dashboard/stats')
      .then((response) => {
        // S'assurer que la réponse est dans un format standardisé
        if (response.data) {
          return response.data;
        } else {
          // Si la réponse est un objet mais pas dans response.data
          return { data: response };
        }
      })
      .catch((error) => {
        console.error(
          'Erreur lors de la récupération des statistiques:',
          error
        );

        // Log détaillé de l'erreur
        if (error.response) {
          // La requête a été faite et le serveur a répondu avec un code d'état
          console.error("Détails de l'erreur:", error.response.data);
          console.error("Statut de l'erreur:", error.response.status);
          console.error('En-têtes:', error.response.headers);
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          console.error('Aucune réponse reçue', error.request);
        } else {
          // Quelque chose s'est passé lors de la configuration de la requête
          console.error('Erreur', error.message);
        }

        // Renvoyer un objet vide en cas d'erreur pour éviter des erreurs en cascade
        return { data: {} };
      });
  }
}

export default new ActivityService();
