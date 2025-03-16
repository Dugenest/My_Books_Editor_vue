<!-- src/components/admin/sections/AuthorsSection.vue -->
<template>
  <div class="authors-section">
    <!-- En-tête avec les actions -->
    <div class="section-header">
      <h2>Gestion des auteurs</h2>
      <button class="btn-primary" @click="$emit('add')">
        <i class="fas fa-plus"></i> Ajouter un auteur
      </button>
    </div>

    <!-- Filtres -->
    <div class="filters-section">
      <div class="search-box">
        <input
          type="text"
          v-model="localFilters.search"
          placeholder="Rechercher un auteur..."
          @input="handleFiltersChange"
        />
      </div>
      <div class="filter-box">
        <input
          type="text"
          v-model="localFilters.nationality"
          placeholder="Filtrer par nationalité"
          @input="handleFiltersChange"
        />
      </div>
    </div>

    <!-- Tableau des auteurs -->
    <div class="table-container">
      <table class="authors-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                :checked="selectAllAuthors"
                @change="$emit('toggle-all', $event.target.checked)"
              />
            </th>
            <th @click="handleSort('lastName')">
              Nom
              <i :class="getSortIcon('lastName')"></i>
            </th>
            <th @click="handleSort('firstName')">
              Prénom
              <i :class="getSortIcon('firstName')"></i>
            </th>
            <th>Nationalité</th>
            <th>Date de naissance</th>
            <th>Biographie</th>
            <th>Adresse</th>
            <th>Téléphone</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="author in authors" :key="author.id">
            <td>
              <input
                type="checkbox"
                :checked="selectedAuthors.includes(author.id)"
                @change="handleSelectionChange(author.id)"
              />
            </td>
            <td>{{ author.lastName || 'Non défini' }}</td>
            <td>{{ author.firstName || 'Non défini' }}</td>
            <td>{{ author.nationality || 'Non définie' }}</td>
            <td>{{ formatDate(author.birthDate) }}</td>
            <td class="truncate">{{ author.biography || 'Non définie' }}</td>
            <td>{{ author.address || 'Non définie' }}</td>
            <td>{{ author.phone || 'Non défini' }}</td>
            <td>{{ author.username || 'Non défini' }}</td>
            <td>{{ author.email || 'Non défini' }}</td>
            <td class="actions">
              <button class="btn-icon" @click="$emit('edit', author)">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon" @click="$emit('delete', author)">
                <i class="fas fa-trash"></i>
              </button>
              <button class="btn-icon" @click="$emit('reset-password', author)">
                <i class="fas fa-key"></i>
              </button>
            </td>
          </tr>
          <tr v-if="!authors.length">
            <td colspan="11" class="no-data">Aucun auteur trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="authorPagination.totalPages > 1">
      <button
        :disabled="authorPagination.currentPage === 1"
        @click="$emit('change-page', authorPagination.currentPage - 1)"
      >
        Précédent
      </button>
      <span>
        Page {{ authorPagination.currentPage }} sur
        {{ authorPagination.totalPages }}
      </span>
      <button
        :disabled="authorPagination.currentPage === authorPagination.totalPages"
        @click="$emit('change-page', authorPagination.currentPage + 1)"
      >
        Suivant
      </button>
    </div>
  </div>
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
    'selection-change',
    'edit',
    'delete',
    'add',
    'reset-password',
  ],

  setup(props, { emit }) {
    const localFilters = ref({ ...props.authorFilters });

    // Surveiller les changements de filtres externes
    watch(
      () => props.authorFilters,
      (newFilters) => {
        localFilters.value = { ...newFilters };
      }
    );

    const handleFiltersChange = () => {
      emit('apply-filters', { ...localFilters.value });
    };

    const handleSort = (field) => {
      emit('sort', field);
    };

    const handleSelectionChange = (authorId) => {
      const newSelection = props.selectedAuthors.includes(authorId)
        ? props.selectedAuthors.filter((id) => id !== authorId)
        : [...props.selectedAuthors, authorId];
      emit('selection-change', newSelection);
    };

    const getSortIcon = (field) => {
      if (props.authorSort.field !== field) return 'fas fa-sort';
      return props.authorSort.direction === 'asc'
        ? 'fas fa-sort-up'
        : 'fas fa-sort-down';
    };

    // Fonction pour formater les dates
    const formatDate = (dateString) => {
      if (!dateString) return 'Non définie';

      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';

        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      } catch (error) {
        console.error('Erreur de formatage de date:', error);
        return 'Date invalide';
      }
    };

    return {
      localFilters,
      handleFiltersChange,
      handleSort,
      handleSelectionChange,
      getSortIcon,
      formatDate,
    };
  },
};
</script>

<style scoped>
.authors-section {
  padding: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  color: #333;
}

.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-box,
.filter-box {
  flex: 1;
}

.search-box input,
.filter-box input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
  max-width: 100%;
}

.authors-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  table-layout: fixed;
}

.authors-table th,
.authors-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
  overflow: hidden;
  text-overflow: ellipsis;
}

.authors-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  cursor: pointer;
}

.authors-table th:hover {
  background-color: #e9ecef;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.btn-icon:hover {
  color: #333;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.no-data {
  text-align: center;
  color: #666;
  padding: 2rem !important;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.pagination span {
  color: #666;
}

.truncate {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
