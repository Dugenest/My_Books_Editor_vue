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
            <label for="title">Titre <span class="required">*</span></label>
            <input
              type="text"
              id="title"
              v-model="bookCopy.title"
              required
              placeholder="Titre du livre"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="isbn">ISBN</label>
              <input
                type="text"
                id="isbn"
                v-model="bookCopy.ISBN"
                placeholder="Numéro ISBN"
              />
            </div>
            <div class="form-group">
              <label for="price">Prix <span class="required">*</span></label>
              <input
                type="number"
                id="price"
                v-model="bookCopy.price"
                step="0.01"
                min="0"
                required
                placeholder="Prix"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="stock">Stock <span class="required">*</span></label>
              <input
                type="number"
                id="stock"
                v-model="bookCopy.stock"
                min="0"
                required
                placeholder="Quantité en stock"
              />
            </div>
            <div class="form-group">
              <label for="publication_date">Date de publication</label>
              <input
                type="date"
                id="publication_date"
                v-model="bookCopy.publication_date"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="detail">Description détaillée</label>
            <textarea
              id="detail"
              v-model="bookCopy.detail"
              rows="4"
              placeholder="Description détaillée du livre"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="author">Auteur <span class="required">*</span></label>
              <select id="author" v-model="bookCopy.author.id" required>
                <option value="">-- Sélectionner un auteur --</option>
                <option
                  v-for="author in authors"
                  :key="author.id"
                  :value="author.id"
                >
                  {{ author.firstName }} {{ author.lastName }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="editor">Éditeur</label>
            <select id="editor" v-model="bookCopy.editor.id">
              <option value="">-- Sélectionner un éditeur --</option>
              <option
                v-for="editor in editors"
                :key="editor.id"
                :value="editor.id"
              >
                {{ editor.company || editor.name || 'Éditeur #' + editor.id }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="categories">Catégories</label>
            <select
              id="categories"
              v-model="selectedCategories"
              multiple
              class="multi-select"
            >
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
            <div class="form-hint">
              Maintenez Ctrl/Cmd pour sélectionner plusieurs catégories
            </div>
          </div>

          <div class="form-group">
            <label for="picture">Image de couverture</label>
            <div class="file-upload">
              <input
                type="file"
                id="picture"
                accept="image/*"
                @change="handleImageUpload"
              />
              <p>Glissez-déposez une image ou cliquez pour parcourir</p>
            </div>
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Aperçu de l'image" />
            </div>
            <div v-else-if="bookCopy.picture" class="image-preview">
              <img :src="bookCopy.picture" alt="Couverture actuelle" />
              <p class="existing-image-note">Image actuelle</p>
            </div>
          </div>

          <div v-if="errors.length > 0" class="form-errors">
            <ul>
              <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
            </ul>
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
        <div
          v-if="categories && categories.length === 0"
          class="form-alert warning"
        >
          <i class="fas fa-exclamation-triangle"></i> Aucune catégorie chargée.
          Vérifiez la connexion au serveur.
        </div>
        <div v-if="editors && editors.length === 0" class="form-alert warning">
          <i class="fas fa-exclamation-triangle"></i> Aucun éditeur chargé.
          Vérifiez la connexion au serveur.
        </div>
        <div v-if="authors && authors.length === 0" class="form-alert warning">
          <i class="fas fa-exclamation-triangle"></i> Aucun auteur chargé.
          Vérifiez la connexion au serveur.
        </div>

        <div
          v-if="
            (categories && categories.length > 0) ||
            (editors && editors.length > 0) ||
            (authors && authors.length > 0)
          "
          class="debug-info"
        >
          <details>
            <summary>Informations de débogage</summary>
            <p>Catégories: {{ categories ? categories.length : 0 }}</p>
            <p>Éditeurs: {{ editors ? editors.length : 0 }}</p>
            <p>Auteurs: {{ authors ? authors.length : 0 }}</p>
            <ul>
              <li v-for="(cat, index) in categories" :key="'cat-' + index">
                {{ cat.id }} - {{ cat.name }}
              </li>
            </ul>
            <ul>
              <li v-for="(ed, index) in editors" :key="'ed-' + index">
                {{ ed.id }} - {{ ed.company || ed.name || 'Sans nom' }}
              </li>
            </ul>
            <ul>
              <li v-for="(aut, index) in authors" :key="'aut-' + index">
                {{ aut.id }} - {{ aut.firstName }} {{ aut.lastName }}
              </li>
            </ul>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import BookService from '@/services/BookService';
import AuthorService from '@/services/AuthorService';
import CategoryService from '@/services/CategoryService';
import EditorService from '@/services/EditorService';

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
    // Copie pour édition
    const bookCopy = ref({
      id: props.book.id,
      title: props.book.title || '',
      detail: props.book.detail || '',
      price: props.book.price || null,
      stock: props.book.stock || null,
      ISBN: props.book.ISBN || '',
      publication_date: props.book.publication_date || null,
      picture: props.book.picture || null,
      author: { id: props.book.author?.id || null },
      editor: { id: props.book.editor?.id || null },
      user: { id: null }, // L'administrateur qui modifie le livre
    });

    const authors = ref([]);
    const categories = ref([]);
    const editors = ref([]);
    const selectedCategories = ref([]);
    const imagePreview = ref(null);
    const isSubmitting = ref(false);
    const errors = ref([]);

    // Si le livre a des catégories, les extraire
    onMounted(() => {
      if (props.book.categories && Array.isArray(props.book.categories)) {
        selectedCategories.value = props.book.categories.map((cat) => cat.id);
      }
      fetchAuthors();
      fetchCategories();
      fetchEditors();
    });

    // Validation du formulaire
    const isFormValid = computed(() => {
      return (
        bookCopy.value.title.trim() &&
        bookCopy.value.author.id &&
        bookCopy.value.price > 0 &&
        bookCopy.value.stock !== null
      );
    });

    // Validation détaillée
    const validateForm = () => {
      errors.value = [];

      if (!bookCopy.value.title.trim()) {
        errors.value.push('Le titre est obligatoire');
      }

      if (!bookCopy.value.author.id) {
        errors.value.push('Veuillez sélectionner un auteur');
      }

      if (!bookCopy.value.price || bookCopy.value.price <= 0) {
        errors.value.push('Le prix doit être supérieur à 0');
      }

      if (bookCopy.value.stock === null || bookCopy.value.stock < 0) {
        errors.value.push('Le stock doit être un nombre positif');
      }

      return errors.value.length === 0;
    };

    // Récupérer les auteurs
    const fetchAuthors = async () => {
      try {
        const response = await AuthorService.getAuthors();
        console.log('Réponse brute du service des auteurs:', response);

        if (response) {
          // La source des auteurs
          let authorsSource = null;

          // Vérifier toutes les possibilités
          if (response.data && Array.isArray(response.data)) {
            authorsSource = response.data;
          } else if (
            response.data &&
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            authorsSource = response.data.content;
          } else if (Array.isArray(response)) {
            authorsSource = response;
          } else if (response.content && Array.isArray(response.content)) {
            authorsSource = response.content;
          }

          if (authorsSource && authorsSource.length > 0) {
            authors.value = authorsSource;
            console.log(
              '✅ Auteurs chargés avec succès:',
              authors.value.length
            );
          } else {
            console.warn('⚠️ Aucun auteur trouvé dans la réponse');
            errors.value.push('Format de réponse des auteurs invalide');
          }
        } else {
          console.error('❌ Réponse du service des auteurs vide');
          errors.value.push('Impossible de charger les auteurs (réponse vide)');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des auteurs:', error);
        errors.value.push(
          'Impossible de charger la liste des auteurs: ' +
            (error.message || 'Erreur inconnue')
        );
      }
    };

    // Récupérer les catégories
    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getCategories();
        console.log('Réponse brute du service des catégories:', response);

        if (response) {
          // La source des catégories
          let categoriesSource = null;

          // Vérifier toutes les possibilités
          if (response.data && Array.isArray(response.data)) {
            categoriesSource = response.data;
          } else if (
            response.data &&
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            categoriesSource = response.data.content;
          } else if (Array.isArray(response)) {
            categoriesSource = response;
          } else if (response.content && Array.isArray(response.content)) {
            categoriesSource = response.content;
          }

          if (categoriesSource && categoriesSource.length > 0) {
            categories.value = categoriesSource;
            console.log(
              '✅ Catégories chargées avec succès:',
              categories.value.length
            );
          } else {
            console.warn('⚠️ Aucune catégorie trouvée dans la réponse');
            errors.value.push('Format de réponse des catégories invalide');
          }
        } else {
          console.error('❌ Réponse du service des catégories vide');
          errors.value.push(
            'Impossible de charger les catégories (réponse vide)'
          );
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        errors.value.push(
          'Impossible de charger la liste des catégories: ' +
            (error.message || 'Erreur inconnue')
        );
      }
    };

    // Récupérer les éditeurs
    const fetchEditors = async () => {
      try {
        const response = await EditorService.getEditors();
        console.log('Réponse brute du service des éditeurs:', response);

        if (response) {
          // La source des éditeurs
          let editorsSource = null;

          // Vérifier toutes les possibilités
          if (response.data && Array.isArray(response.data)) {
            editorsSource = response.data;
          } else if (
            response.data &&
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            editorsSource = response.data.content;
          } else if (Array.isArray(response)) {
            editorsSource = response;
          } else if (response.content && Array.isArray(response.content)) {
            editorsSource = response.content;
          }

          if (editorsSource && editorsSource.length > 0) {
            editors.value = editorsSource;
            console.log(
              '✅ Éditeurs chargés avec succès:',
              editors.value.length
            );
          } else {
            console.warn('⚠️ Aucun éditeur trouvé dans la réponse');
            errors.value.push('Format de réponse des éditeurs invalide');
          }
        } else {
          console.error('❌ Réponse du service des éditeurs vide');
          errors.value.push(
            'Impossible de charger les éditeurs (réponse vide)'
          );
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des éditeurs:', error);
        errors.value.push(
          'Impossible de charger la liste des éditeurs: ' +
            (error.message || 'Erreur inconnue')
        );
      }
    };

    // Gestion de l'upload d'image
    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        bookCopy.value.picture = file;
        // Créer un aperçu de l'image
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.value = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    };

    // Soumission du formulaire
    const handleSubmit = async () => {
      errors.value = [];

      if (!validateForm()) {
        return;
      }

      try {
        isSubmitting.value = true;

        // Préparer les données du livre en JSON
        const bookData = {
          id: bookCopy.value.id,
          title: bookCopy.value.title,
          detail: bookCopy.value.detail || '',
          price: parseFloat(bookCopy.value.price),
          stock: parseInt(bookCopy.value.stock),
          ISBN: bookCopy.value.ISBN || '',
          publication_date: bookCopy.value.publication_date || null,
          authorId: bookCopy.value.author.id,
          editorId: bookCopy.value.editor.id || null,
          categoryIds: selectedCategories.value || [],
          userId: JSON.parse(localStorage.getItem('user'))?.id,
          // Ne pas inclure de données supplémentaires qui pourraient causer des problèmes avec la session Hibernate
        };

        // Pour déboguer
        console.log('Données du livre à envoyer:', bookData);

        // Appel du service pour modifier le livre
        const response = await BookService.updateBook(
          bookCopy.value.id,
          bookData
        );
        console.log('Réponse du serveur:', response);

        // Si une nouvelle image est présente, l'envoyer séparément
        if (
          bookCopy.value.picture &&
          typeof bookCopy.value.picture !== 'string'
        ) {
          const imageFormData = new FormData();
          imageFormData.append('picture', bookCopy.value.picture);
          await BookService.uploadBookImage(bookCopy.value.id, imageFormData);
        }

        emit('book-updated', response.data);
        emit('close');
      } catch (error) {
        console.error('Erreur lors de la modification du livre:', error);

        if (error.response && error.response.data) {
          const errorMessage =
            error.response.data.message ||
            'Erreur lors de la modification du livre';
          errors.value.push(errorMessage);
        } else {
          errors.value.push('Erreur lors de la communication avec le serveur');
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      bookCopy,
      authors,
      categories,
      editors,
      selectedCategories,
      imagePreview,
      isSubmitting,
      errors,
      isFormValid,
      handleImageUpload,
      handleSubmit,
      validateForm,
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
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
  color: #777;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

form {
  display: grid;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

label {
  font-weight: 500;
  color: #333;
}

.required {
  color: #e53935;
}

input,
select,
textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.multi-select {
  height: auto;
  min-height: 6rem;
}

.form-hint {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
}

.file-upload {
  border: 2px dashed #ddd;
  padding: 1.5rem;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
}

.file-upload input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-upload p {
  margin: 0;
  color: #666;
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

.existing-image-note {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

.form-errors {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.form-errors ul {
  margin: 0;
  padding-left: 1.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-secondary:hover,
.btn-primary:hover {
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-primary:disabled {
  background-color: #bbdefb;
  cursor: not-allowed;
  transform: none;
}

.form-alert {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
}

.form-alert.warning {
  background-color: #fff3cd;
  border-color: #ffeeba;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.debug-info {
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 0.5rem;
}

.debug-info summary {
  cursor: pointer;
  font-weight: 500;
  color: #666;
}

.debug-info ul {
  margin-top: 0.5rem;
  padding-left: 1.25rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
