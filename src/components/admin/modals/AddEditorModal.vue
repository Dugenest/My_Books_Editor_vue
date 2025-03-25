<template>
  <div class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter un éditeur</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Nom de l'éditeur *</label>
            <input
              type="text"
              id="name"
              v-model="name"
              placeholder="Nom de l'éditeur"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="description"
              rows="4"
              placeholder="Description de l'éditeur"
            ></textarea>
          </div>

          <div v-if="errors.length > 0" class="error-messages">
            <p v-for="(error, index) in errors" :key="index" class="error-text">
              {{ error }}
            </p>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import EditorService from '@/services/EditorService';

export default {
  name: 'AddEditorModal',

  emits: ['close', 'editor-added'],

  setup(props, { emit }) {
    // États du formulaire
    const name = ref('');
    const description = ref('');
    const errors = ref([]);
    const isSubmitting = ref(false);

    // Gérer la soumission du formulaire
    const handleSubmit = async () => {
      errors.value = [];
      isSubmitting.value = true;

      try {
        // Valider les entrées
        if (!name.value.trim()) {
          errors.value.push("Le nom de l'éditeur est requis");
          isSubmitting.value = false;
          return;
        }

        // Préparer les données
        const editorData = {
          company: name.value.trim(), // Name devient company dans la BDD
          description: description.value.trim(),
        };

        // Envoyer à l'API
        const response = await EditorService.addEditor(editorData);

        // Émettre l'événement de succès
        emit('editor-added', response.data);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'éditeur:", error);

        // Gérer les erreurs
        if (error.response && error.response.data) {
          const errorMessage =
            error.response.data.message ||
            "Erreur lors de l'ajout de l'éditeur";
          errors.value.push(errorMessage);
        } else {
          errors.value.push('Erreur lors de la communication avec le serveur');
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      name,
      description,
      errors,
      isSubmitting,
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
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.error-messages {
  background-color: #ffebee;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.error-text {
  color: #d32f2f;
  margin: 0.25rem 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-submit {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-submit:hover {
  background-color: #1565c0;
}

.btn-submit:disabled {
  background-color: #90caf9;
  cursor: not-allowed;
}
</style>
