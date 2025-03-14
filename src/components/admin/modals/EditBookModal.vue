<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Modifier le livre</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">Titre *</label>
            <input type="text" id="title" v-model="editedBook.title" required />
          </div>

          <div class="form-group">
            <label for="author">Auteur *</label>
            <input
              type="text"
              id="author"
              v-model="editedBook.author"
              required
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="editedBook.description"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="price">Prix *</label>
              <input
                type="number"
                id="price"
                v-model="editedBook.price"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div class="form-group">
              <label for="stock">Stock *</label>
              <input
                type="number"
                id="stock"
                v-model="editedBook.stock"
                min="0"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="isbn">ISBN</label>
            <input type="text" id="isbn" v-model="editedBook.isbn" />
          </div>

          <div class="form-group">
            <label for="publishDate">Date de publication</label>
            <input
              type="date"
              id="publishDate"
              v-model="editedBook.publishDate"
            />
          </div>

          <div class="form-group">
            <label>Catégories</label>
            <div class="categories-select">
              <div
                v-for="category in categories"
                :key="category.id"
                class="category-checkbox"
              >
                <input
                  type="checkbox"
                  :id="'category-' + category.id"
                  :value="category.id"
                  v-model="editedBook.categoryIds"
                />
                <label :for="'category-' + category.id">{{
                  category.name
                }}</label>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="coverImage">Image de couverture</label>
            <div
              class="current-image"
              v-if="editedBook.coverImage && !imagePreview"
            >
              <img :src="editedBook.coverImage" alt="Couverture actuelle" />
              <button
                type="button"
                class="btn-remove-image"
                @click="removeCurrentImage"
              >
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
            <div class="file-upload">
              <input
                type="file"
                id="coverImage"
                @change="handleImageUpload"
                accept="image/*"
              />
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Aperçu de la couverture" />
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

export default {
  name: 'EditBookModal',

  props: {
    book: {
      type: Object,
      required: true,
    },
  },

  emits: ['close', 'book-updated'],

  setup(props, { emit }) {
    const editedBook = ref({});
    const imagePreview = ref(null);
    const isSubmitting = ref(false);

    // Simulation des catégories disponibles
    const categories = ref([
      { id: 1, name: 'Roman' },
      { id: 2, name: 'Science-Fiction' },
      { id: 3, name: 'Policier' },
      { id: 4, name: 'Jeunesse' },
      { id: 5, name: 'Histoire' },
      { id: 6, name: 'Biographie' },
    ]);

    onMounted(() => {
      // Copier les valeurs du livre pour éviter de modifier l'objet original
      editedBook.value = {
        ...props.book,
        // Convertir les objets catégories en IDs si nécessaire
        categoryIds: props.book.categories
          ? props.book.categories.map((cat) => cat.id)
          : [],
      };
    });

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        editedBook.value.newCoverImage = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const removeCurrentImage = () => {
      editedBook.value.coverImage = null;
    };

    const handleSubmit = async () => {
      try {
        isSubmitting.value = true;

        // Simulation d'appel API
        // En production, on appellerait un service ou une API pour mettre à jour le livre
        // await bookService.updateBook(editedBook.value.id, editedBook.value);

        console.log('Livre modifié:', editedBook.value);

        // Simuler un délai pour l'enregistrement
        await new Promise((resolve) => setTimeout(resolve, 1000));

        emit('book-updated', editedBook.value);
        emit('close');
      } catch (error) {
        console.error('Erreur lors de la modification du livre:', error);
        // Gérer les erreurs (afficher un message, etc.)
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      editedBook,
      categories,
      imagePreview,
      isSubmitting,
      handleImageUpload,
      removeCurrentImage,
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

.categories-select {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  max-height: 150px;
  overflow-y: auto;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-image {
  position: relative;
  margin-bottom: 1rem;
  display: inline-block;
}

.current-image img {
  max-height: 150px;
  max-width: 100%;
  border-radius: 4px;
}

.btn-remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
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
  max-height: 150px;
  max-width: 100%;
  border-radius: 4px;
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
