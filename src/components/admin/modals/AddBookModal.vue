<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter un livre</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Vos champs de formulaire existants -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="isSubmitting || !isFormValid"
            >
              {{ isSubmitting ? 'Enregistrement...' : 'Ajouter le livre' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import BookService from '@/services/BookService';
import AuthorService from '@/services/AuthorService';
import CategoryService from '@/services/CategoryService';

export default {
  name: 'AddBookModal',
  emits: ['close', 'book-added'],

  setup(props, { emit }) {
    // Valeurs par défaut avec des vérifications nulles
    const book = ref({
      title: '',
      detail: '',
      price: null,
      stock: null,
      ISBN: '',
      publishDate: null,
      picture: null,
      author: { id: null },
      editor: { id: null },
      categories: [],
    });

    const authors = ref([]);
    const categories = ref([]);
    const selectedCategories = ref([]);
    const imagePreview = ref(null);
    const isSubmitting = ref(false);
    const errors = ref([]);

    // Validation du formulaire
    const isFormValid = computed(() => {
      return (
        book.value.title.trim() &&
        book.value.author.id &&
        book.value.price > 0 &&
        book.value.stock !== null
      );
    });

    // Validation détaillée
    const validateForm = () => {
      errors.value = [];

      if (!book.value.title.trim()) {
        errors.value.push('Le titre est obligatoire');
      }

      if (!book.value.author.id) {
        errors.value.push('Veuillez sélectionner un auteur');
      }

      if (!book.value.price || book.value.price <= 0) {
        errors.value.push('Le prix doit être supérieur à 0');
      }

      if (book.value.stock === null || book.value.stock < 0) {
        errors.value.push('Le stock ne peut pas être négatif');
      }

      return errors.value.length === 0;
    };

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        // Validation de l'image
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (file.size > maxSize) {
          alert('La taille du fichier ne doit pas dépasser 5 Mo');
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          alert('Seuls les fichiers JPEG, PNG et GIF sont autorisés');
          return;
        }

        book.value.picture = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const handleSubmit = async () => {
      // Réinitialiser les erreurs
      errors.value = [];

      // Validation du formulaire
      if (!validateForm()) {
        return;
      }

      try {
        isSubmitting.value = true;

        // Préparer les catégories
        book.value.categories = selectedCategories.value.map((id) => ({ id }));

        // Appel du service pour ajouter le livre
        const response = await BookService.addBook(book.value);

        emit('book-added', response.data);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de l'ajout du livre:", error);

        // Gestion des erreurs côté serveur
        const errorMessage =
          error.response?.data?.message || "Erreur lors de l'ajout du livre";
        errors.value.push(errorMessage);
      } finally {
        isSubmitting.value = false;
      }
    };

    // Chargement initial des données
    const fetchAuthors = async () => {
      try {
        const response = await AuthorService.getAuthors();
        authors.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des auteurs:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getCategories();
        categories.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };

    onMounted(() => {
      fetchAuthors();
      fetchCategories();
    });

    return {
      book,
      authors,
      categories,
      selectedCategories,
      imagePreview,
      isSubmitting,
      isFormValid,
      errors,
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
