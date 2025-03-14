<!-- OrdersSection.vue - Composant de gestion des commandes -->
<template>
  <section class="orders-section">
    <div class="section-header">
      <h2>Gestion des commandes</h2>
      <div class="header-actions">
        <button
          class="btn-secondary"
          :disabled="localSelectedOrders.length === 0"
          @click="$emit('export')"
        >
          <i class="fas fa-file-export"></i>
          Exporter
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="localOrderFilters.search"
          placeholder="Rechercher une commande..."
          @input="applyFilters"
        />
      </div>

      <select v-model="localOrderFilters.status" @change="applyFilters">
        <option value="">Tous les statuts</option>
        <option value="PENDING">En attente</option>
        <option value="PROCESSING">En traitement</option>
        <option value="SHIPPED">Expédiée</option>
        <option value="DELIVERED">Livrée</option>
        <option value="CANCELLED">Annulée</option>
      </select>

      <div class="date-range">
        <input
          type="date"
          v-model="localOrderFilters.startDate"
          :max="localOrderFilters.endDate"
          @change="applyFilters"
        />
        <span>à</span>
        <input
          type="date"
          v-model="localOrderFilters.endDate"
          :min="localOrderFilters.startDate"
          @change="applyFilters"
        />
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
            <th @click="sortData('number')">
              N° Commande
              <i class="fas" :class="getSortIcon('number')"></i>
            </th>
            <th @click="sortData('date')">
              Date
              <i class="fas" :class="getSortIcon('date')"></i>
            </th>
            <th @click="sortData('customer')">
              Client
              <i class="fas" :class="getSortIcon('customer')"></i>
            </th>
            <th @click="sortData('total')">
              Total
              <i class="fas" :class="getSortIcon('total')"></i>
            </th>
            <th @click="sortData('status')">
              Statut
              <i class="fas" :class="getSortIcon('status')"></i>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>
              <input
                type="checkbox"
                :value="order.id"
                v-model="localSelectedOrders"
                @change="updateSelection"
              />
            </td>
            <td>{{ order.number }}</td>
            <td>{{ formatDate(order.date) }}</td>
            <td>
              <div class="customer-info">
                <span>{{ order.customer.name }}</span>
                <span class="customer-email">{{ order.customer.email }}</span>
              </div>
            </td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>
              <select
                v-model="order.status"
                class="status-select"
                :class="order.status.toLowerCase()"
                @change="$emit('update-status', order)"
              >
                <option value="PENDING">En attente</option>
                <option value="PROCESSING">En traitement</option>
                <option value="SHIPPED">Expédiée</option>
                <option value="DELIVERED">Livrée</option>
                <option value="CANCELLED">Annulée</option>
              </select>
            </td>
            <td>
              <div class="action-buttons">
                <button
                  class="btn-icon"
                  @click="$emit('view-details', order)"
                  title="Voir les détails"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="btn-icon"
                  @click="$emit('print', order)"
                  title="Imprimer"
                >
                  <i class="fas fa-print"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="7" class="no-data">Aucune commande trouvée</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
        class="btn-page"
        :disabled="orderPagination.currentPage === 1"
        @click="$emit('change-page', orderPagination.currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        Page {{ orderPagination.currentPage }} sur
        {{ orderPagination.totalPages }}
      </span>
      <button
        class="btn-page"
        :disabled="orderPagination.currentPage === orderPagination.totalPages"
        @click="$emit('change-page', orderPagination.currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'OrdersSection',

  props: {
    orders: {
      type: Array,
      required: true,
    },
    orderFilters: {
      type: Object,
      required: true,
    },
    orderSort: {
      type: Object,
      required: true,
    },
    orderPagination: {
      type: Object,
      required: true,
    },
    selectedOrders: {
      type: Array,
      required: true,
    },
    selectAllOrders: {
      type: Boolean,
      required: true,
    },
  },

  emits: [
    'apply-filters',
    'sort',
    'change-page',
    'toggle-all',
    'view-details',
    'print',
    'export',
    'update-status',
    'selection-change',
  ],

  setup(props, { emit }) {
    // Créer des copies locales des données pour la gestion interne
    const localOrderFilters = ref({ ...props.orderFilters });
    const localSelectedOrders = ref([...props.selectedOrders]);
    const localSelectAll = ref(props.selectAllOrders);

    // Synchroniser les props avec les états locaux
    watch(
      () => props.orderFilters,
      (newFilters) => {
        localOrderFilters.value = { ...newFilters };
      }
    );

    watch(
      () => props.selectedOrders,
      (newSelection) => {
        localSelectedOrders.value = [...newSelection];
      }
    );

    watch(
      () => props.selectAllOrders,
      (newValue) => {
        localSelectAll.value = newValue;
      }
    );

    // Fonctions
    const applyFilters = () => {
      emit('apply-filters', localOrderFilters.value);
    };

    const sortData = (field) => {
      emit('sort', field);
    };

    const toggleAll = () => {
      emit('toggle-all', localSelectAll.value);
    };

    const updateSelection = () => {
      emit('selection-change', localSelectedOrders.value);
    };

    const getSortIcon = (field) => {
      if (props.orderSort.field !== field) {
        return 'fa-sort';
      }

      return props.orderSort.direction === 'asc'
        ? 'fa-sort-up'
        : 'fa-sort-down';
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    const formatDate = (date) => {
      if (!date) return '-';

      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    return {
      localOrderFilters,
      localSelectedOrders,
      localSelectAll,
      applyFilters,
      sortData,
      toggleAll,
      updateSelection,
      getSortIcon,
      formatPrice,
      formatDate,
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

.date-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-range input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
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

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-email {
  font-size: 0.75rem;
  color: #666;
}

.status-select {
  padding: 0.5rem;
  border-radius: 4px;
  border: none;
  font-size: 0.875rem;
  color: white;
}

.status-select.pending {
  background-color: #ff9800;
}

.status-select.processing {
  background-color: #2196f3;
}

.status-select.shipped {
  background-color: #9c27b0;
}

.status-select.delivered {
  background-color: #4caf50;
}

.status-select.cancelled {
  background-color: #f44336;
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

.btn-secondary {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .date-range {
    flex-direction: column;
    width: 100%;
  }
}
</style>
