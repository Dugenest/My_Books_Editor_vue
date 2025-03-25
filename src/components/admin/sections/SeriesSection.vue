<template>
  <div class="series-section">
    <div class="section-header">
      <h2>Gestion des Séries</h2>
      <button @click="openAddSeriesModal" class="btn-add">
        <i class="fas fa-plus"></i> Ajouter une série
      </button>
    </div>

    <div v-if="loading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i> Chargement des séries...
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-else-if="!series.length" class="empty-state">
      <i class="fas fa-book"></i>
      <p>Aucune série n'a été créée pour le moment.</p>
      <button @click="openAddSeriesModal" class="btn-primary">
        Créer une série
      </button>
    </div>

    <div v-else class="series-list">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Nombre de livres</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in series" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.title }}</td>
            <td>{{ truncateText(item.description, 50) }}</td>
            <td>{{ item.bookCount || 0 }}</td>
            <td class="actions">
              <button
                @click="viewSeries(item)"
                class="btn-icon btn-view"
                title="Voir les détails"
              >
                <i class="fas fa-eye"></i>
              </button>
              <button
                @click="editSeries(item)"
                class="btn-icon btn-edit"
                title="Modifier"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="confirmDeleteSeries(item)"
                class="btn-icon btn-delete"
                title="Supprimer"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
          class="btn-page"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <span class="page-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>

        <button
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
          class="btn-page"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal pour ajouter/modifier une série -->
    <div v-if="showSeriesModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editMode ? 'Modifier la série' : 'Ajouter une série' }}</h3>
          <button @click="closeSeriesModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="seriesTitle">Titre</label>
            <input
              type="text"
              id="seriesTitle"
              v-model="seriesForm.title"
              placeholder="Titre de la série"
              required
            />
          </div>

          <div class="form-group">
            <label for="seriesDescription">Description</label>
            <textarea
              id="seriesDescription"
              v-model="seriesForm.description"
              placeholder="Description de la série"
              rows="4"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Livres dans la série</label>
            <div class="book-selection">
              <div v-if="loadingBooks" class="loading-message">
                Chargement des livres...
              </div>
              <div v-else>
                <div
                  v-for="book in availableBooks"
                  :key="book.id"
                  class="book-item"
                >
                  <input
                    type="checkbox"
                    :id="`book-${book.id}`"
                    :value="book.id"
                    v-model="seriesForm.bookIds"
                  />
                  <label :for="`book-${book.id}`">{{ book.title }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeSeriesModal" class="btn-secondary">
            Annuler
          </button>
          <button @click="saveSeries" class="btn-primary" :disabled="saving">
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button @click="cancelDelete" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p>
            Êtes-vous sûr de vouloir supprimer la série "{{ seriesForm.title }}"
            ?
          </p>
          <p class="warning">Cette action est irréversible.</p>
        </div>

        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-secondary">Annuler</button>
          <button @click="deleteSeries" class="btn-danger" :disabled="deleting">
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'SeriesSection',

  setup() {
    // États
    const series = ref([]);
    const availableBooks = ref([]);
    const loading = ref(true);
    const loadingBooks = ref(false);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);

    // États pour les modales
    const showSeriesModal = ref(false);
    const showDeleteModal = ref(false);
    const editMode = ref(false);
    const saving = ref(false);
    const deleting = ref(false);

    // Formulaire
    const seriesForm = ref({
      id: null,
      title: '',
      description: '',
      bookIds: [],
    });

    // Méthodes
    const fetchSeries = async (page = 1) => {
      loading.value = true;
      error.value = null;
      currentPage.value = page;

      try {
        // Simule une requête API
        setTimeout(() => {
          // Données factices
          const mockSeries = [
            {
              id: 1,
              title: 'Harry Potter',
              description: 'Série de livres sur un jeune sorcier',
              bookCount: 7,
            },
            {
              id: 2,
              title: 'Le Seigneur des Anneaux',
              description: 'Épopée de fantasy sur la Terre du Milieu',
              bookCount: 3,
            },
          ];

          series.value = mockSeries;
          totalPages.value = 1;
          loading.value = false;
        }, 500);
      } catch (err) {
        console.error('Erreur lors du chargement des séries:', err);
        error.value =
          'Impossible de charger les séries. Veuillez réessayer plus tard.';
        loading.value = false;
      }
    };

    const fetchBooks = async () => {
      loadingBooks.value = true;

      try {
        // Simule une requête API
        setTimeout(() => {
          // Données factices
          availableBooks.value = [
            { id: 1, title: "Harry Potter à l'école des sorciers" },
            { id: 2, title: 'Harry Potter et la Chambre des secrets' },
            { id: 3, title: 'Le Hobbit' },
            { id: 4, title: "La Communauté de l'Anneau" },
          ];
          loadingBooks.value = false;
        }, 500);
      } catch (err) {
        console.error('Erreur lors du chargement des livres:', err);
        loadingBooks.value = false;
      }
    };

    const changePage = (page) => {
      currentPage.value = page;
      fetchSeries(page);
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
    };

    const openAddSeriesModal = () => {
      editMode.value = false;
      seriesForm.value = {
        id: null,
        title: '',
        description: '',
        bookIds: [],
      };
      fetchBooks();
      showSeriesModal.value = true;
    };

    const editSeries = (item) => {
      editMode.value = true;
      seriesForm.value = {
        id: item.id,
        title: item.title,
        description: item.description,
        bookIds: [], // Ce serait à charger depuis l'API
      };
      fetchBooks();
      showSeriesModal.value = true;
    };

    const viewSeries = (item) => {
      // Logique pour afficher les détails d'une série
      console.log('Afficher les détails de la série:', item);
      // En production, redirigez vers une page de détails
    };

    const closeSeriesModal = () => {
      showSeriesModal.value = false;
    };

    const saveSeries = async () => {
      if (!seriesForm.value.title.trim()) {
        alert('Le titre de la série est obligatoire.');
        return;
      }

      saving.value = true;

      try {
        // Simuler une requête API
        setTimeout(() => {
          if (editMode.value) {
            // Mise à jour d'une série existante (simulation)
            const index = series.value.findIndex(
              (item) => item.id === seriesForm.value.id
            );
            if (index !== -1) {
              series.value[index] = {
                ...series.value[index],
                title: seriesForm.value.title,
                description: seriesForm.value.description,
              };
            }
          } else {
            // Ajout d'une nouvelle série (simulation)
            const newSeries = {
              id: Date.now(), // Utiliser un ID temporaire
              title: seriesForm.value.title,
              description: seriesForm.value.description,
              bookCount: seriesForm.value.bookIds.length,
            };
            series.value.push(newSeries);
          }

          closeSeriesModal();
          saving.value = false;
        }, 500);
      } catch (err) {
        console.error("Erreur lors de l'enregistrement de la série:", err);
        alert(
          "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
        );
        saving.value = false;
      }
    };

    const confirmDeleteSeries = (item) => {
      seriesForm.value = {
        id: item.id,
        title: item.title,
      };
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      showDeleteModal.value = false;
    };

    const deleteSeries = async () => {
      deleting.value = true;

      try {
        // Simuler une requête API
        setTimeout(() => {
          // Suppression (simulation)
          series.value = series.value.filter(
            (item) => item.id !== seriesForm.value.id
          );

          showDeleteModal.value = false;
          deleting.value = false;
        }, 500);
      } catch (err) {
        console.error('Erreur lors de la suppression de la série:', err);
        alert(
          'Une erreur est survenue lors de la suppression. Veuillez réessayer.'
        );
        deleting.value = false;
      }
    };

    // Cycle de vie
    onMounted(() => {
      fetchSeries();
    });

    return {
      series,
      availableBooks,
      loading,
      loadingBooks,
      error,
      currentPage,
      totalPages,
      showSeriesModal,
      showDeleteModal,
      editMode,
      saving,
      deleting,
      seriesForm,

      fetchSeries,
      changePage,
      truncateText,
      openAddSeriesModal,
      editSeries,
      viewSeries,
      closeSeriesModal,
      saveSeries,
      confirmDeleteSeries,
      cancelDelete,
      deleteSeries,
    };
  },
};
</script>

<style scoped>
.series-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.btn-add {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-add:hover {
  background-color: #45a049;
}

.loading-indicator,
.error-message,
.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #ccc;
}

.error-message {
  color: #f44336;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
}

.btn-view {
  color: #2196f3;
}

.btn-edit {
  color: #ff9800;
}

.btn-delete {
  color: #f44336;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-page {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.book-selection {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0.5rem;
}

.book-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.book-item label {
  margin-left: 0.5rem;
  margin-bottom: 0;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.warning {
  color: #f44336;
  font-weight: 500;
}

.loading-message {
  text-align: center;
  padding: 1rem;
  color: #666;
  font-style: italic;
}
</style>
