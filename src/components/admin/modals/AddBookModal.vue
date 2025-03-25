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
          <div class="form-group">
            <label for="title">Titre <span class="required">*</span></label>
            <input
              type="text"
              id="title"
              v-model="book.title"
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
                v-model="book.ISBN"
                placeholder="Numéro ISBN"
              />
            </div>
            <div class="form-group">
              <label for="price">Prix <span class="required">*</span></label>
              <input
                type="number"
                id="price"
                v-model="book.price"
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
                v-model="book.stock"
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
                v-model="book.publication_date"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="detail">Description détaillée</label>
            <textarea
              id="detail"
              v-model="book.detail"
              rows="4"
              placeholder="Description détaillée du livre"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="author">Auteur <span class="required">*</span></label>
              <select id="author" v-model="book.author.id" required>
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
            <select id="editor" v-model="book.editor.id">
              <option value="">-- Sélectionner un éditeur --</option>
              <option
                v-for="editor in editors"
                :key="editor.id"
                :value="editor.id"
              >
                {{ editor.company || 'Éditeur #' + editor.id }}
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
              {{ isSubmitting ? 'Enregistrement...' : 'Ajouter le livre' }}
            </button>
          </div>
        </form>
        <div v-if="categories && categories.length === 0" class="form-alert">
          Aucune catégorie chargée
        </div>
        <div v-if="editors && editors.length === 0" class="form-alert">
          Aucun éditeur chargé
        </div>

        <div
          v-if="
            (categories && categories.length > 0) ||
            (editors && editors.length > 0)
          "
          class="debug-info"
        >
          <details>
            <summary>Informations de débogage</summary>
            <p>Catégories: {{ categories ? categories.length : 0 }}</p>
            <p>Éditeurs: {{ editors ? editors.length : 0 }}</p>
            <ul>
              <li v-for="(cat, index) in categories" :key="'cat-' + index">
                {{ cat.id }} - {{ cat.name }}
              </li>
            </ul>
            <ul>
              <li v-for="(ed, index) in editors" :key="'ed-' + index">
                {{ ed.id }} - {{ ed.companyId || 'Sans nom' }}
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
      publication_date: null, // Champ correspondant à la BDD
      picture: null,
      author: { id: null },
      editor: { id: null },
      category: { id: null }, // Catégorie principale
      user: { id: null }, // L'administrateur qui ajoute le livre
    });

    const authors = ref([]);
    const categories = ref([]);
    const editors = ref([]);
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
      errors.value = [];

      if (!validateForm()) {
        return;
      }

      try {
        isSubmitting.value = true;

        // Préparer les données du livre en JSON
        const bookData = {
          title: book.value.title,
          detail: book.value.detail || '',
          price: parseFloat(book.value.price),
          stock: parseInt(book.value.stock),
          ISBN: book.value.ISBN || '',
          publication_date: book.value.publication_date || null,
          authorId: book.value.author.id,
          editorId: book.value.editor.id,
          categoryIds: selectedCategories.value,
          userId: JSON.parse(localStorage.getItem('user'))?.id,
        };

        // Pour déboguer
        console.log('Données du livre à envoyer:', bookData);

        // Appel du service pour ajouter le livre
        const response = await BookService.addBook(bookData);
        console.log('Réponse du serveur:', response);

        // Si une image est présente, l'envoyer séparément
        if (book.value.picture) {
          const imageFormData = new FormData();
          imageFormData.append('file', book.value.picture);

          // Logs de débogage
          console.log('Type de fichier:', book.value.picture.type);
          console.log('Taille du fichier:', book.value.picture.size);
          console.log('Nom du fichier:', book.value.picture.name);

          await BookService.uploadBookImage(response.data.id, imageFormData);
        }

        emit('book-added', response.data);
        emit('close');
      } catch (error) {
        console.error("Erreur lors de l'ajout du livre:", error);

        // Gestion des erreurs côté serveur
        if (error.response && error.response.data) {
          const errorMessage =
            error.response.data.message || "Erreur lors de l'ajout du livre";
          errors.value.push(errorMessage);
        } else {
          errors.value.push('Erreur lors de la communication avec le serveur');
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    // Chargement initial des données
    const fetchAuthors = async () => {
      try {
        const response = await AuthorService.getAuthors();
        authors.value = Array.isArray(response)
          ? response
          : response.data?.content || response.data || [];
        console.log('Auteurs chargés:', authors.value);
      } catch (error) {
        console.error('Erreur lors du chargement des auteurs:', error);
        errors.value.push('Impossible de charger la liste des auteurs');
        authors.value = [];
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await CategoryService.getCategories();
        // Vérifier si data est un tableau ou une réponse axios
        categories.value = Array.isArray(data) ? data : data.data || [];
        console.log('Catégories chargées:', categories.value);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        errors.value.push('Impossible de charger la liste des catégories');
        categories.value = []; // Initialiser avec un tableau vide en cas d'erreur
      }
    };

    const fetchEditors = async () => {
      try {
        console.log('Début du chargement des éditeurs...');
        const response = await EditorService.getEditors();
        console.log('Réponse brute des éditeurs:', response);

        // Analyser la structure de la réponse et extraire les données
        let extractedEditors = [];

        if (Array.isArray(response)) {
          extractedEditors = response;
          console.log('Éditeurs détectés comme un tableau direct');
        } else if (response && typeof response === 'object') {
          if (response.data) {
            if (Array.isArray(response.data)) {
              extractedEditors = response.data;
              console.log('Éditeurs détectés comme response.data (tableau)');
            } else if (
              response.data.content &&
              Array.isArray(response.data.content)
            ) {
              extractedEditors = response.data.content;
              console.log(
                'Éditeurs détectés comme response.data.content (tableau paginé)'
              );
            } else {
              extractedEditors = [response.data];
              console.log('Éditeurs détectés comme un objet unique');
            }
          }
        }

        console.log('Éditeurs extraits:', extractedEditors);
        editors.value = extractedEditors;
      } catch (error) {
        console.error(
          'Erreur détaillée lors du chargement des éditeurs:',
          error
        );
        editors.value = [];
      }
    };

    onMounted(() => {
      fetchAuthors();
      fetchCategories();
      fetchEditors();
    });

    return {
      book,
      authors,
      categories,
      editors,
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
.multi-select {
  min-height: 100px;
}

.form-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.form-alert {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.debug-info {
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px dashed #ccc;
  border-radius: 4px;
  background-color: #f8f9fa;
}

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

.required {
  color: #f44336;
}

.form-errors {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
}

.form-errors ul {
  margin: 0;
  padding-left: 1.5rem;
}
</style>
