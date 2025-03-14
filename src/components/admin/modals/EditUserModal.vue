<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Modifier l'utilisateur</h2>
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
                v-model="editedUser.firstName"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input
                type="text"
                id="lastName"
                v-model="editedUser.lastName"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input
              type="email"
              id="email"
              v-model="editedUser.email"
              required
            />
          </div>

          <div class="form-row" v-if="changePassword">
            <div class="form-group">
              <label for="password">Nouveau mot de passe *</label>
              <input
                type="password"
                id="password"
                v-model="editedUser.password"
                :required="changePassword"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe *</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                :required="changePassword"
              />
              <div v-if="passwordError" class="form-error">
                {{ passwordError }}
              </div>
            </div>
          </div>

          <div class="form-group password-change-toggle">
            <button
              type="button"
              class="btn-link"
              @click="changePassword = !changePassword"
            >
              {{
                changePassword
                  ? 'Annuler le changement de mot de passe'
                  : 'Changer le mot de passe'
              }}
            </button>
          </div>

          <div class="form-group">
            <label for="role">Rôle *</label>
            <select id="role" v-model="editedUser.role" required>
              <option value="USER">Utilisateur</option>
              <option value="EDITOR">Éditeur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input type="tel" id="phone" v-model="editedUser.phone" />
          </div>

          <div class="form-group">
            <label for="avatar">Avatar</label>
            <div
              class="current-avatar"
              v-if="editedUser.avatar && !avatarPreview"
            >
              <img :src="editedUser.avatar" alt="Avatar actuel" />
              <button
                type="button"
                class="btn-remove-avatar"
                @click="removeCurrentAvatar"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
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
                <input type="checkbox" v-model="editedUser.active" />
                <span class="slider"></span>
              </div>
              <span>{{ editedUser.active ? 'Actif' : 'Inactif' }}</span>
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
              {{
                isSubmitting
                  ? 'Enregistrement...'
                  : 'Enregistrer les modifications'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'EditUserModal',

  props: {
    user: {
      type: Object,
      required: true,
    },
  },

  emits: ['close', 'user-updated'],

  setup(props, { emit }) {
    const editedUser = ref({});
    const confirmPassword = ref('');
    const avatarPreview = ref(null);
    const isSubmitting = ref(false);
    const changePassword = ref(false);

    onMounted(() => {
      // Extraction du prénom et du nom à partir du nom complet
      const nameParts = props.user.name ? props.user.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Copier les valeurs de l'utilisateur pour éviter de modifier l'objet original
      editedUser.value = {
        ...props.user,
        firstName,
        lastName,
        password: '',
        active: props.user.status === 'active',
      };
    });

    const passwordError = computed(() => {
      if (
        changePassword.value &&
        confirmPassword.value &&
        editedUser.value.password !== confirmPassword.value
      ) {
        return 'Les mots de passe ne correspondent pas';
      }
      return '';
    });

    const isFormValid = computed(() => {
      const basicValidation =
        editedUser.value.firstName &&
        editedUser.value.lastName &&
        editedUser.value.email;

      if (changePassword.value) {
        return (
          basicValidation &&
          editedUser.value.password &&
          editedUser.value.password === confirmPassword.value
        );
      }

      return basicValidation;
    });

    const handleAvatarUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        editedUser.value.newAvatar = file;
        avatarPreview.value = URL.createObjectURL(file);
      }
    };

    const removeCurrentAvatar = () => {
      editedUser.value.avatar = null;
    };

    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      try {
        isSubmitting.value = true;

        // Préparation des données à envoyer
        const userData = {
          ...editedUser.value,
          name: `${editedUser.value.firstName} ${editedUser.value.lastName}`,
          status: editedUser.value.active ? 'active' : 'inactive',
        };

        // Ne pas inclure le mot de passe si non modifié
        if (!changePassword.value) {
          delete userData.password;
        }

        // Simulation d'appel API
        // En production, on appellerait un service ou une API pour mettre à jour l'utilisateur
        // await userService.updateUser(userData.id, userData);

        console.log('Utilisateur modifié:', userData);

        // Simuler un délai pour l'enregistrement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        emit('user-updated', userData);
        emit('close');
      } catch (error) {
        console.error(
          "Erreur lors de la modification de l'utilisateur:",
          error
        );
        // Gérer les erreurs (afficher un message, etc.)
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      editedUser,
      confirmPassword,
      avatarPreview,
      isSubmitting,
      changePassword,
      passwordError,
      isFormValid,
      handleAvatarUpload,
      removeCurrentAvatar,
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

.password-change-toggle {
  margin-top: -1rem;
  margin-bottom: 1.5rem;
}

.btn-link {
  background: none;
  border: none;
  color: #1a237e;
  padding: 0;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
}

.btn-link:hover {
  color: #303f9f;
}

.current-avatar {
  position: relative;
  margin-bottom: 1rem;
  display: inline-block;
}

.current-avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.btn-remove-avatar {
  position: absolute;
  top: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #d32f2f;
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
