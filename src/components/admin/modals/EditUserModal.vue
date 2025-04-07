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
          <!-- Section Avatar -->
          <div class="avatar-section">
            <label>Avatar</label>
            <AvatarUpload
              :currentAvatar="editedUser.avatar"
              :immediateUpload="false"
              @file-selected="handleAvatarSelected"
              @reset="handleAvatarReset"
            />
          </div>

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
            <label for="username">Nom d'utilisateur *</label>
            <input
              type="text"
              id="username"
              v-model="editedUser.username"
              required
            />
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

          <div class="form-group">
            <label for="address">Adresse</label>
            <textarea
              id="address"
              v-model="editedUser.address"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input type="tel" id="phone" v-model="editedUser.phone" />
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

          <div class="form-group">
            <label for="role">Rôle *</label>
            <select id="role" v-model="editedUser.role" required>
              <option value="USER">Utilisateur</option>
              <option value="EDITOR">Éditeur</option>
              <option value="ADMIN">Administrateur</option>
              <option value="AUTHOR">Auteur</option>
            </select>
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

          <div v-if="formError" class="form-error-message">
            {{ formError }}
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
import UserService from '@/services/UserService';
import AvatarUpload from '@/components/AvatarUpload.vue';
export default {
  name: 'EditUserModal',
  components: {
    AvatarUpload,
  },
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
    const isSubmitting = ref(false);
    const changePassword = ref(false);
    const formError = ref('');
    const avatarChanged = ref(false);
    const avatarResetRequested = ref(false);

    onMounted(() => {
      // Copier les valeurs de l'utilisateur pour éviter de modifier l'objet original
      editedUser.value = {
        ...props.user,
        // Assurer que toutes les propriétés nécessaires sont présentes
        id: props.user.id,
        firstName: props.user.firstName || '',
        lastName: props.user.lastName || '',
        username: props.user.username || '',
        email: props.user.email || '',
        address: props.user.address || '',
        phone: props.user.phone || '',
        role: props.user.role || 'USER',
        active: props.user.active !== undefined ? props.user.active : true,
        avatar: props.user.avatar || '',
        password: '',
      };

      console.log('Données utilisateur chargées:', editedUser.value);
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
        editedUser.value.username &&
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

    const handleAvatarSelected = ({ file, preview }) => {
      editedUser.value.avatarFile = file;
      editedUser.value.avatarPreview = preview;
      avatarChanged.value = true;
      avatarResetRequested.value = false;
    };

    const handleAvatarReset = () => {
      editedUser.value.avatarFile = null;
      editedUser.value.avatarPreview = null;
      avatarChanged.value = true;
      avatarResetRequested.value = true;
    };

    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      formError.value = '';
      isSubmitting.value = true;

      try {
        // Clone user data to prevent reactivity issues
        const userData = { ...editedUser.value };

        // Ne pas inclure le mot de passe si non modifié
        if (!changePassword.value) {
          delete userData.password;
        }

        // Remove avatar-related fields from userData
        delete userData.avatarFile;
        delete userData.avatarPreview;

        let response;
        if (avatarChanged.value) {
          // If avatar has changed, use updateWithAvatar with the file
          response = await UserService.updateWithAvatar(
            editedUser.value.id,
            userData,
            editedUser.value.avatarFile
          );
        } else {
          // Otherwise use regular update
          response = await UserService.update(editedUser.value.id, userData);
        }

        emit('user-updated', response.data);
        emit('close');
        console.log('Réponse de mise à jour:', response);
      } catch (error) {
        console.error(
          "Erreur lors de la modification de l'utilisateur:",
          error
        );
        formError.value = "Erreur lors de la mise à jour de l'utilisateur";
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      editedUser,
      confirmPassword,
      isSubmitting,
      changePassword,
      formError,
      passwordError,
      isFormValid,
      handleAvatarSelected,
      handleAvatarReset,
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

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar-section label {
  margin-bottom: 1rem;
  color: #666;
  font-weight: 500;
  align-self: center;
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

.form-error-message {
  color: #d32f2f;
  background-color: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  font-weight: 500;
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

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
