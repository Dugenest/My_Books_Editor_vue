<!-- AuthorsSection.vue - Composant de gestion des auteurs -->
<template>
  <section class="authors-section">
    <div class="section-header">
      <h2>Gestion des auteurs</h2>
      <div class="header-actions">
        <button class="btn-primary" @click="$emit('add')">
          <i class="fas fa-plus"></i>
          Ajouter un auteur
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="localAuthorFilters.search"
          placeholder="Rechercher un auteur..."
          @input="applyFilters"
        />
      </div>
      <div class="filter-group">
        <select v-model="localAuthorFilters.nationality" @change="applyFilters">
          <option value="">Toutes les nationalités</option>
          <option value="française">Française</option>
          <option value="américaine">Américaine</option>
          <option value="britannique">Britannique</option>
          <option value="autre">Autre</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                v-model="localSelectAll"
                @change="toggleAll"
              />
            </th>
            <th>Photo</th>
            <th @click="sortData('lastName')">
              Nom
              <i class="fas" :class="getSortIcon('lastName')"></i>
            </th>
            <th @click="sortData('firstName')">
              Prénom
              <i class="fas" :class="getSortIcon('firstName')"></i>
            </th>
            <th @click="sortData('nationality')">
              Nationalité
              <i class="fas" :class="getSortIcon('nationality')"></i>
            </th>
            <th @click="sortData('username')">
              Nom d'utilisateur
              <i class="fas" :class="getSortIcon('username')"></i>
            </th>
            <th @click="sortData('email')">
              Email
              <i class="fas" :class="getSortIcon('email')"></i>
            </th>
            <th @click="sortData('booksCount')">
              Livres
              <i class="fas" :class="getSortIcon('booksCount')"></i>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in authors" :key="author.id">
            <td>
              <input
                type="checkbox"
                :value="author.id"
                v-model="localSelectedAuthors"
                @change="updateSelection"
              />
            </td>
            <td>
              <img
                :src="author.photoUrl || '/default-author.png'"
                :alt="author.firstName + ' ' + author.lastName"
                class="author-thumbnail"
              />
            </td>
            <td>{{ author.lastName }}</td>
            <td>{{ author.firstName }}</td>
            <td>{{ author.nationality || '-' }}</td>
            <td>{{ author.username || '-' }}</td>
            <td>{{ author.email || '-' }}</td>
            <td>
              <button
                class="btn-icon"
                @click="$emit('reset-password', author)"
                title="Réinitialiser le mot de passe"
              >
                <i class="fas fa-key"></i>
              </button>
            </td>
            <td>{{ author.booksCount || 0 }}</td>
            <td>
              <div class="action-buttons">
                <button
                  class="btn-icon"
                  @click="$emit('edit', author)"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn-icon delete"
                  @click="$emit('delete', author)"
                  title="Supprimer"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="authors.length === 0">
            <td colspan="10" class="no-data">Aucun auteur trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
        class="btn-page"
        :disabled="authorPagination.currentPage === 1"
        @click="$emit('change-page', authorPagination.currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        Page {{ authorPagination.currentPage }} sur
        {{ authorPagination.totalPages }}
      </span>
      <button
        class="btn-page"
        :disabled="authorPagination.currentPage === authorPagination.totalPages"
        @click="$emit('change-page', authorPagination.currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'AuthorsSection',

  props: {
    authors: {
      type: Array,
      required: true,
    },
    authorFilters: {
      type: Object,
      required: true,
    },
    authorSort: {
      type: Object,
      required: true,
    },
    authorPagination: {
      type: Object,
      required: true,
    },
    selectedAuthors: {
      type: Array,
      required: true,
    },
    selectAllAuthors: {
      type: Boolean,
      required: true,
    },
  },

  emits: [
    'apply-filters',
    'sort',
    'change-page',
    'toggle-all',
    'edit',
    'delete',
    'add',
    'selection-change',
    'reset-password',
  ],

  setup(props, { emit }) {
    // Créer des copies locales des données pour la gestion interne
    const localAuthorFilters = ref({ ...props.authorFilters });
    const localSelectedAuthors = ref([...props.selectedAuthors]);
    const localSelectAll = ref(props.selectAllAuthors);

    // Synchroniser les props avec les états locaux
    watch(
      () => props.authorFilters,
      (newFilters) => {
        localAuthorFilters.value = { ...newFilters };
      }
    );

    watch(
      () => props.selectedAuthors,
      (newSelection) => {
        localSelectedAuthors.value = [...newSelection];
      }
    );

    watch(
      () => props.selectAllAuthors,
      (newValue) => {
        localSelectAll.value = newValue;
      }
    );

    // Fonctions
    const applyFilters = () => {
      emit('apply-filters', localAuthorFilters.value);
    };

    const sortData = (field) => {
      emit('sort', field);
    };

    const toggleAll = () => {
      emit('toggle-all', localSelectAll.value);
    };

    const updateSelection = () => {
      emit('selection-change', localSelectedAuthors.value);
    };

    const getSortIcon = (field) => {
      if (props.authorSort.field !== field) {
        return 'fa-sort';
      }

      return props.authorSort.direction === 'asc'
        ? 'fa-sort-up'
        : 'fa-sort-down';
    };

    return {
      localAuthorFilters,
      localSelectedAuthors,
      localSelectAll,
      applyFilters,
      sortData,
      toggleAll,
      updateSelection,
      getSortIcon,
    };
  },
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  color: #333;
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filters select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  min-width: 150px;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f5f5f5;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.data-table th i {
  margin-left: 0.5rem;
}

.author-thumbnail {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-icon:hover {
  background-color: #f5f5f5;
}

.btn-icon.delete:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-style: italic;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #303f9f;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
}
</style>
