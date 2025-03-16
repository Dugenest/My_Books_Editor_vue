<!-- src/components/CreateAuthorModal.vue -->

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter un nouvel auteur</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Section Informations Auteur -->
          <div class="form-section">
            <h3>Informations de l'auteur</h3>

            <div class="form-group">
              <label for="firstName">Prénom *</label>
              <input
                type="text"
                id="firstName"
                v-model="authorData.firstName"
                required
              />
            </div>

            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input
                type="text"
                id="lastName"
                v-model="authorData.lastName"
                required
              />
            </div>

            <div class="form-group">
              <label for="biography">Biographie</label>
              <textarea
                id="biography"
                v-model="authorData.biography"
                rows="4"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="birthDate">Date de naissance</label>
                <input
                  type="date"
                  id="birthDate"
                  v-model="authorData.birthDate"
                />
              </div>

              <div class="form-group">
                <label for="nationality">Nationalité</label>
                <input
                  type="text"
                  id="nationality"
                  v-model="authorData.nationality"
                />
              </div>
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
          </div>

          <!-- Section Informations Utilisateur -->
          <div class="form-section user-section">
            <h3>Informations de compte</h3>

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
              <input
                type="email"
                id="email"
                v-model="userData.email"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                v-model="userData.password"
                required
                minlength="8"
              />
              <small>Le mot de passe doit contenir au moins 8 caractères</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Création en cours...' : "Créer l'auteur" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import AuthorService from '@/services/AuthorService';

export default {
  name: 'CreateAuthorModal',

  emits: ['close', 'author-created'],

  setup(props, { emit }) {
    const authorData = ref({
      firstName: '',
      lastName: '',
      biography: '',
      birthDate: '',
      nationality: '',
      photo: null,
    });

    const userData = ref({
      username: '',
      email: '',
      password: '',
      role: 'AUTHOR',
      active: true,
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      subscribeNewsletter: false,
    });

    const imagePreview = ref(null);
    const isSubmitting = ref(false);

    // Synchroniser les données entre authorData et userData
    watch(
      () => authorData.value.firstName,
      (newVal) => {
        userData.value.firstName = newVal;
      }
    );

    watch(
      () => authorData.value.lastName,
      (newVal) => {
        userData.value.lastName = newVal;
      }
    );

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        authorData.value.photo = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // Validation basique côté client
        if (!authorData.value.firstName || !authorData.value.lastName) {
          throw new Error("Le prénom et le nom de l'auteur sont obligatoires");
        }

        if (
          !userData.value.username ||
          !userData.value.email ||
          !userData.value.password
        ) {
          throw new Error(
            'Veuillez remplir tous les champs obligatoires du compte'
          );
        }

        if (userData.value.password.length < 8) {
          throw new Error(
            'Le mot de passe doit contenir au moins 8 caractères'
          );
        }

        // Synchroniser les noms avant l'envoi
        userData.value.firstName = authorData.value.firstName;
        userData.value.lastName = authorData.value.lastName;

        // Log des données avant envoi
        console.group('📝 Données avant envoi');
        console.log('Données auteur:', { ...authorData.value });
        console.log('Données utilisateur:', { ...userData.value });
        console.groupEnd();

        // Vérification explicite des champs requis
        const requiredFields = ['username', 'email', 'password'];
        const missingFields = requiredFields.filter(
          (field) => !userData.value[field]
        );

        if (missingFields.length > 0) {
          console.error('Champs manquants:', missingFields);
          throw new Error(
            `Champs obligatoires manquants: ${missingFields.join(', ')}`
          );
        }

        // Créer une copie des données pour éviter les problèmes de réactivité
        const authorDataToSend = { ...authorData.value };
        const userDataToSend = { ...userData.value };

        // Appel au service pour créer l'auteur et l'utilisateur associé
        const response = await AuthorService.createAuthorWithUser(
          authorDataToSend,
          userDataToSend
        );

        console.log('Auteur créé avec succès:', response);
        emit('author-created', response);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de la création de l'auteur:", error);
        alert(
          error.message ||
            "Une erreur est survenue lors de la création de l'auteur"
        );
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      authorData,
      userData,
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

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #4361ee;
}

.user-section {
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 4px;
  margin-bottom: 2rem;
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

.form-group small {
  display: block;
  margin-top: 0.25rem;
  color: #6b7280;
  font-size: 0.875rem;
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
</style>
