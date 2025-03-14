<!-- BooksSection.vue - Composant de gestion des livres -->
<template>
  <section class="books-section">
    <div class="section-header">
      <h2>Gestion des livres</h2>
      <button class="btn-primary" @click="$emit('add')">
        <i class="fas fa-plus"></i>
        Ajouter un livre
      </button>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="localBookFilters.search"
          placeholder="Rechercher un livre..."
          @input="applyFilters"
        />
      </div>

      <select v-model="localBookFilters.category" @change="applyFilters">
        <option value="">Toutes les catégories</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
        >
          {{ category.name }}
        </option>
      </select>

      <select v-model="localBookFilters.status" @change="applyFilters">
        <option value="">Tous les statuts</option>
        <option value="in_stock">En stock</option>
        <option value="low_stock">Stock faible</option>
        <option value="out_of_stock">Rupture de stock</option>
      </select>
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
            <th>Couverture</th>
            <th @click="sortData('title')">
              Titre
              <i class="fas" :class="getSortIcon('title')"></i>
            </th>
            <th @click="sortData('author')">
              Auteur
              <i class="fas" :class="getSortIcon('author')"></i>
            </th>
            <th @click="sortData('price')">
              Prix
              <i class="fas" :class="getSortIcon('price')"></i>
            </th>
            <th @click="sortData('stock')">
              Stock
              <i class="fas" :class="getSortIcon('stock')"></i>
            </th>
            <th>Catégories</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>
              <input
                type="checkbox"
                :value="book.id"
                v-model="localSelectedBooks"
                @change="updateSelection"
              />
            </td>
            <td>
              <img
                :src="book.coverImage || '/default-cover.png'"
                :alt="book.title"
                class="book-thumbnail"
              />
            </td>
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ formatPrice(book.price) }}</td>
            <td>
              <span class="stock-badge" :class="getStockStatus(book.stock)">
                {{ book.stock }}
              </span>
            </td>
            <td>
              <div class="category-tags">
                <span
                  v-for="category in book.categories"
                  :key="category.id"
                  class="category-tag"
                >
                  {{ category.name }}
                </span>
              </div>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  class="btn-icon"
                  @click="$emit('edit', book)"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn-icon delete"
                  @click="$emit('delete', book)"
                  title="Supprimer"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="books.length === 0">
            <td colspan="8" class="no-data">Aucun livre trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
        class="btn-page"
        :disabled="bookPagination.currentPage === 1"
        @click="$emit('change-page', bookPagination.currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        Page {{ bookPagination.currentPage }} sur
        {{ bookPagination.totalPages }}
      </span>
      <button
        class="btn-page"
        :disabled="bookPagination.currentPage === bookPagination.totalPages"
        @click="$emit('change-page', bookPagination.currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'BooksSection',

  props: {
    books: {
      type: Array,
      required: true,
    },
    categories: {
      type: Array,
      required: true,
    },
    bookFilters: {
      type: Object,
      required: true,
    },
    bookSort: {
      type: Object,
      required: true,
    },
    bookPagination: {
      type: Object,
      required: true,
    },
    selectedBooks: {
      type: Array,
      required: true,
    },
    selectAllBooks: {
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
  ],

  setup(props, { emit }) {
    // Créer des copies locales des données pour la gestion interne
    const localBookFilters = ref({ ...props.bookFilters });
    const localSelectedBooks = ref([...props.selectedBooks]);
    const localSelectAll = ref(props.selectAllBooks);

    // Synchroniser les props avec les états locaux
    watch(
      () => props.bookFilters,
      (newFilters) => {
        localBookFilters.value = { ...newFilters };
      }
    );

    watch(
      () => props.selectedBooks,
      (newSelection) => {
        localSelectedBooks.value = [...newSelection];
      }
    );

    watch(
      () => props.selectAllBooks,
      (newValue) => {
        localSelectAll.value = newValue;
      }
    );

    // Fonctions
    const applyFilters = () => {
      emit('apply-filters', localBookFilters.value);
    };

    const sortData = (field) => {
      emit('sort', field);
    };

    const toggleAll = () => {
      emit('toggle-all', localSelectAll.value);
    };

    const updateSelection = () => {
      emit('selection-change', localSelectedBooks.value);
    };

    const getSortIcon = (field) => {
      if (props.bookSort.field !== field) {
        return 'fa-sort';
      }

      return props.bookSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    const getStockStatus = (stock) => {
      if (stock <= 0) return 'out-of-stock';
      if (stock < 10) return 'low-stock';
      return 'in-stock';
    };

    return {
      localBookFilters,
      localSelectedBooks,
      localSelectAll,
      applyFilters,
      sortData,
      toggleAll,
      updateSelection,
      getSortIcon,
      formatPrice,
      getStockStatus,
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

.book-thumbnail {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.stock-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.stock-badge.in-stock {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stock-badge.low-stock {
  background-color: #fff3e0;
  color: #e65100;
}

.stock-badge.out-of-stock {
  background-color: #ffebee;
  color: #d32f2f;
}

.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-tag {
  padding: 0.25rem 0.5rem;
  background-color: #f5f5f5;
  border-radius: 12px;
  font-size: 0.875rem;
  color: #666;
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
