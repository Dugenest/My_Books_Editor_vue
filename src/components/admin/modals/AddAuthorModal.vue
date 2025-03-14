<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter un auteur</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="firstName">Prénom *</label>
            <input
              type="text"
              id="firstName"
              v-model="author.firstName"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nom *</label>
            <input
              type="text"
              id="lastName"
              v-model="author.lastName"
              required
            />
          </div>

          <div class="form-group">
            <label for="biography">Biographie</label>
            <textarea
              id="biography"
              v-model="author.biography"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthDate">Date de naissance</label>
              <input type="date" id="birthDate" v-model="author.birthDate" />
            </div>

            <div class="form-group">
              <label for="nationality">Nationalité</label>
              <input
                type="text"
                id="nationality"
                v-model="author.nationality"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="website">Site web</label>
            <input
              type="url"
              id="website"
              v-model="author.website"
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label for="photo">Photo</label>
            <div class="file-upload">
              <input
                type="file"
                id="photo"
                @change="handleImageUpload"
                accept="image/*"
              />
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Photo de l'auteur" />
              </div>
            </div>
          </div>

          <h3 class="form-section-title">Informations de connexion</h3>

          <div class="form-group">
            <label for="username">Nom d'utilisateur *</label>
            <input
              type="text"
              id="username"
              v-model="userData.username"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" v-model="userData.email" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                v-model="userData.password"
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
            <label for="role">Rôle *</label>
            <select id="role" v-model="userData.role" required>
              <option value="AUTHOR">Auteur</option>
              <option value="EDITOR">Éditeur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div class="form-group switch-group">
            <label class="switch-label">
              <span>Statut</span>
              <div class="switch">
                <input type="checkbox" v-model="userData.active" />
                <span class="slider"></span>
              </div>
              <span>{{ userData.active ? 'Actif' : 'Inactif' }}</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enregistrement...' : "Ajouter l'auteur" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import AuthorService from '@/services/AuthorService';

export default {
  name: 'AddAuthorModal',

  emits: ['close', 'author-added'],

  setup(props, { emit }) {
    const author = ref({
      firstName: '',
      lastName: '',
      biography: '',
      birthDate: '',
      nationality: '',
      website: '',
      photo: null,
    });

    const userData = ref({
      username: '',
      email: '',
      password: '',
      role: 'AUTHOR',
      active: true,
    });

    const confirmPassword = ref('');
    const imagePreview = ref(null);
    const isSubmitting = ref(false);

    const passwordError = computed(() => {
      if (
        confirmPassword.value &&
        userData.value.password !== confirmPassword.value
      ) {
        return 'Les mots de passe ne correspondent pas';
      }
      return '';
    });

    const isFormValid = computed(() => {
      return (
        userData.value.username &&
        userData.value.email &&
        userData.value.password &&
        userData.value.password === confirmPassword.value
      );
    });

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        author.value.photo = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      try {
        isSubmitting.value = true;

        // Appel au service pour ajouter l'auteur avec les informations utilisateur
        const response = await AuthorService.createAuthorWithUser(
          author.value,
          userData.value
        );

        console.log('Auteur ajouté:', response.data);

        emit('author-added', response.data);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'auteur:", error);
        // Gérer les erreurs (afficher un message, etc.)
        alert(
          "Une erreur est survenue lors de l'ajout de l'auteur. Veuillez réessayer."
        );
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      author,
      userData,
      confirmPassword,
      passwordError,
      isFormValid,
      imagePreview,
      isSubmitting,
      handleImageUpload,
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

.form-group textarea {
  resize: vertical;
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
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.form-error {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-section-title {
  font-size: 1.1rem;
  color: #333;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
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
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4361ee;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
