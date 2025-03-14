<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter une catégorie</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Nom de la catégorie *</label>
            <input type="text" id="name" v-model="category.name" required />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="category.description"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="icon">Icône</label>
            <div class="icon-selector">
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-book' }"
                @click="category.icon = 'fas fa-book'"
              >
                <i class="fas fa-book"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-bookmark' }"
                @click="category.icon = 'fas fa-bookmark'"
              >
                <i class="fas fa-bookmark"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-glasses' }"
                @click="category.icon = 'fas fa-glasses'"
              >
                <i class="fas fa-glasses"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-graduation-cap' }"
                @click="category.icon = 'fas fa-graduation-cap'"
              >
                <i class="fas fa-graduation-cap"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-heart' }"
                @click="category.icon = 'fas fa-heart'"
              >
                <i class="fas fa-heart"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-magic' }"
                @click="category.icon = 'fas fa-magic'"
              >
                <i class="fas fa-magic"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-music' }"
                @click="category.icon = 'fas fa-music'"
              >
                <i class="fas fa-music"></i>
              </button>
              <button
                type="button"
                class="icon-choice"
                :class="{ active: category.icon === 'fas fa-theater-masks' }"
                @click="category.icon = 'fas fa-theater-masks'"
              >
                <i class="fas fa-theater-masks"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="color">Couleur (optionnel)</label>
            <input type="color" id="color" v-model="category.color" />
          </div>

          <div class="form-group">
            <label for="parent">Catégorie parente (optionnel)</label>
            <select id="parent" v-model="category.parentId">
              <option value="">Aucune (catégorie principale)</option>
              <option
                v-for="cat in availableParentCategories"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enregistrement...' : 'Ajouter la catégorie' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AddCategoryModal',

  emits: ['close', 'category-added'],

  setup(props, { emit }) {
    const category = ref({
      name: '',
      description: '',
      icon: 'fas fa-book',
      color: '#3f51b5',
      parentId: '',
      booksCount: 0,
      activeBooks: 0,
    });

    const isSubmitting = ref(false);

    // Simulation des catégories disponibles pour sélection comme parent
    const availableParentCategories = ref([
      { id: 1, name: 'Romans' },
      { id: 2, name: 'Livres académiques' },
      { id: 3, name: 'Littérature étrangère' },
    ]);

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // Simulation d'appel API
        // En production, on appellerait un service ou une API pour créer la catégorie
        // await categoryService.addCategory(category.value);

        console.log('Catégorie ajoutée:', category.value);

        // Simuler un délai pour l'enregistrement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Ajouter un ID à la catégorie (normalement généré par le backend)
        const newCategory = {
          ...category.value,
          id: Date.now(),
        };

        emit('category-added', newCategory);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de l'ajout de la catégorie:", error);
        // Gérer les erreurs (afficher un message, etc.)
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      category,
      availableParentCategories,
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
  width: 500px;
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

input[type='color'] {
  height: 40px;
  padding: 0.25rem;
}

.icon-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.icon-choice {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 1.25rem;
  color: #666;
  transition: all 0.3s;
}

.icon-choice:hover {
  background-color: #f5f5f5;
}

.icon-choice.active {
  border-color: #3f51b5;
  background-color: #e8eaf6;
  color: #3f51b5;
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
