import api from './api';

class UserService {
  // Récupérer tous les utilisateurs
  getAllUsers() {
    return api.get('/users');
  }

  // Récupérer un utilisateur par son ID
  getUserById(id) {
    return api.get(`/users/${id}`);
  }

  // Récupérer l'utilisateur connecté
  getCurrentUser() {
    return api.get('/users/me');
  }

  // Créer un nouvel utilisateur
  create(userData) {
    return api.post('/users', userData);
  }

  // Créer un utilisateur avec un avatar
  createWithAvatar(formData) {
    return api.post('/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Mettre à jour un utilisateur
  update(id, userData) {
    return api.put(`/users/${id}`, userData);
  }

  // Mettre à jour un utilisateur et son avatar
  updateWithAvatar(id, userData, avatarFile = null) {
    // Mettre d'abord à jour les informations de l'utilisateur
    return this.update(id, userData).then((response) => {
      // Si pas d'avatar à mettre à jour, retourner simplement la réponse
      if (!avatarFile) {
        return response;
      }

      // Sinon, mettre à jour l'avatar séparément
      return this.updateAvatar(id, avatarFile).then((avatarResponse) => {
        // Combiner les données de l'utilisateur avec les données de l'avatar
        response.data.avatar = avatarResponse.data.avatar;
        return response;
      });
    });
  }

  // Changer le mot de passe d'un utilisateur
  changePassword(id, passwordData) {
    return api.put(`/users/${id}/password`, passwordData);
  }

  // Supprimer un utilisateur
  delete(id) {
    return api.delete(`/users/${id}`);
  }

  // récupérer les utilisateurs avec pagination
  getUsers(params = {}) {
    return api.get('/users', { params });
  }

  // Récupérer le profil de l'utilisateur
  getUserProfile() {
    return api.get('/users/profile');
  }

  // Méthode pour mettre à jour l'avatar
  updateAvatar(id, avatarFile) {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    // Utiliser POST au lieu de PUT pour l'avatar
    return api.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Méthode pour réinitialiser l'avatar
  resetAvatar(id) {
    return api.delete(`/users/${id}/avatar`);
  }

  // Mettre à jour le profil utilisateur
  updateUserProfile(id, formData) {
    return api.put(`/users/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Mettre à jour le statut d'un utilisateur
  // Ensure your endpoint is correctly defined
  updateUserStatus(userId, status) {
    return api.put(`/users/${userId}/status`, { active: status });
  }
}

export default new UserService();
