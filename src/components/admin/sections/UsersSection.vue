<!-- UsersSection.vue - Composant de gestion des utilisateurs -->
<template>
  <section class="users-section">
    <div class="section-header">
      <h2>Gestion des utilisateurs</h2>
      <div class="header-actions">
        <button class="btn-primary" @click="$emit('add')">
          <i class="fas fa-user-plus"></i>
          Ajouter un utilisateur
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          type="text"
          v-model="localUserFilters.search"
          placeholder="Rechercher un utilisateur..."
          @input="applyFilters"
        />
      </div>

      <select v-model="localUserFilters.role" @change="applyFilters">
        <option value="">Tous les rôles</option>
        <option value="ADMIN">Administrateur</option>
        <option value="USER">Utilisateur</option>
        <option value="EDITOR">Éditeur</option>
      </select>

      <select v-model="localUserFilters.status" @change="applyFilters">
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
        <option value="blocked">Bloqué</option>
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
            <th>Avatar</th>
            <th @click="sortData('name')">
              Nom
              <i class="fas" :class="getSortIcon('name')"></i>
            </th>
            <th @click="sortData('email')">
              Email
              <i class="fas" :class="getSortIcon('email')"></i>
            </th>
            <th @click="sortData('role')">
              Rôle
              <i class="fas" :class="getSortIcon('role')"></i>
            </th>
            <th @click="sortData('status')">
              Statut
              <i class="fas" :class="getSortIcon('status')"></i>
            </th>
            <th @click="sortData('lastLogin')">
              Dernière connexion
              <i class="fas" :class="getSortIcon('lastLogin')"></i>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>
              <input
                type="checkbox"
                :value="user.id"
                v-model="localSelectedUsers"
                @change="updateSelection"
              />
            </td>
            <td>
              <img
                :src="user.avatar || '/default-avatar.png'"
                :alt="user.name"
                class="user-avatar"
              />
            </td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role.toLowerCase()">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="user.status">
                {{ getUserStatus(user.status) }}
              </span>
            </td>
            <td>{{ formatDate(user.lastLogin) }}</td>
            <td>
              <div class="action-buttons">
                <button
                  class="btn-icon"
                  @click="$emit('edit', user)"
                  title="Modifier"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  class="btn-icon"
                  @click="$emit('toggle-status', user)"
                  :title="user.status === 'active' ? 'Désactiver' : 'Activer'"
                >
                  <i
                    :class="
                      user.status === 'active' ? 'fas fa-ban' : 'fas fa-check'
                    "
                  ></i>
                </button>
                <button
                  class="btn-icon delete"
                  @click="$emit('delete', user)"
                  title="Supprimer"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="8" class="no-data">Aucun utilisateur trouvé</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button
        class="btn-page"
        :disabled="userPagination.currentPage === 1"
        @click="$emit('change-page', userPagination.currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        Page {{ userPagination.currentPage }} sur
        {{ userPagination.totalPages }}
      </span>
      <button
        class="btn-page"
        :disabled="userPagination.currentPage === userPagination.totalPages"
        @click="$emit('change-page', userPagination.currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'UsersSection',

  props: {
    users: {
      type: Array,
      required: true,
    },
    userFilters: {
      type: Object,
      required: true,
    },
    userSort: {
      type: Object,
      required: true,
    },
    userPagination: {
      type: Object,
      required: true,
    },
    selectedUsers: {
      type: Array,
      required: true,
    },
    selectAllUsers: {
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
    'toggle-status',
    'delete',
    'add',
    'selection-change',
  ],

  setup(props, { emit }) {
    // Créer des copies locales des données pour la gestion interne
    const localUserFilters = ref({ ...props.userFilters });
    const localSelectedUsers = ref([...props.selectedUsers]);
    const localSelectAll = ref(props.selectAllUsers);

    // Synchroniser les props avec les états locaux
    watch(
      () => props.userFilters,
      (newFilters) => {
        localUserFilters.value = { ...newFilters };
      }
    );

    watch(
      () => props.selectedUsers,
      (newSelection) => {
        localSelectedUsers.value = [...newSelection];
      }
    );

    watch(
      () => props.selectAllUsers,
      (newValue) => {
        localSelectAll.value = newValue;
      }
    );

    // Fonctions
    const applyFilters = () => {
      emit('apply-filters', localUserFilters.value);
    };

    const sortData = (field) => {
      emit('sort', field);
    };

    const toggleAll = () => {
      emit('toggle-all', localSelectAll.value);
    };

    const updateSelection = () => {
      emit('selection-change', localSelectedUsers.value);
    };

    const getSortIcon = (field) => {
      if (props.userSort.field !== field) {
        return 'fa-sort';
      }

      return props.userSort.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    const formatDate = (date) => {
      if (!date) return '-';

      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const getUserStatus = (status) => {
      const statusMap = {
        active: 'Actif',
        inactive: 'Inactif',
        blocked: 'Bloqué',
      };

      return statusMap[status] || status;
    };

    return {
      localUserFilters,
      localSelectedUsers,
      localSelectAll,
      applyFilters,
      sortData,
      toggleAll,
      updateSelection,
      getSortIcon,
      formatDate,
      getUserStatus,
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.role-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.role-badge.admin {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.role-badge.editor {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-badge.user {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.status-badge.active {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background-color: #f5f5f5;
  color: #666;
}

.status-badge.blocked {
  background-color: #ffebee;
  color: #d32f2f;
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
