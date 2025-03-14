<!-- AdminDashboardView.vue - Point d'entrée de l'interface d'administration -->
<template>
  <div class="admin-dashboard-view">
    <!-- Loader pendant la vérification de l'authentification -->
    <div v-if="isLoading" class="admin-loader">
      <div class="loader-spinner"></div>
      <p>Chargement en cours...</p>
    </div>

    <!-- Message si non autorisé -->
    <div v-else-if="!isAuthorized" class="unauthorized-message">
      <div class="unauthorized-container">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Accès restreint</h2>
        <p>
          Vous n'avez pas les droits nécessaires pour accéder à
          l'administration.
        </p>
        <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
      </div>
    </div>

    <!-- Interface d'administration -->
    <AdminDashboard v-else />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import AdminDashboard from '@/components/admin/shared/AdminDashboard.vue';
import BookService from '@/services/BookService';
import ActivityService from '@/services/ActivityService';

export default {
  name: 'AdminDashboardView',

  components: {
    AdminDashboard,
  },

  setup() {
    const router = useRouter();
    const store = useStore();

    const isLoading = ref(true);
    const isAuthorized = ref(false);
    const books = ref([]);
    const dashboardStats = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(0);
    const pageSize = ref(10);

    // Vérifier si l'utilisateur est authentifié et a les droits d'accès
    const checkAuthorization = async () => {
      try {
        const currentUser = store.getters['auth/currentUser'];

        if (!currentUser) {
          router.push({
            path: '/login',
            query: { redirect: router.currentRoute.value.fullPath },
          });
          return;
        }

        // Vérifier les droits d'accès
        if (currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR') {
          isAuthorized.value = true;

          // Charger les données après autorisation
          await Promise.all([loadBooks(), loadDashboardStats()]);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des droits :', error);
        store.dispatch('notify', {
          type: 'error',
          message: 'Erreur de chargement des données',
        });
      } finally {
        isLoading.value = false;
      }
    };

    // Charger les livres
    const loadBooks = async () => {
      try {
        const response = await BookService.getBooks(
          currentPage.value,
          pageSize.value
        );
        books.value = response.data.content;
        totalPages.value = response.data.totalPages;
      } catch (error) {
        console.error('Erreur lors du chargement des livres', error);
        store.dispatch('notify', {
          type: 'error',
          message: 'Impossible de charger les livres',
        });
      }
    };

    // Charger les statistiques du tableau de bord
    const loadDashboardStats = async () => {
      try {
        dashboardStats.value = await ActivityService.getStats();
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques', error);
        store.dispatch('notify', {
          type: 'error',
          message: 'Impossible de charger les statistiques',
        });
      }
    };

    // Pagination
    const changePage = async (newPage) => {
      currentPage.value = newPage;
      await loadBooks();
    };

    onMounted(() => {
      checkAuthorization();
    });

    return {
      isLoading,
      isAuthorized,
      books,
      dashboardStats,
      currentPage,
      totalPages,
      pageSize,
      changePage,
    };
  },
};
</script>

<style scoped>
.admin-dashboard-view {
  min-height: 100vh;
  width: 100%;
}

.admin-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: #666;
}

.loader-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #1a237e;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.unauthorized-message {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.unauthorized-container {
  text-align: center;
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.unauthorized-container i {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.unauthorized-container h2 {
  margin-bottom: 1rem;
  color: #333;
}

.unauthorized-container p {
  margin-bottom: 1.5rem;
  color: #666;
}

.btn-primary {
  display: inline-block;
  background-color: #1a237e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
}

.btn-primary:hover {
  background-color: #303f9f;
}
</style>
