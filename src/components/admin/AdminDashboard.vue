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

      <!-- Gestion des éditeurs -->
      <EditorsSection
        v-if="currentSection === 'editors'"
        :editors="editors"
        @edit="editEditor"
        @delete="deleteEditor"
        @add="showAddEditorModal = true"
      />

      <!-- Gestion des séries -->
      <SeriesSection
        v-if="currentSection === 'series'"
        :series="series"
        @edit="editSeries"
        @delete="deleteSeries"
        @add="showAddSeriesModal = true"
      />

      <!-- Gestion des commentaires -->
      <CommentsSection
        v-if="currentSection === 'comments'"
        :comments="comments"
        @approve="approveComment"
        @reject="rejectComment"
        @delete="deleteComment"
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

    <AddEditorModal
      v-if="showAddEditorModal"
      @close="showAddEditorModal = false"
      @editor-added="onEditorAdded"
    />

    <EditEditorModal
      v-if="editorToEdit"
      :editor="editorToEdit"
      @close="editorToEdit = null"
      @editor-updated="onEditorUpdated"
    />
  </div>
</template>

<script>
import { onMounted, ref, watch } from 'vue';
// Importation du composant de barre latérale
import AdminSidebar from './AdminSidebar.vue';

// Importation des composants de section
import AuthorsSection from '@/components/admin/sections/AuthorsSection.vue';
import BooksSection from '@/components/admin/sections/BooksSection.vue';
import CategoriesSection from '@/components/admin/sections/CategoriesSection.vue';
import CommentsSection from '@/components/admin/sections/CommentsSection.vue';
import DashboardSection from '@/components/admin/sections/DashboardSection.vue';
import EditorsSection from '@/components/admin/sections/EditorsSection.vue';
import OrdersSection from '@/components/admin/sections/OrdersSection.vue';
import SeriesSection from '@/components/admin/sections/SeriesSection.vue';
import SettingsSection from '@/components/admin/sections/SettingsSection.vue';
import UsersSection from '@/components/admin/sections/UsersSection.vue';

// Importation des modals
import AddAuthorModal from '@/components/admin/modals/AddAuthorModal.vue';
import AddBookModal from '@/components/admin/modals/AddBookModal.vue';
import AddCategoryModal from '@/components/admin/modals/AddCategoryModal.vue';
import AddEditorModal from '@/components/admin/modals/AddEditorModal.vue';
import AddUserModal from '@/components/admin/modals/AddUserModal.vue';
import EditAuthorModal from '@/components/admin/modals/EditAuthorModal.vue';
import EditBookModal from '@/components/admin/modals/EditBookModal.vue';
import EditCategoryModal from '@/components/admin/modals/EditCategoryModal.vue';
import EditEditorModal from '@/components/admin/modals/EditEditorModal.vue';
import EditUserModal from '@/components/admin/modals/EditUserModal.vue';
import OrderDetailsModal from '@/components/admin/modals/OrderDetailsModal.vue';

