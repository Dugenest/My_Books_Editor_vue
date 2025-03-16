<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter un utilisateur</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom *</label>
              <input
                type="text"
                id="firstName"
                v-model="user.firstName"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input
                type="text"
                id="lastName"
                v-model="user.lastName"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" v-model="user.email" required />
          </div>

          <div class="form-group">
            <label for="username">Nom d'utilisateur *</label>
            <input type="text" id="username" v-model="user.username" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                v-model="user.password"
                required
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe *</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                required
              />
              <div v-if="passwordError" class="form-error">
                {{ passwordError }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="address">Adresse</label>
            <textarea
              id="address"
              v-model="user.address"
              rows="3"
              placeholder="Adresse complète"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input type="tel" id="phone" v-model="user.phone" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="role">Rôle *</label>
              <select id="role" v-model="user.role" required>
                <option value="USER">Utilisateur</option>
                <option value="EDITOR">Éditeur</option>
                <option value="ADMIN">Administrateur</option>
                <option value="AUTHOR">Auteur</option>
              </select>
            </div>

            <div class="form-group">
              <label for="user_type">Type d'utilisateur *</label>
              <select id="user_type" v-model="user.user_type" required>
                <option value="CUSTOMER">Client</option>
                <option value="STAFF">Personnel</option>
                <option value="PARTNER">Partenaire</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="avatar">Avatar</label>
            <div class="file-upload">
              <input
                type="file"
                id="avatar"
                @change="handleAvatarUpload"
                accept="image/*"
              />
              <div v-if="avatarPreview" class="image-preview">
                <img :src="avatarPreview" alt="Aperçu de l'avatar" />
              </div>
            </div>
          </div>

          <div class="form-group switch-group">
            <label class="switch-label">
              <span>Statut</span>
              <div class="switch">
                <input type="checkbox" v-model="user.active" />
                <span class="slider"></span>
              </div>
              <span>{{ user.active ? 'Actif' : 'Inactif' }}</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="isSubmitting || !isFormValid"
            >
              {{ isSubmitting ? 'Enregistrement...' : "Ajouter l'utilisateur" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'AddUserModal',

  emits: ['close', 'user-added'],

  setup(props, { emit }) {
    const user = ref({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      address: '',
      phone: '',
      role: 'USER',
      user_type: 'CUSTOMER',
      avatar: null,
      active: true,
      status: 'active', // statut initial
    });

    const confirmPassword = ref('');
    const avatarPreview = ref(null);
    const isSubmitting = ref(false);

    const passwordError = computed(() => {
      if (
        confirmPassword.value &&
        user.value.password !== confirmPassword.value
      ) {
        return 'Les mots de passe ne correspondent pas';
      }
      return '';
    });

    const isFormValid = computed(() => {
      return (
        user.value.firstName &&
        user.value.lastName &&
        user.value.email &&
        user.value.username &&
        user.value.password &&
        user.value.password === confirmPassword.value &&
        user.value.role &&
        user.value.user_type
      );
    });

    const handleAvatarUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        user.value.avatar = file;
        avatarPreview.value = URL.createObjectURL(file);
      }
    };

    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      try {
        isSubmitting.value = true;

        // Création d'un objet utilisateur complet
        // Le nom complet est automatiquement généré à partir du prénom et nom
        const fullUser = {
          ...user.value,
          name: `${user.value.firstName} ${user.value.lastName}`,
          id: Date.now(), // simulé, normalement généré par le backend
          lastLogin: null,
        };

        // Simulation d'appel API
        // En production, on appellerait un service ou une API pour créer l'utilisateur
        // await userService.addUser(fullUser);

        console.log('Utilisateur ajouté:', fullUser);

        // Simuler un délai pour l'enregistrement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        emit('user-added', fullUser);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur:", error);
        // Gérer les erreurs (afficher un message, etc.)
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      user,
      confirmPassword,
      avatarPreview,
      isSubmitting,
      passwordError,
      isFormValid,
      handleAvatarUpload,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.file-upload {
  border: 1px dashed #ddd;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.switch-group {
  display: flex;
  align-items: center;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2e7d32;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2e7d32;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background-color: #1a237e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #303f9f;
}

.btn-primary:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}
</style>
