import api from './api';

// Mode de développement sans backend
const DEV_MODE = true; // Mettre à true pour utiliser des données fictives

// Données fictives pour le mode développement
const mockUsers = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  username: `user${index + 1}`,
  email: `user${index + 1}@example.com`,
  firstName: `Prénom${index + 1}`,
  lastName: `Nom${index + 1}`,
  role: index < 3 ? 'ADMIN' : index < 10 ? 'MANAGER' : 'USER',
  status: index % 5 === 0 ? 'INACTIVE' : 'ACTIVE',
  createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
  lastLogin:
    index % 3 === 0
      ? new Date(Date.now() - Math.random() * 1000000000).toISOString()
      : null,
  phoneNumber: `06${Math.floor(10000000 + Math.random() * 90000000)}`,
}));

class UserService {
  /**
   * Récupère tous les utilisateurs avec pagination et filtres
   * @param {Object} params - Paramètres de la requête
   * @param {number} params.page - Numéro de la page (commence à 0)
   * @param {number} params.size - Nombre d'éléments par page
   * @param {string} params.sort - Champ et direction de tri (ex: "name,asc")
   * @param {string} params.search - Terme de recherche
   * @param {string} params.role - Rôle de l'utilisateur
   * @param {string} params.status - Statut de l'utilisateur
   * @returns {Promise} - Promesse contenant les données des utilisateurs
   */
  getUsers(params = {}) {
    // En mode développement, retourner des données fictives
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Valeurs par défaut
          const page = params.page || 0;
          const size = params.size || 10;
          const search = params.search || '';
          const role = params.role || '';
          const status = params.status || '';

          // Filtrer les utilisateurs
          let filteredUsers = [...mockUsers];

          // Filtre de recherche
          if (search) {
            const searchLower = search.toLowerCase();
            filteredUsers = filteredUsers.filter(
              (user) =>
                user.username.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower) ||
                user.firstName.toLowerCase().includes(searchLower) ||
                user.lastName.toLowerCase().includes(searchLower)
            );
          }

          // Filtre par rôle
          if (role) {
            filteredUsers = filteredUsers.filter((user) => user.role === role);
          }

          // Filtre par statut
          if (status) {
            filteredUsers = filteredUsers.filter(
              (user) => user.status === status
            );
          }

          // Tri
          if (params.sort) {
            const [field, direction] = params.sort.split(',');
            filteredUsers.sort((a, b) => {
              if (!a[field] && !b[field]) return 0;
              if (!a[field]) return 1;
              if (!b[field]) return -1;

              const valueA =
                typeof a[field] === 'string'
                  ? a[field].toLowerCase()
                  : a[field];
              const valueB =
                typeof b[field] === 'string'
                  ? b[field].toLowerCase()
                  : b[field];

              if (direction === 'asc') {
                return valueA > valueB ? 1 : -1;
              } else {
                return valueA < valueB ? 1 : -1;
              }
            });
          }

          // Pagination
          const totalElements = filteredUsers.length;
          const totalPages = Math.ceil(totalElements / size);
          const startIndex = page * size;
          const paginatedUsers = filteredUsers.slice(
            startIndex,
            startIndex + size
          );

          // Structure de réponse
          const response = {
            content: paginatedUsers,
            pageable: {
              pageNumber: page,
              pageSize: size,
              sort: {
                sorted: params.sort ? true : false,
                unsorted: !params.sort,
                empty: !params.sort,
              },
            },
            totalElements,
            totalPages,
            last: page >= totalPages - 1,
            size,
            number: page,
            first: page === 0,
            numberOfElements: paginatedUsers.length,
            empty: paginatedUsers.length === 0,
          };