// Importation des services
import ActivityService from '@/services/ActivityService';
import AuthorService from '@/services/AuthorService';
import BookService from '@/services/BookService';
import CategoryService from '@/services/CategoryService';
import EditorService from '@/services/EditorService';
import OrderService from '@/services/OrderService';
import SettingsService from '@/services/SettingsService';
import UserService from '@/services/UserService';

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
    EditorsSection,
    SeriesSection,
    CommentsSection,
    AddBookModal,
    EditBookModal,
    OrderDetailsModal,
    AddUserModal,
    EditUserModal,
    AddCategoryModal,
    EditCategoryModal,
    AddAuthorModal,
    EditAuthorModal,
    AddEditorModal,
    EditEditorModal,
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
    const showAddEditorModal = ref(false);
    const editorToEdit = ref(null);
    const showAddSeriesModal = ref(false);

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
    const editors = ref([]);
    const notifications = ref([]);
    const series = ref([]);
    const comments = ref([]);

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
      { id: 'orders', label: 'Commandes', icon: 'fas fa-shopping-cart' },
      { id: 'books', label: 'Livres', icon: 'fas fa-book' },
      { id: 'categories', label: 'Catégories', icon: 'fas fa-tags' },
      { id: 'series', label: 'Séries', icon: 'fas fa-layer-group' },
      { id: 'users', label: 'Utilisateurs', icon: 'fas fa-users' },
      { id: 'authors', label: 'Auteurs', icon: 'fas fa-user-edit' },
      { id: 'editors', label: 'Éditeurs', icon: 'fas fa-building' },
      { id: 'comments', label: 'Commentaires', icon: 'fas fa-comments' },
      { id: 'settings', label: 'Paramètres', icon: 'fas fa-cog' },
    ];

    console.log('Chargement des données du tableau de bord...');
    // Charger les données
    const loadDashboardData = async () => {
      try {
        isLoading.value = true;

        console.log(
          '=== Début du chargement des données du tableau de bord ==='
        );

        console.log('1. Appel API pour les statistiques...');
        const statsResponse = await ActivityService.getStats();
        console.log('Réponse brute des statistiques:', statsResponse);

        // Vérifier si la réponse contient des données valides
        if (
          statsResponse &&
          (statsResponse.data || typeof statsResponse === 'object')
        ) {
          // Utiliser directement statsResponse si c'est un objet sans propriété data
          const statsData = statsResponse.data || statsResponse;
          console.log('Données des statistiques traitées:', statsData);

          // Mettre à jour les statistiques avec les données reçues
          stats.value = {
            // Valeurs par défaut à 0
            totalOrders: 0,
            ordersChange: 0,
            totalRevenue: 0,
            revenueChange: 0,
            totalUsers: 0,
            usersChange: 0,
            totalBooks: 0,
            outOfStock: 0,
            totalCategories: 0,
            totalAuthors: 0,
            totalEditors: 0,
            totalSeries: 0,
            totalComments: 0,
            // Écraser avec les données reçues
            ...statsData,
          };
          console.log('Statistiques finales après traitement:', stats.value);
        } else {
          console.warn(
            'Aucune donnée de statistiques reçue ou format non reconnu'
          );
        }

        // Chargement des catégories pour le décompte
        try {
          const categoriesResponse = await CategoryService.getCategories();
          if (categoriesResponse && categoriesResponse.data) {
            if (Array.isArray(categoriesResponse.data)) {
              stats.value.totalCategories = categoriesResponse.data.length;
            } else if (
              categoriesResponse.data.content &&
              Array.isArray(categoriesResponse.data.content)
            ) {
              stats.value.totalCategories =
                categoriesResponse.data.content.length;
            }
          }
          console.log('Nombre de catégories:', stats.value.totalCategories);
        } catch (error) {
          console.error('Erreur lors du chargement des catégories:', error);
        }

        // Chargement des livres pour le décompte
        try {
          const booksResponse = await BookService.getBooks({
            page: 0,
            size: 1,
          });
          console.log('Réponse du service des livres:', booksResponse);

          if (booksResponse && booksResponse.data) {
            if (Array.isArray(booksResponse.data)) {
              stats.value.totalBooks = booksResponse.data.length;
              console.log(
                'Nombre de livres (tableau):',
                stats.value.totalBooks
              );
            } else if (
              booksResponse.data.content &&
              Array.isArray(booksResponse.data.content)
            ) {
              // Si nous avons un objet paginé, nous voulons le nombre total d'éléments, pas juste la page actuelle
              if (typeof booksResponse.data.totalElements === 'number') {
                stats.value.totalBooks = booksResponse.data.totalElements;
                console.log(
                  'Nombre total de livres (pagination):',
                  stats.value.totalBooks
                );
              } else {
                // Fallback sur la longueur du contenu de la page actuelle
                stats.value.totalBooks = booksResponse.data.content.length;
                console.log(
                  'Nombre de livres dans la page actuelle:',
                  stats.value.totalBooks
                );
              }
            } else if (typeof booksResponse.data.totalElements === 'number') {
              stats.value.totalBooks = booksResponse.data.totalElements;
              console.log('Nombre total de livres:', stats.value.totalBooks);
            }
          } else {
            console.warn('Réponse du service des livres invalide ou vide');
            stats.value.totalBooks = 0;
          }
          console.log(
            'Nombre final de livres dans les statistiques:',
            stats.value.totalBooks
          );
        } catch (error) {
          console.error(
            'Erreur lors du chargement du nombre de livres:',
            error
          );
          stats.value.totalBooks = 0;
        }

        // Chargement des utilisateurs pour le décompte
        try {
          const usersResponse = await UserService.getUsers({
            page: 0,
            size: 1,
          });
          if (usersResponse && usersResponse.data) {
            if (Array.isArray(usersResponse.data)) {
              stats.value.totalUsers = usersResponse.data.length;
            } else if (
              usersResponse.data.content &&
              Array.isArray(usersResponse.data.content)
            ) {
              stats.value.totalUsers = usersResponse.data.content.length;
            } else if (typeof usersResponse.data.totalElements === 'number') {
              stats.value.totalUsers = usersResponse.data.totalElements;
            }
          }
          console.log("Nombre d'utilisateurs:", stats.value.totalUsers);
        } catch (error) {
          console.error(
            "Erreur lors du chargement du nombre d'utilisateurs:",
            error
          );
        }

        // Chargement des auteurs pour le décompte
        try {
          const authorsResponse = await AuthorService.getAuthors();
          if (authorsResponse && authorsResponse.data) {
            if (Array.isArray(authorsResponse.data)) {
              stats.value.totalAuthors = authorsResponse.data.length;
            } else if (
              authorsResponse.data.content &&
              Array.isArray(authorsResponse.data.content)
            ) {
              stats.value.totalAuthors = authorsResponse.data.content.length;
            } else if (typeof authorsResponse.data.totalElements === 'number') {
              stats.value.totalAuthors = authorsResponse.data.totalElements;
            }
          }
          console.log("Nombre d'auteurs:", stats.value.totalAuthors);
        } catch (error) {
          console.error('Erreur lors du chargement des auteurs:', error);
        }

        // Chargement des éditeurs pour le décompte
        try {
          const editorsResponse = await EditorService.getEditors();
          if (editorsResponse && editorsResponse.data) {
            if (Array.isArray(editorsResponse.data)) {
              stats.value.totalEditors = editorsResponse.data.length;
            } else if (
              editorsResponse.data.content &&
              Array.isArray(editorsResponse.data.content)
            ) {
              stats.value.totalEditors = editorsResponse.data.content.length;
            } else if (typeof editorsResponse.data.totalElements === 'number') {
              stats.value.totalEditors = editorsResponse.data.totalElements;
            }
          }
          console.log("Nombre d'éditeurs:", stats.value.totalEditors);
        } catch (error) {
          console.error('Erreur lors du chargement des éditeurs:', error);
        }

        console.log("Appel API pour l'activité récente...");
        const activityResponse = await ActivityService.getRecentActivity();
        console.log("Réponse de l'activité récente:", activityResponse);

        if (activityResponse && Array.isArray(activityResponse)) {
          recentActivity.value = activityResponse.map((activity) => ({
            id: activity.id,
            type: activity.type,
            text: activity.message || activity.description,
            timestamp: activity.timestamp || activity.date,
            userId: activity.userId,
            data: activity.data,
          }));
          console.log('Activité récente chargée:', recentActivity.value);
        } else if (
          activityResponse &&
          activityResponse.data &&
          Array.isArray(activityResponse.data)
        ) {
          recentActivity.value = activityResponse.data.map((activity) => ({
            id: activity.id,
            type: activity.type,
            text: activity.message || activity.description,
            timestamp: activity.timestamp || activity.date,
            userId: activity.userId,
            data: activity.data,
          }));
          console.log('Activité récente chargée:', recentActivity.value);
        } else {
          console.error("Réponse invalide pour l'activité récente");
          recentActivity.value = [];
        }
      } catch (error) {
        console.error('=== Erreur lors du chargement des données ===');
        console.error("Type d'erreur:", error.constructor.name);
        console.error("Message d'erreur:", error.message);
        if (error.response) {
          console.error('Statut HTTP:', error.response.status);
          console.error('Données de réponse:', error.response.data);
          console.error('En-têtes de réponse:', error.response.headers);
        }
        if (error.request) {
          console.error('Détails de la requête:', error.request);
        }
      } finally {
        isLoading.value = false;
        console.log('=== Fin du chargement des données du tableau de bord ===');
      }
    };

    const loadBooks = async () => {
      try {
        isLoading.value = true;
        console.log('Chargement des livres...');

        // S'assurer que les valeurs de pagination sont des nombres valides
        const page = Number.isInteger(bookPagination.value.currentPage)
          ? bookPagination.value.currentPage - 1
          : 0;
        const size = Number.isInteger(bookPagination.value.pageSize)
          ? bookPagination.value.pageSize
          : 10;

        try {
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
          console.error('Erreur lors du chargement des livres:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });

          books.value = [];
          filteredBooks.value = [];
          bookPagination.value.totalPages = 1;

          notifications.value.push({
            type: 'error',
            message:
              'Impossible de charger les livres. Veuillez réessayer plus tard.',
          });
        }
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

        console.log('Chargement des utilisateurs avec params:', {
          page,
          size,
          sort: `${userSort.value.field},${userSort.value.direction}`,
          ...buildUserFilters(),
        });

        const response = await UserService.getUsers({
          page,
          size,
          sort: `${userSort.value.field},${userSort.value.direction}`,
          ...buildUserFilters(),
        });

        console.log('Réponse brute des utilisateurs:', response);

        if (response && response.data) {
          if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            users.value = response.data;
          } else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            // Si la réponse est un objet paginé avec content
            users.value = response.data.content;
            userPagination.value.totalPages = response.data.totalPages || 1;
          } else if (typeof response.data === 'object') {
            // Si c'est un objet non paginé
            users.value = [response.data];
          } else {
            users.value = [];
          }

          console.log(
            'Données des utilisateurs après traitement:',
            users.value
          );
          filteredUsers.value = users.value;
          console.log('filteredUsers après assignation:', filteredUsers.value);
        } else {
          users.value = [];
          filteredUsers.value = [];
          console.warn('Aucune donnée utilisateur reçue ou format non reconnu');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        users.value = [];
        filteredUsers.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const loadCategories = async () => {
      try {
        console.log('Chargement des catégories...');
        const response = await CategoryService.getCategories();

        // Gérer différents formats de réponse possibles
        let categoriesData = [];
        if (response && response.data) {
          if (Array.isArray(response.data)) {
            categoriesData = response.data;
          } else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            categoriesData = response.data.content;
          }
        }

        // Transformer les données pour le format attendu par le composant
        categories.value = categoriesData.map((cat) => ({
          id: cat.id,
          name: cat.name || 'Catégorie sans nom',
          description: cat.description || '',
          icon: cat.icon || 'fas fa-book',
          color: cat.color || 'blue',
          booksCount: cat.booksCount || 0,
          activeBooks: cat.activeBooks || 0,
        }));

        console.log('Catégories chargées:', categories.value);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
        categories.value = [];
        notifications.value.push({
          type: 'error',
          message:
            'Impossible de charger les catégories. Veuillez réessayer plus tard.',
        });
      }
    };

    const loadEditors = async () => {
      try {
        console.log('Chargement des éditeurs...');
        const response = await EditorService.getEditors();
        console.log('Réponse brute des éditeurs:', response);

        // Déterminer automatiquement la structure de la réponse
        if (Array.isArray(response)) {
          editors.value = response;
        } else if (response && typeof response === 'object') {
          // Si c'est une réponse axios
          if (response.data) {
            // Si les données sont dans data.content (pagination)
            if (response.data.content && Array.isArray(response.data.content)) {
              editors.value = response.data.content;
            }
            // Si les données sont directement dans data (tableau)
            else if (Array.isArray(response.data)) {
              editors.value = response.data;
            }
            // Si data contient directement un objet (cas rare)
            else {
              editors.value = [response.data];
            }
          } else {
            editors.value = [];
          }
        } else {
          editors.value = [];
        }

        console.log('Éditeurs chargés:', editors.value);
      } catch (error) {
        console.error('Erreur lors du chargement des éditeurs:', error);
        editors.value = [];
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

        console.log('Chargement des auteurs avec params:', {
          page,
          size,
          sort: `${authorSort.value.field},${authorSort.value.direction}`,
          ...buildAuthorFilters(),
        });

        const response = await AuthorService.getAuthors({
          page,
          size,
          sort: `${authorSort.value.field},${authorSort.value.direction}`,
          ...buildAuthorFilters(),
        });

        console.log('Réponse brute des auteurs:', response);

        if (response && response.data) {
          if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            authors.value = response.data;
          } else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            // Si la réponse est un objet paginé avec content
            authors.value = response.data.content;
            authorPagination.value.totalPages = response.data.totalPages || 1;
          } else if (typeof response.data === 'object') {
            // Si c'est un objet non paginé
            authors.value = [response.data];
          } else {
            authors.value = [];
          }

          console.log('Données des auteurs après traitement:', authors.value);
          filteredAuthors.value = authors.value;
          console.log(
            'filteredAuthors après assignation:',
            filteredAuthors.value
          );
        } else {
          authors.value = [];
          filteredAuthors.value = [];
          console.warn('Aucune donnée auteur reçue ou format non reconnu');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des auteurs:', error);
        authors.value = [];
        filteredAuthors.value = [];
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
        // Inverser le statut actuel
        const newActive = !user.active;
        await UserService.updateUserStatus(user.id, newActive);

        // Mettre à jour le statut dans la liste
        const userIndex = filteredUsers.value.findIndex(
          (u) => u.id === user.id
        );
        if (userIndex !== -1) {
          filteredUsers.value[userIndex].active = newActive;
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

    // Méthodes pour les actions sur les éditeurs
    const editEditor = (editor) => {
      editorToEdit.value = { ...editor };
    };

    const deleteEditor = async (editor) => {
      if (
        confirm(`Voulez-vous vraiment supprimer l'éditeur "${editor.name}" ?`)
      ) {
        try {
          await EditorService.deleteEditor(editor.id);
          loadEditors(); // Recharger la liste des éditeurs
        } catch (error) {
          console.error("Erreur lors de la suppression de l'éditeur:", error);
          alert("Une erreur est survenue lors de la suppression de l'éditeur.");
        }
      }
    };

    const onEditorAdded = () => {
      // Recharger la liste des éditeurs après ajout
      loadEditors();
    };

    const onEditorUpdated = () => {
      // Recharger la liste des éditeurs après mise à jour
      loadEditors();
    };

    // Méthodes pour les actions sur les séries
    const editSeries = (series) => {
      // À implémenter lorsque le service Series sera disponible
      console.log('Édition de la série:', series);
    };

    const deleteSeries = async (series) => {
      // À implémenter lorsque le service Series sera disponible
      console.log('Suppression de la série:', series);
    };

    const onSeriesAdded = () => {
      // À implémenter lorsque le service Series sera disponible
      console.log('Nouvelle série ajoutée');
    };

    const onSeriesUpdated = () => {
      // À implémenter lorsque le service Series sera disponible
      console.log('Série mise à jour');
    };

    // Méthodes pour les actions sur les commentaires
    const approveComment = async (comment) => {
      // À implémenter lorsque le service Comment sera disponible
      console.log('Approbation du commentaire:', comment);
    };

    const rejectComment = async (comment) => {
      // À implémenter lorsque le service Comment sera disponible
      console.log('Rejet du commentaire:', comment);
    };

    const deleteComment = async (comment) => {
      // À implémenter lorsque le service Comment sera disponible
      console.log('Suppression du commentaire:', comment);
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

    // Navigation between sections
    onMounted(() => {
      // Charger les données initiales
      console.log('Composant monté, chargement des données initiales');
      loadDashboardData();
      loadBooks();
      loadUsers();
      loadAuthors();
      loadEditors();
      loadCategories();
    });

    // Surveiller les changements de section pour charger les données appropriées
    watch(currentSection, (newSection) => {
      console.log('Section changée:', newSection);

      // Charger les données spécifiques à la section
      switch (newSection) {
        case 'dashboard':
          loadDashboardData();
          break;
        case 'books':
          loadBooks();
          break;
        case 'users':
          loadUsers();
          break;
        case 'authors':
          loadAuthors();
          break;
        case 'editors':
          loadEditors();
          break;
        case 'categories':
          loadCategories();
          break;
        case 'settings':
          loadSettings();
          break;
        // Autres sections si nécessaire
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
      showAddEditorModal,
      editorToEdit,
      showAddSeriesModal,

      // États pour les données
      filteredBooks,
      filteredOrders,
      filteredUsers,
      categories,
      filteredAuthors,
      recentActivity,
      stats,
      editors,
      notifications,
      series,
      comments,

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

      // Fonctions pour les actions sur les éditeurs
      editEditor,
      deleteEditor,
      onEditorAdded,
      onEditorUpdated,

      // Fonctions pour les actions sur les séries
      editSeries,
      deleteSeries,
      onSeriesAdded,
      onSeriesUpdated,

      // Fonctions pour les actions sur les commentaires
      approveComment,
      rejectComment,
      deleteComment,

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
