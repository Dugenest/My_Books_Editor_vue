<!-- AdminDashboard.vue - Composant principal -->
<template>
  <div class="admin-dashboard">
    <!-- Navigation latérale -->
    <AdminSidebar
      :navSections="navSections"
      :currentSection="currentSection"
      @change-section="currentSection = $event"
    />

    <!-- Contenu principal -->
    <main class="admin-content">
      <!-- Tableau de bord général -->
      <DashboardSection
        v-if="currentSection === 'dashboard'"
        :stats="stats"
        :recentActivity="recentActivity"
        :getActivityIcon="getActivityIcon"
        :formatDate="formatDate"
        :formatPrice="formatPrice"
      />

      <!-- Gestion des livres -->
      <BooksSection
        v-if="currentSection === 'books'"
        :books="filteredBooks"
        :categories="categories"
        :bookFilters="bookFilters"
        :bookSort="bookSort"
        :bookPagination="bookPagination"
        :selectedBooks="selectedBooks"
        :selectAllBooks="selectAllBooks"
        @apply-filters="applyBookFilters"
        @sort="sortBooks"
        @change-page="changeBookPage"
        @toggle-all="toggleAllBooks"
        @edit="editBook"
        @delete="deleteBook"
        @add="showAddBookModal = true"
        @selection-change="selectedBooks = $event"
      />

      <!-- Gestion des commandes -->
      <OrdersSection
        v-if="currentSection === 'orders'"
        :orders="filteredOrders"
        :orderFilters="orderFilters"
        :orderSort="orderSort"
        :orderPagination="orderPagination"
        :selectedOrders="selectedOrders"
        :selectAllOrders="selectAllOrders"
        @apply-filters="applyOrderFilters"
        @sort="sortOrders"
        @change-page="changeOrderPage"
        @toggle-all="toggleAllOrders"
        @view-details="viewOrderDetails"
        @print="printOrder"
        @export="exportOrders"
        @update-status="updateOrderStatus"
        @selection-change="selectedOrders = $event"
      />

      <!-- Gestion des utilisateurs -->
      <UsersSection
        v-if="currentSection === 'users'"
        :users="filteredUsers"
        :userFilters="userFilters"
        :userSort="userSort"
        :userPagination="userPagination"
        :selectedUsers="selectedUsers"
        :selectAllUsers="selectAllUsers"
        @apply-filters="applyUserFilters"
        @sort="sortUsers"
        @change-page="changeUserPage"
        @toggle-all="toggleAllUsers"
        @edit="editUser"
        @toggle-status="toggleUserStatus"
        @delete="deleteUser"
        @add="showAddUserModal = true"
        @selection-change="selectedUsers = $event"
      />

      <!-- Gestion des catégories -->
      <CategoriesSection
        v-if="currentSection === 'categories'"
        :categories="categories"
        @edit="editCategory"
        @delete="deleteCategory"
        @add="showAddCategoryModal = true"
      />

      <!-- Gestion des auteurs -->
      <AuthorsSection
        v-if="currentSection === 'authors'"
        :authors="filteredAuthors"
        :authorFilters="authorFilters"
        :authorSort="authorSort"
        :authorPagination="authorPagination"
        :selectedAuthors="selectedAuthors"
        :selectAllAuthors="selectAllAuthors"
        @apply-filters="applyAuthorFilters"
        @sort="sortAuthors"
        @change-page="changeAuthorPage"
        @toggle-all="toggleAllAuthors"
        @edit="editAuthor"
        @delete="deleteAuthor"
        @add="showAddAuthorModal = true"
        @selection-change="selectedAuthors = $event"
      />

      <!-- Paramètres -->
      <SettingsSection
        v-if="currentSection === 'settings'"
        :settings="settings"
        @save-general="saveGeneralSettings"
        @save-shipping="saveShippingSettings"
        @save-email="saveEmailSettings"
      />
    </main>

    <!-- Modales -->
    <AddBookModal
      v-if="showAddBookModal"
      @close="showAddBookModal = false"
      @book-added="onBookAdded"
    />

    <EditBookModal
      v-if="bookToEdit"
      :book="bookToEdit"
      @close="bookToEdit = null"
      @book-updated="onBookUpdated"
    />

    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @status-updated="onOrderStatusUpdated"
      @note-added="onOrderNoteAdded"
    />

    <AddUserModal
      v-if="showAddUserModal"
      @close="showAddUserModal = false"
      @user-added="onUserAdded"
    />

    <EditUserModal
      v-if="userToEdit"
      :user="userToEdit"
      @close="userToEdit = null"
      @user-updated="onUserUpdated"
    />

    <AddCategoryModal
      v-if="showAddCategoryModal"
      @close="showAddCategoryModal = false"
      @category-added="onCategoryAdded"
    />

    <EditCategoryModal
      v-if="categoryToEdit"
      :category="categoryToEdit"
      @close="categoryToEdit = null"
      @category-updated="onCategoryUpdated"
    />

    <AddAuthorModal
      v-if="showAddAuthorModal"
      @close="showAddAuthorModal = false"
      @author-added="onAuthorAdded"
    />

    <EditAuthorModal
      v-if="authorToEdit"
      :author="authorToEdit"
      @close="authorToEdit = null"
      @author-updated="onAuthorUpdated"
    />
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
// Importation du composant de barre latérale
import AdminSidebar from './AdminSidebar.vue';

