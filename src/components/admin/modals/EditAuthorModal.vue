<!-- src/components/EditAuthorModal.vue -->

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Modifier l'auteur</h2>
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
            <label for="website">Site web</label>
            <input
              type="url"
              id="website"
              v-model="authorData.website"
              placeholder="https://..."
            />
          </div>

          <div class="form-group">
            <label for="address">Adresse</label>
            <textarea
              id="address"
              v-model="authorData.address"
              rows="2"
              placeholder="Adresse complète..."
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                v-model="authorData.phone"
                placeholder="Numéro de téléphone..."
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="username">Nom d'utilisateur *</label>
              <input
                type="text"
                id="username"
                v-model="authorData.username"
                required
                placeholder="Nom d'utilisateur..."
              />
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <input
                type="email"
                id="email"
                v-model="authorData.email"
                required
                placeholder="email@exemple.com"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Nouveau mot de passe</label>
            <input
              type="password"
              id="password"
              v-model="authorData.password"
              placeholder="Laisser vide pour conserver le mot de passe actuel"
            />
            <small>
              Laissez vide si vous ne souhaitez pas modifier le mot de passe
            </small>
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
              <div v-else-if="authorData.photoUrl" class="image-preview">
                <img :src="authorData.photoUrl" alt="Photo de l'auteur" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
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
import { ref, onMounted } from 'vue';
import AuthorService from '@/services/AuthorService';

export default {
  name: 'EditAuthorModal',

  props: {
    author: {
      type: Object,
      required: true,
    },
  },

  emits: ['close', 'author-updated'],

  setup(props, { emit }) {
    const authorData = ref({
      id: null,
      firstName: '',
      lastName: '',
      biography: '',
      birthDate: '',
      nationality: '',
      website: '',
      photoUrl: '',
      photo: null,
      address: '',
      phone: '',
      username: '',
      email: '',
      password: '',
    });

    const imagePreview = ref(null);
    const isSubmitting = ref(false);

    onMounted(() => {
      // Copier les données de l'auteur pour éviter de modifier directement les props
      authorData.value = {
        ...props.author,
        photo: null, // Réinitialiser la photo pour éviter de l'envoyer inutilement
        password: '', // Réinitialiser le mot de passe pour éviter de l'envoyer inutilement
      };

      // Formater la date si nécessaire
      if (authorData.value.birthDate) {
        const date = new Date(authorData.value.birthDate);
        authorData.value.birthDate = date.toISOString().split('T')[0];
      }
    });

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

        // Appel au service pour mettre à jour l'auteur
        const response = await AuthorService.updateAuthor(
          authorData.value.id,
          authorData.value
        );

        console.log('Auteur mis à jour:', response.data);

        emit('author-updated', response.data);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'auteur:", error);
        // Gérer les erreurs (afficher un message, etc.)
        alert(
          "Une erreur est survenue lors de la mise à jour de l'auteur. Veuillez réessayer."
        );
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      authorData,
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
</style>