          resolve({ data: response });
        }, 300); // Simuler un délai réseau
      });
    }

    // Valeurs par défaut
    const defaultParams = {
      page: 0,
      size: 10,
    };

    // Fusionner les paramètres par défaut avec ceux fournis
    const queryParams = { ...defaultParams, ...params };

    // En mode production, utiliser l'API réelle
    return api.get(`/users`, {
      params: queryParams,
    });
  }

  /**
   * Récupère tous les utilisateurs
   * @returns {Promise} - Promesse contenant les données des utilisateurs
   */
  getAll() {
    // En mode développement, retourner tous les utilisateurs fictifs
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockUsers });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.get('/users');
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur
   */
  get(id) {
    // En mode développement, chercher l'utilisateur dans les données fictives
    if (DEV_MODE) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const user = mockUsers.find((u) => u.id === parseInt(id));

          if (user) {
            // Ajouter des informations supplémentaires pour un utilisateur spécifique
            const userDetails = {
              ...user,
              address: {
                street: `${Math.floor(1 + Math.random() * 100)} Rue de la Paix`,
                city: 'Paris',
                zipCode: '75001',
                country: 'France',
              },
              orders: Math.floor(Math.random() * 20),
              totalSpent: Math.floor(Math.random() * 10000) / 100,
              notes:
                user.role === 'ADMIN'
                  ? 'Administrateur système'
                  : 'Utilisateur régulier',
            };

            resolve({ data: userDetails });
          } else {
            reject({
              response: {
                status: 404,
                data: { message: `Utilisateur avec l'ID ${id} non trouvé` },
              },
            });
          }
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.get(`/users/${id}`);
  }

  /**
   * Crée un nouvel utilisateur
   * @param {Object} data - Données de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur créé
   */
  create(data) {
    // En mode développement, simuler la création d'un utilisateur
    if (DEV_MODE) {
      return new Promise((resolve) => {
        setTimeout(() => {
          // Générer un ID unique
          const maxId = mockUsers.reduce(
            (max, user) => Math.max(max, user.id),
            0
          );

          const newUser = {
            id: maxId + 1,
            createdAt: new Date().toISOString(),
            status: 'ACTIVE',
            ...data,
          };

          // Ajouter l'utilisateur aux données fictives
          mockUsers.push(newUser);

          console.log('Utilisateur créé (mode dev):', newUser);
          resolve({ data: newUser });
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.post('/users', data);
  }

  /**
   * Met à jour un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {Object} data - Données de l'utilisateur
   * @returns {Promise} - Promesse contenant les données de l'utilisateur mis à jour
   */
  update(id, data) {
    // En mode développement, simuler la mise à jour d'un utilisateur
    if (DEV_MODE) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockUsers.findIndex((u) => u.id === parseInt(id));

          if (index !== -1) {
            // Mettre à jour l'utilisateur
            mockUsers[index] = {
              ...mockUsers[index],
              ...data,
              updatedAt: new Date().toISOString(),
            };

            console.log('Utilisateur mis à jour (mode dev):', mockUsers[index]);
            resolve({ data: mockUsers[index] });
          } else {
            reject({
              response: {
                status: 404,
                data: { message: `Utilisateur avec l'ID ${id} non trouvé` },
              },
            });
          }
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.put(`/users/${id}`, data);
  }

  /**
   * Supprime un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @returns {Promise} - Promesse contenant la réponse de suppression
   */
  delete(id) {
    // En mode développement, simuler la suppression d'un utilisateur
    if (DEV_MODE) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockUsers.findIndex((u) => u.id === parseInt(id));

          if (index !== -1) {
            // Supprimer l'utilisateur
            const deletedUser = mockUsers.splice(index, 1)[0];

            console.log('Utilisateur supprimé (mode dev):', deletedUser);
            resolve({ data: { message: 'Utilisateur supprimé avec succès' } });
          } else {
            reject({
              response: {
                status: 404,
                data: { message: `Utilisateur avec l'ID ${id} non trouvé` },
              },
            });
          }
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.delete(`/users/${id}`);
  }

  /**
   * Met à jour le statut d'un utilisateur
   * @param {number} id - ID de l'utilisateur
   * @param {string} status - Nouveau statut
   * @returns {Promise} - Promesse contenant les données de l'utilisateur mis à jour
   */
  updateUserStatus(id, status) {
    // En mode développement, simuler la mise à jour du statut
    if (DEV_MODE) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockUsers.findIndex((u) => u.id === parseInt(id));

          if (index !== -1) {
            // Mettre à jour le statut
            mockUsers[index].status = status;
            mockUsers[index].updatedAt = new Date().toISOString();

            console.log(
              'Statut utilisateur mis à jour (mode dev):',
              mockUsers[index]
            );
            resolve({ data: mockUsers[index] });
          } else {
            reject({
              response: {
                status: 404,
                data: { message: `Utilisateur avec l'ID ${id} non trouvé` },
              },
            });
          }
        }, 300); // Simuler un délai réseau
      });
    }

    // En mode production, utiliser l'API réelle
    return api.patch(`/users/${id}/status`, { status });
  }
}

export default new UserService();
