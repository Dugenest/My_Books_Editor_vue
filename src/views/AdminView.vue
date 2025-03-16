<!-- AdminView.vue - Point d'entrée de l'interface d'administration -->
<template>
  <div class="admin-view">
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
import AdminDashboard from '@/components/admin/AdminDashboard.vue';
import { onMounted, ref } from 'vue';

export default {
  name: 'AdminView',

  components: {
    AdminDashboard,
  },

  setup() {
    const isLoading = ref(true);
    const isAuthorized = ref(false);

    // Exécuter la vérification au montage du composant
    onMounted(() => {
      console.log('Composant AdminView monté');
      // Nous sommes déjà passés par requireAdmin, donc accès autorisé
      isAuthorized.value = true;
      isLoading.value = false;
    });

    return {
      isLoading,
      isAuthorized,
    };
  },
};
</script>

<style scoped>
.admin-view {
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