// Importation des composants de section
import DashboardSection from '@/components/admin/sections/DashboardSection.vue';
import BooksSection from '@/components/admin/sections/BooksSection.vue';
import OrdersSection from '@/components/admin/sections/OrdersSection.vue';
import UsersSection from '@/components/admin/sections/UsersSection.vue';
import CategoriesSection from '@/components/admin/sections/CategoriesSection.vue';
import AuthorsSection from '@/components/admin/sections/AuthorsSection.vue';
import SettingsSection from '@/components/admin/sections/SettingsSection.vue';

// Importation des modals
import AddBookModal from '@/components/admin/modals/AddBookModal.vue';
import EditBookModal from '@/components/admin/modals/EditBookModal.vue';
import OrderDetailsModal from '@/components/admin/modals/OrderDetailsModal.vue';
import AddUserModal from '@/components/admin/modals/AddUserModal.vue';
import EditUserModal from '@/components/admin/modals/EditUserModal.vue';
import AddCategoryModal from '@/components/admin/modals/AddCategoryModal.vue';
import EditCategoryModal from '@/components/admin/modals/EditCategoryModal.vue';
import AddAuthorModal from '@/components/admin/modals/AddAuthorModal.vue';
import EditAuthorModal from '@/components/admin/modals/EditAuthorModal.vue';

// Importation des services
import BookService from '@/services/BookService';
import CategoryService from '@/services/CategoryService';
import AuthorService from '@/services/AuthorService';
import UserService from '@/services/UserService';
import OrderService from '@/services/OrderService';
import SettingsService from '@/services/SettingsService';
import ActivityService from '@/services/ActivityService';

