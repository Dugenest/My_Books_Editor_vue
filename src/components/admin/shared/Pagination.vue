<!-- Pagination.vue - Composant réutilisable de pagination -->
<template>
  <div class="pagination-container">
    <!-- Bouton page précédente -->
    <button
      class="pagination-btn"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      aria-label="Page précédente"
    >
      <i class="fas fa-chevron-left"></i>
    </button>

    <!-- Première page (toujours visible) -->
    <button
      v-if="totalPages > 0"
      class="pagination-btn"
      :class="{ active: currentPage === 1 }"
      @click="changePage(1)"
    >
      1
    </button>

    <!-- Ellipsis si nécessaire (début) -->
    <span v-if="startPage > 2" class="pagination-ellipsis">...</span>

    <!-- Pages intermédiaires -->
    <button
      v-for="page in displayedPages"
      :key="page"
      class="pagination-btn"
      :class="{ active: currentPage === page }"
      @click="changePage(page)"
    >
      {{ page }}
    </button>

    <!-- Ellipsis si nécessaire (fin) -->
    <span v-if="endPage < totalPages - 1" class="pagination-ellipsis">...</span>

    <!-- Dernière page (si plus d'une page) -->
    <button
      v-if="totalPages > 1"
      class="pagination-btn"
      :class="{ active: currentPage === totalPages }"
      @click="changePage(totalPages)"
    >
      {{ totalPages }}
    </button>

    <!-- Bouton page suivante -->
    <button
      class="pagination-btn"
      :disabled="currentPage === totalPages || totalPages === 0"
      @click="changePage(currentPage + 1)"
      aria-label="Page suivante"
    >
      <i class="fas fa-chevron-right"></i>
    </button>

    <!-- Affichage des informations sur la page courante (optionnel) -->
    <div v-if="showInfo" class="pagination-info">
      Page {{ currentPage }} sur {{ totalPages }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'PaginationComponent',

  props: {
    /**
     * Page actuelle
     */
    currentPage: {
      type: Number,
      required: true,
    },

    /**
     * Nombre total de pages
     */
    totalPages: {
      type: Number,
      required: true,
    },

    /**
     * Nombre de pages à afficher de chaque côté de la page courante
     */
    siblingCount: {
      type: Number,
      default: 1,
    },

    /**
     * Afficher les informations sur la page courante
     */
    showInfo: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['page-change'],

  setup(props, { emit }) {
    // Calcul des pages à afficher
    const startPage = computed(() => {
      let start = props.currentPage - props.siblingCount;
      return Math.max(start, 2);
    });

    const endPage = computed(() => {
      let end = props.currentPage + props.siblingCount;
      return Math.min(end, props.totalPages - 1);
    });

    const displayedPages = computed(() => {
      const pages = [];
      for (let i = startPage.value; i <= endPage.value; i++) {
        pages.push(i);
      }
      return pages;
    });

    // Changer de page
    const changePage = (page) => {
      if (page !== props.currentPage && page >= 1 && page <= props.totalPages) {
        emit('page-change', page);
      }
    };

    return {
      startPage,
      endPage,
      displayedPages,
      changePage,
    };
  },
};
</script>

<style scoped>
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled):not(.active) {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: #1a237e;
  color: white;
  border-color: #1a237e;
  font-weight: 500;
}

.pagination-ellipsis {
  padding: 0 0.25rem;
  color: #666;
}

.pagination-info {
  margin-left: 1rem;
  font-size: 0.875rem;
  color: #666;
}

@media (max-width: 480px) {
  .pagination-container {
    flex-wrap: wrap;
  }

  .pagination-info {
    width: 100%;
    margin-top: 0.5rem;
    text-align: center;
  }
}
</style>