export default {
  name: 'AdminDashboard',

  components: {
    AdminSidebar,
    DashboardSection,
    BooksSection,
    OrdersSection,
    UsersSection,
    CategoriesSection,
    AuthorsSection,
    SettingsSection,
    AddBookModal,
    EditBookModal,
    OrderDetailsModal,
    AddUserModal,
    EditUserModal,
    AddCategoryModal,
    EditCategoryModal,
    AddAuthorModal,
    EditAuthorModal,
  },

  setup() {
    // État général
    const currentSection = ref('dashboard');
    const isLoading = ref(false);

    // États pour les modales
    const showAddBookModal = ref(false);
    const bookToEdit = ref(null);
    const selectedOrder = ref(null);
    const showAddUserModal = ref(false);
    const userToEdit = ref(null);
    const showAddCategoryModal = ref(false);
    const categoryToEdit = ref(null);
    const showAddAuthorModal = ref(false);
    const authorToEdit = ref(null);

    // États pour les données
    const books = ref([]);
    const filteredBooks = ref([]);
    const orders = ref([]);
    const filteredOrders = ref([]);
    const users = ref([]);
    const filteredUsers = ref([]);
    const categories = ref([]);
    const authors = ref([]);
    const filteredAuthors = ref([]);
    const recentActivity = ref([]);

    // États pour les statistiques du tableau de bord
    const stats = ref({
      totalOrders: 0,
      ordersChange: 0,
      totalRevenue: 0,
      revenueChange: 0,
      totalUsers: 0,
      usersChange: 0,
      totalBooks: 0,
      outOfStock: 0,
    });

    // États pour les filtres
    const bookFilters = ref({
      search: '',
      category: '',
      status: '',
    });

    const orderFilters = ref({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
    });

    const userFilters = ref({
      search: '',
      role: '',
      status: '',
    });

    const authorFilters = ref({
      search: '',
      nationality: '',
    });

    // États pour les tris
    const bookSort = ref({ field: 'title', direction: 'asc' });
    const orderSort = ref({ field: 'date', direction: 'desc' });
    const userSort = ref({ field: 'name', direction: 'asc' });
    const authorSort = ref({ field: 'lastName', direction: 'asc' });

    // États pour la pagination
    const bookPagination = ref({ currentPage: 1, totalPages: 1, pageSize: 10 });
    const orderPagination = ref({
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    });
    const userPagination = ref({ currentPage: 1, totalPages: 1, pageSize: 10 });
    const authorPagination = ref({
      currentPage: 1,
      totalPages: 1,
      pageSize: 10,
    });

    // États pour les sélections
    const selectedBooks = ref([]);
    const selectedOrders = ref([]);
    const selectedUsers = ref([]);
    const selectedAuthors = ref([]);
    const selectAllBooks = ref(false);
    const selectAllOrders = ref(false);
    const selectAllUsers = ref(false);
    const selectAllAuthors = ref(false);

    // État pour les paramètres
    const settings = ref({
      storeName: '',
      contactEmail: '',
      phone: '',
      address: '',
      standardShipping: 0,
      expressShipping: 0,
      freeShippingThreshold: 0,
      smtpServer: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
    });

    // Navigation sections
    const navSections = [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'fas fa-chart-line' },
      { id: 'books', label: 'Livres', icon: 'fas fa-book' },
      { id: 'orders', label: 'Commandes', icon: 'fas fa-shopping-cart' },
      { id: 'users', label: 'Utilisateurs', icon: 'fas fa-users' },
      { id: 'categories', label: 'Catégories', icon: 'fas fa-tags' },
      { id: 'authors', label: 'Auteurs', icon: 'fas fa-user-edit' },
      { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog' },
    ];

    // Charger les données
    const loadDashboardData = async () => {
      try {
        isLoading.value = true;

        // Charger les statistiques
        const statsResponse = await ActivityService.getStats();
        if (statsResponse && statsResponse.data) {
          stats.value = statsResponse.data;
        }

        // Charger l'activité récente
        const activityResponse = await ActivityService.getRecentActivity();
        if (activityResponse && activityResponse.data) {
          recentActivity.value = activityResponse.data;
        }

        // Charger les catégories pour les filtres
        await loadCategories();
      } catch (error) {
        console.error(
          'Erreur lors du chargement des données du tableau de bord:',
          error
        );
      } finally {
        isLoading.value = false;
      }
    };

    const loadBooks = async () => {
      try {
        isLoading.value = true;

        // S'assurer que les valeurs de pagination sont des nombres valides
        const page = Number.isInteger(bookPagination.value.currentPage)
          ? bookPagination.value.currentPage - 1
          : 0;
        const size = Number.isInteger(bookPagination.value.pageSize)
          ? bookPagination.value.pageSize
          : 10;

        const response = await BookService.getBooks({
          page,
          size,
          sort: `${bookSort.value.field},${bookSort.value.direction}`,
          ...buildBookFilters(),
        });

        if (response && response.data) {
          books.value = response.data.content || [];
          filteredBooks.value = books.value;

          // Mettre à jour la pagination
          bookPagination.value.totalPages = response.data.totalPages || 1;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des livres:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadOrders = async () => {
      try {
        isLoading.value = true;

        // S'assurer que les valeurs de pagination sont des nombres valides
        const page = Number.isInteger(orderPagination.value.currentPage)
          ? orderPagination.value.currentPage - 1
          : 0;
        const size = Number.isInteger(orderPagination.value.pageSize)
          ? orderPagination.value.pageSize
          : 10;

        const response = await OrderService.getOrders({
          page,
          size,
          sort: `${orderSort.value.field},${orderSort.value.direction}`,
          ...buildOrderFilters(),
        });

        if (response && response.data) {
          orders.value = response.data.content || [];
          filteredOrders.value = orders.value;

          // Mettre à jour la pagination
          orderPagination.value.totalPages = response.data.totalPages || 1;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadUsers = async () => {
      try {
        isLoading.value = true;

        // S'assurer que les valeurs de pagination sont des nombres valides
        const page = Number.isInteger(userPagination.value.currentPage)
          ? userPagination.value.currentPage - 1
          : 0;
        const size = Number.isInteger(userPagination.value.pageSize)
          ? userPagination.value.pageSize
          : 10;

        const response = await UserService.getUsers({
          page,
          size,
          sort: `${userSort.value.field},${userSort.value.direction}`,
          ...buildUserFilters(),
        });

        if (response && response.data) {
          users.value = response.data.content || [];
          filteredUsers.value = users.value;

          // Mettre à jour la pagination
          userPagination.value.totalPages = response.data.totalPages || 1;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadCategories = async () => {
      try {
        isLoading.value = true;

        const response = await CategoryService.getCategories();

        if (response && response.data) {
          categories.value = response.data || [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadAuthors = async () => {
      try {
        isLoading.value = true;

        // S'assurer que les valeurs de pagination sont des nombres valides
        const page = Number.isInteger(authorPagination.value.currentPage)
          ? authorPagination.value.currentPage - 1
          : 0;
        const size = Number.isInteger(authorPagination.value.pageSize)
          ? authorPagination.value.pageSize
          : 10;

        const response = await AuthorService.getAuthors({
          page,
          size,
          sort: `${authorSort.value.field},${authorSort.value.direction}`,
          ...buildAuthorFilters(),
        });

        if (response && response.data) {
          authors.value = response.data.content || [];
          filteredAuthors.value = authors.value;

          // Mettre à jour la pagination
          authorPagination.value.totalPages = response.data.totalPages || 1;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des auteurs:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const loadSettings = async () => {
      try {
        isLoading.value = true;

        const response = await SettingsService.getSettings();

        if (response && response.data) {
          settings.value = response.data;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        isLoading.value = false;
      }
    };

    // Fonctions pour construire les filtres pour l'API
    const buildBookFilters = () => {
      const filters = {};

      if (bookFilters.value.search) {
        filters.search = bookFilters.value.search;
      }

      if (bookFilters.value.category) {
        filters.categoryId = bookFilters.value.category;
      }

      if (bookFilters.value.status) {
        filters.status = bookFilters.value.status;
      }

      return filters;
    };

    const buildOrderFilters = () => {
      const filters = {};

      if (orderFilters.value.search) {
        filters.search = orderFilters.value.search;
      }

      if (orderFilters.value.status) {
        filters.status = orderFilters.value.status;
      }

      if (orderFilters.value.startDate) {
        filters.startDate = orderFilters.value.startDate;
      }

      if (orderFilters.value.endDate) {
        filters.endDate = orderFilters.value.endDate;
      }

      return filters;
    };

    const buildUserFilters = () => {
      const filters = {};

      if (userFilters.value.search) {
        filters.search = userFilters.value.search;
      }

      if (userFilters.value.role) {
        filters.role = userFilters.value.role;
      }

      if (userFilters.value.status) {
        filters.status = userFilters.value.status;
      }

      return filters;
    };

    const buildAuthorFilters = () => {
      const filters = {};

      if (authorFilters.value.search) {
        filters.search = authorFilters.value.search;
      }

      if (authorFilters.value.nationality) {
        filters.nationality = authorFilters.value.nationality;
      }

      return filters;
    };

    // Fonctions pour appliquer les filtres
    const applyBookFilters = () => {
      bookPagination.value.currentPage = 1;
      loadBooks();
    };

    const applyOrderFilters = () => {
      orderPagination.value.currentPage = 1;
      loadOrders();
    };

    const applyUserFilters = () => {
      userPagination.value.currentPage = 1;
      loadUsers();
    };

    const applyAuthorFilters = () => {
      authorPagination.value.currentPage = 1;
      loadAuthors();
    };

    // Fonctions pour trier les données
    const sortBooks = (field) => {
      if (bookSort.value.field === field) {
        // Inverser la direction si le champ est déjà sélectionné
        bookSort.value.direction =
          bookSort.value.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Nouveau champ de tri
        bookSort.value.field = field;
        bookSort.value.direction = 'asc';
      }

      loadBooks();
    };

    const sortOrders = (field) => {
      if (orderSort.value.field === field) {
        orderSort.value.direction =
          orderSort.value.direction === 'asc' ? 'desc' : 'asc';
      } else {
        orderSort.value.field = field;
        orderSort.value.direction = 'asc';
      }

      loadOrders();
    };

    const sortUsers = (field) => {
      if (userSort.value.field === field) {
        userSort.value.direction =
          userSort.value.direction === 'asc' ? 'desc' : 'asc';
      } else {
        userSort.value.field = field;
        userSort.value.direction = 'asc';
      }

      loadUsers();
    };

    const sortAuthors = (field) => {
      if (authorSort.value.field === field) {
        authorSort.value.direction =
          authorSort.value.direction === 'asc' ? 'desc' : 'asc';
      } else {
        authorSort.value.field = field;
        authorSort.value.direction = 'asc';
      }

      loadAuthors();
    };

    // Fonctions pour la pagination
    const changeBookPage = (page) => {
      bookPagination.value.currentPage = page;
      loadBooks();
    };

    const changeOrderPage = (page) => {
      orderPagination.value.currentPage = page;
      loadOrders();
    };

    const changeUserPage = (page) => {
      userPagination.value.currentPage = page;
      loadUsers();
    };

    const changeAuthorPage = (page) => {
      authorPagination.value.currentPage = page;
      loadAuthors();
    };

    // Fonctions pour les sélections
    const toggleAllBooks = () => {
      if (selectAllBooks.value) {
        selectedBooks.value = filteredBooks.value.map((book) => book.id);
      } else {
        selectedBooks.value = [];
      }
    };

    const toggleAllOrders = () => {
      if (selectAllOrders.value) {
        selectedOrders.value = filteredOrders.value.map((order) => order.id);
      } else {
        selectedOrders.value = [];
      }
    };

    const toggleAllUsers = () => {
      if (selectAllUsers.value) {
        selectedUsers.value = filteredUsers.value.map((user) => user.id);
      } else {
        selectedUsers.value = [];
      }
    };

    const toggleAllAuthors = () => {
      if (selectAllAuthors.value) {
        selectedAuthors.value = filteredAuthors.value.map(
          (author) => author.id
        );
      } else {
        selectedAuthors.value = [];
      }
    };

    // Fonctions utilitaires
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

    const getUserStatus = (status) => {
      const statusMap = {
        active: 'Actif',
        inactive: 'Inactif',
        blocked: 'Bloqué',
      };

      return statusMap[status] || status;
    };

    const getStockStatus = (stock) => {
      if (stock <= 0) return 'out-of-stock';
      if (stock < 10) return 'low-stock';
      return 'in-stock';
    };

    const getActivityIcon = (type) => {
      switch (type) {
        case 'order':
          return 'fas fa-shopping-bag';
        case 'user':
          return 'fas fa-user';
        case 'book':
          return 'fas fa-book';
        case 'category':
          return 'fas fa-tag';
        case 'author':
          return 'fas fa-user-edit';
        default:
          return 'fas fa-bell';
      }
    };

    const getSortIcon = (field, sortState) => {
      if (sortState.field !== field) {
        return 'fa-sort';
      }

      return sortState.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
    };

    // Méthodes pour les actions sur les livres
    const editBook = (book) => {
      bookToEdit.value = { ...book };
    };

    const deleteBook = async (book) => {
      if (
        confirm(`Voulez-vous vraiment supprimer le livre "${book.title}" ?`)
      ) {
        try {
          await BookService.deleteBook(book.id);
          loadBooks(); // Recharger la liste des livres
        } catch (error) {
          console.error('Erreur lors de la suppression du livre:', error);
          alert('Une erreur est survenue lors de la suppression du livre.');
        }
      }
    };

    const onBookAdded = () => {
      // Recharger la liste des livres après ajout
      loadBooks();
    };

    const onBookUpdated = () => {
      // Recharger la liste des livres après mise à jour
      loadBooks();
    };

    // Méthodes pour les actions sur les commandes
    const viewOrderDetails = (order) => {
      selectedOrder.value = { ...order };
    };

    const printOrder = () => {
      // Ouvrir une fenêtre d'impression
      window.print();
    };

    const exportOrders = () => {
      // Implémenter l'export des commandes sélectionnées
      console.log('Exportation des commandes:', selectedOrders.value);
    };

    const updateOrderStatus = async (order) => {
      try {
        await OrderService.updateOrderStatus(order.id, order.status);
        // Optionnel: recharger la liste des commandes
        loadOrders();
      } catch (error) {
        console.error(
          'Erreur lors de la mise à jour du statut de la commande:',
          error
        );
        alert(
          'Une erreur est survenue lors de la mise à jour du statut de la commande.'
        );
      }
    };

    const onOrderStatusUpdated = ({ orderId, status }) => {
      // Mettre à jour le statut dans la liste des commandes
      const orderIndex = filteredOrders.value.findIndex(
        (o) => o.id === orderId
      );
      if (orderIndex !== -1) {
        filteredOrders.value[orderIndex].status = status;
      }
    };

    const onOrderNoteAdded = ({ orderId, note }) => {
      // Pas besoin de mettre à jour la liste des commandes
      console.log(`Note ajoutée à la commande ${orderId}:`, note);
    };

    // Méthodes pour les actions sur les utilisateurs
    const editUser = (user) => {
      userToEdit.value = { ...user };
    };

    const toggleUserStatus = async (user) => {
      try {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        await UserService.updateUserStatus(user.id, newStatus);

        // Mettre à jour le statut dans la liste
        const userIndex = filteredUsers.value.findIndex(
          (u) => u.id === user.id
        );
        if (userIndex !== -1) {
          filteredUsers.value[userIndex].status = newStatus;
        }
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour du statut de l'utilisateur:",
          error
        );
        alert(
          "Une erreur est survenue lors de la mise à jour du statut de l'utilisateur."
        );
      }
    };

    const deleteUser = async (user) => {
      if (
        confirm(`Voulez-vous vraiment supprimer l'utilisateur "${user.name}" ?`)
      ) {
        try {
          await UserService.deleteUser(user.id);
          loadUsers(); // Recharger la liste des utilisateurs
        } catch (error) {
          console.error(
            "Erreur lors de la suppression de l'utilisateur:",
            error
          );
          alert(
            "Une erreur est survenue lors de la suppression de l'utilisateur."
          );
        }
      }
    };

    const onUserAdded = () => {
      // Recharger la liste des utilisateurs après ajout
      loadUsers();
    };

    const onUserUpdated = () => {
      // Recharger la liste des utilisateurs après mise à jour
      loadUsers();
    };

    // Méthodes pour les actions sur les catégories
    const editCategory = (category) => {
      categoryToEdit.value = { ...category };
    };

    const deleteCategory = async (category) => {
      if (
        confirm(
          `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`
        )
      ) {
        try {
          await CategoryService.deleteCategory(category.id);
          loadCategories(); // Recharger la liste des catégories
        } catch (error) {
          console.error(
            'Erreur lors de la suppression de la catégorie:',
            error
          );
          alert(
            'Une erreur est survenue lors de la suppression de la catégorie.'
          );
        }
      }
    };

    const onCategoryAdded = () => {
      // Recharger la liste des catégories après ajout
      loadCategories();
    };

    const onCategoryUpdated = () => {
      // Recharger la liste des catégories après mise à jour
      loadCategories();
    };

    // Méthodes pour les actions sur les auteurs
    const editAuthor = (author) => {
      authorToEdit.value = { ...author };
    };

    const deleteAuthor = async (author) => {
      if (
        confirm(
          `Voulez-vous vraiment supprimer l'auteur "${author.firstName} ${author.lastName}" ?`
        )
      ) {
        try {
          await AuthorService.deleteAuthor(author.id);
          loadAuthors(); // Recharger la liste des auteurs
        } catch (error) {
          console.error("Erreur lors de la suppression de l'auteur:", error);
          alert("Une erreur est survenue lors de la suppression de l'auteur.");
        }
      }
    };

    const onAuthorAdded = () => {
      // Recharger la liste des auteurs après ajout
      loadAuthors();
    };

    const onAuthorUpdated = () => {
      // Recharger la liste des auteurs après mise à jour
      loadAuthors();
    };

    // Méthodes pour les actions sur les paramètres
    const saveGeneralSettings = async () => {
      try {
        const settingsToSave = {
          storeName: settings.value.storeName,
          contactEmail: settings.value.contactEmail,
          phone: settings.value.phone,
          address: settings.value.address,
        };

        await SettingsService.updateSettings(settingsToSave);
        alert('Paramètres généraux enregistrés avec succès.');
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement des paramètres généraux:",
          error
        );
        alert(
          "Une erreur est survenue lors de l'enregistrement des paramètres."
        );
      }
    };

    const saveShippingSettings = async () => {
      try {
        const settingsToSave = {
          standardShipping: settings.value.standardShipping,
          expressShipping: settings.value.expressShipping,
          freeShippingThreshold: settings.value.freeShippingThreshold,
        };

        await SettingsService.updateSettings(settingsToSave);
        alert('Paramètres de livraison enregistrés avec succès.');
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement des paramètres de livraison:",
          error
        );
        alert(
          "Une erreur est survenue lors de l'enregistrement des paramètres."
        );
      }
    };

    const saveEmailSettings = async () => {
      try {
        const settingsToSave = {
          smtpServer: settings.value.smtpServer,
          smtpPort: settings.value.smtpPort,
          smtpUser: settings.value.smtpUser,
          smtpPassword: settings.value.smtpPassword,
        };

        await SettingsService.updateSettings(settingsToSave);
        alert("Paramètres d'email enregistrés avec succès.");
      } catch (error) {
        console.error(
          "Erreur lors de l'enregistrement des paramètres d'email:",
          error
        );
        alert(
          "Une erreur est survenue lors de l'enregistrement des paramètres."
        );
      }
    };

    // Gérer les changements de section
    watch(currentSection, (newSection) => {
      // Charger les données appropriées selon la section
      if (newSection === 'dashboard') {
        loadDashboardData();
      } else if (newSection === 'books') {
        loadBooks();
      } else if (newSection === 'orders') {
        loadOrders();
      } else if (newSection === 'users') {
        loadUsers();
      } else if (newSection === 'categories') {
        loadCategories();
      } else if (newSection === 'authors') {
        loadAuthors();
      } else if (newSection === 'settings') {
        loadSettings();
      }
    });

    // Initialisation lors du montage du composant
    onMounted(() => {
      // Charger les données de la section active
      if (currentSection.value === 'dashboard') {
        loadDashboardData();
      } else if (currentSection.value === 'books') {
        loadBooks();
      } else if (currentSection.value === 'orders') {
        loadOrders();
      } else if (currentSection.value === 'users') {
        loadUsers();
      } else if (currentSection.value === 'categories') {
        loadCategories();
      } else if (currentSection.value === 'authors') {
        loadAuthors();
      } else if (currentSection.value === 'settings') {
        loadSettings();
      }
    });

    return {
      // États généraux
      currentSection,
      isLoading,
      navSections,

      // États pour les modales
      showAddBookModal,
      bookToEdit,
      selectedOrder,
      showAddUserModal,
      userToEdit,
      showAddCategoryModal,
      categoryToEdit,
      showAddAuthorModal,
      authorToEdit,

      // États pour les données
      filteredBooks,
      filteredOrders,
      filteredUsers,
      categories,
      filteredAuthors,
      recentActivity,
      stats,

      // États pour les filtres
      bookFilters,
      orderFilters,
      userFilters,
      authorFilters,

      // États pour les tris
      bookSort,
      orderSort,
      userSort,
      authorSort,

      // États pour la pagination
      bookPagination,
      orderPagination,
      userPagination,
      authorPagination,

      // États pour les sélections
      selectedBooks,
      selectedOrders,
      selectedUsers,
      selectedAuthors,
      selectAllBooks,
      selectAllOrders,
      selectAllUsers,
      selectAllAuthors,

      // État pour les paramètres
      settings,

      // Fonctions utilitaires
      formatPrice,
      formatDate,
      getUserStatus,
      getStockStatus,
      getActivityIcon,
      getSortIcon,

      // Fonctions pour les filtres
      applyBookFilters,
      applyOrderFilters,
      applyUserFilters,
      applyAuthorFilters,

      // Fonctions pour les tris
      sortBooks,
      sortOrders,
      sortUsers,
      sortAuthors,

      // Fonctions pour la pagination
      changeBookPage,
      changeOrderPage,
      changeUserPage,
      changeAuthorPage,

      // Fonctions pour les sélections
      toggleAllBooks,
      toggleAllOrders,
      toggleAllUsers,
      toggleAllAuthors,

      // Fonctions pour les actions sur les livres
      editBook,
      deleteBook,
      onBookAdded,
      onBookUpdated,

      // Fonctions pour les actions sur les commandes
      viewOrderDetails,
      printOrder,
      exportOrders,
      updateOrderStatus,
      onOrderStatusUpdated,
      onOrderNoteAdded,

      // Fonctions pour les actions sur les utilisateurs
      editUser,
      toggleUserStatus,
      deleteUser,
      onUserAdded,
      onUserUpdated,

      // Fonctions pour les actions sur les catégories
      editCategory,
      deleteCategory,
      onCategoryAdded,
      onCategoryUpdated,

      // Fonctions pour les actions sur les auteurs
      editAuthor,
      deleteAuthor,
      onAuthorAdded,
      onAuthorUpdated,

      // Fonctions pour les actions sur les paramètres
      saveGeneralSettings,
      saveShippingSettings,
      saveEmailSettings,
    };
  },
};
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.admin-content {
  padding: 2rem;
  background-color: #f5f5f5;
  overflow-y: auto;
}

@media (max-width: 1024px) {
  .admin-dashboard {
    grid-template-columns: 1fr;
  }

  .admin-content {
    margin-top: 70px;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 1.5rem;
  }
}

@media (max-width: 576px) {
  .admin-content {
    padding: 1rem;
  }
}
</style>
