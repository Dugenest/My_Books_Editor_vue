<template>
  <div class="profile-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement du profil...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserProfile" class="retry-button">Réessayer</button>
    </div>

    <div v-else class="profile-content">
      <!-- En-tête du profil -->
      <div class="profile-header">
        <div class="profile-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="profile-info">
          <h1>{{ user.firstName }} {{ user.lastName }}</h1>
          <p class="user-email">{{ user.email }}</p>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="profile-section">
        <h2>Informations personnelles</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Prénom</label>
            <p v-if="!editMode">{{ user.firstName }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.firstName"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Nom</label>
            <p v-if="!editMode">{{ user.lastName }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.lastName"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Email</label>
            <p v-if="!editMode">{{ user.email }}</p>
            <input
              v-else
              type="email"
              v-model="editedUser.email"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Nom d'utilisateur</label>
            <p v-if="!editMode">{{ user.username }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.username"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Téléphone</label>
            <p v-if="!editMode">{{ user.phone || 'Non renseigné' }}</p>
            <input
              v-else
              type="tel"
              v-model="editedUser.phone"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Date d'inscription</label>
            <p>{{ getRegistrationDate() }}</p>
          </div>
        </div>
        <div class="edit-buttons">
          <button v-if="!editMode" @click="startEdit" class="edit-btn">
            <i class="fas fa-edit"></i> Modifier mes informations
          </button>
          <div v-else class="action-buttons">
            <button @click="saveChanges" class="save-btn" :disabled="saving">
              <i class="fas fa-save"></i>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              <i class="fas fa-times"></i> Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- Adresse -->
      <div class="profile-section">
        <h2>Adresse</h2>
        <div class="info-grid">
          <div class="info-item full-width">
            <label>Adresse complète</label>
            <p v-if="!editMode">
              {{ user.address || 'Non renseignée' }}
            </p>
            <textarea
              v-else
              v-model="editedUser.fullAddress"
              class="edit-input address-textarea"
              placeholder="Exemple: 7 rue charles saint, 80630, Beauval, France"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="profile-section">
        <h2>Statistiques</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <i class="fas fa-shopping-bag"></i>
            <div class="stat-info">
              <span class="stat-value">{{ userStats.orderCount || 0 }}</span>
              <span class="stat-label">Commandes</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-book"></i>
            <div class="stat-info">
              <span class="stat-value">{{ userStats.bookCount || 0 }}</span>
              <span class="stat-label">Livres achetés</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-heart"></i>
            <div class="stat-info">
              <span class="stat-value">{{ userStats.wishlistCount || 0 }}</span>
              <span class="stat-label">Liste d'envies</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dernières commandes -->
      <div class="profile-section">
        <h2>Dernières commandes</h2>
        <div v-if="userOrders.length === 0" class="no-orders">
          <i class="fas fa-shopping-bag"></i>
          <p>Aucune commande pour le moment</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="order in userOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-number">Commande #{{ order.id }}</span>
                <span class="order-date">{{
                  formatDate(order.createdAt)
                }}</span>
              </div>
              <span :class="['order-status', order.status.toLowerCase()]">
                {{ order.status }}
              </span>
            </div>
            <div class="order-items">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
              >
                <div class="item-image">
                  <img
                    v-if="item.book.picture"
                    :src="item.book.picture"
                    :alt="item.book.title"
                  />
                  <div v-else class="item-placeholder">
                    <i class="fas fa-book"></i>
                  </div>
                </div>
                <div class="item-details">
                  <h3>{{ item.book.title }}</h3>
                  <p class="item-quantity">Quantité: {{ item.quantity }}</p>
                  <p class="item-price">{{ formatPrice(item.price) }}</p>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="order-total">
                <span>Total:</span>
                <span>{{ formatPrice(order.total) }}</span>
              </div>
              <router-link
                :to="{ name: 'OrderDetails', params: { id: order.id } }"
                class="view-order-btn"
              >
                Voir les détails
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, reactive } from 'vue';
import apiClient from '@/services/api';
import OrderService from '@/services/OrderService';
import UserService from '@/services/UserService';

export default {
  name: 'ProfileView',

  setup() {
    const user = ref({});
    const userStats = ref({});
    const userOrders = ref([]);
    const loading = ref(true);
    const error = ref('');
    const editMode = ref(false);
    const saving = ref(false);
    const editedUser = reactive({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phone: '',
      fullAddress: '',
    });

    const fetchUserProfile = async () => {
      loading.value = true;
      error.value = '';

      try {
        // Utiliser le bon endpoint sans duplication du préfixe /api
        const response = await apiClient.get('/users/me');
        user.value = response.data;

        console.log('Informations utilisateur:', user.value);
        console.log('Date inscription:', user.value.registrationDate);

        // Obtenir les statistiques avec l'ID utilisateur
        const statsResponse = await apiClient.get(
          `/users/${user.value.id}/stats`
        );
        userStats.value = statsResponse.data;

        // Obtenir les commandes avec l'ID utilisateur
        const ordersResponse = await OrderService.getUserOrders(user.value.id);
        userOrders.value = ordersResponse.data.content || [];
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        error.value =
          'Impossible de charger votre profil. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    const startEdit = () => {
      // Copie des données utilisateur pour l'édition
      editedUser.firstName = user.value.firstName || '';
      editedUser.lastName = user.value.lastName || '';
      editedUser.email = user.value.email || '';
      editedUser.username = user.value.username || '';
      editedUser.phone = user.value.phone || '';
      editedUser.fullAddress = user.value.address || '';

      editMode.value = true;
    };

    const saveChanges = async () => {
      saving.value = true;
      try {
        // Préparation des données à envoyer
        const userData = {
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          phone: editedUser.phone,
          address: editedUser.fullAddress,
          email: editedUser.email,
          username: editedUser.username,
          // Conserver la date d'inscription
          registrationDate: user.value.registrationDate || user.value.createdAt,
        };

        console.log('Données à envoyer:', userData);

        // Envoyer les modifications
        const response = await UserService.update(user.value.id, userData);

        // Mettre à jour les données locales
        user.value = response.data;

        // Quitter le mode édition
        editMode.value = false;

        // Afficher un message de succès
        alert('Vos informations ont été mises à jour avec succès');
      } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        alert(
          'Une erreur est survenue lors de la mise à jour de vos informations'
        );
      } finally {
        saving.value = false;
      }
    };

    const cancelEdit = () => {
      editMode.value = false;
    };

    const formatDate = (date) => {
      if (!date) return 'Non disponible';
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    onMounted(fetchUserProfile);

    // Méthode pour s'assurer que la date d'inscription est correctement affichée
    const getRegistrationDate = () => {
      if (user.value.registrationDate) {
        return formatDate(user.value.registrationDate);
      } else if (user.value.createdAt) {
        return formatDate(user.value.createdAt);
      } else {
        return 'Non disponible';
      }
    };

    return {
      user,
      userStats,
      userOrders,
      loading,
      error,
      editMode,
      editedUser,
      saving,
      fetchUserProfile,
      formatDate,
      formatPrice,
      startEdit,
      saveChanges,
      cancelEdit,
      getRegistrationDate,
    };
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-state i,
.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error-state {
  color: #d32f2f;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #303f9f;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  font-size: 4rem;
  color: #3f51b5;
}

.profile-info h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.user-email {
  margin: 0.5rem 0 0;
  color: #666;
}

.profile-section {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  margin: 0 0 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-item p {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.stat-card i {
  font-size: 2rem;
  color: #3f51b5;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.no-orders {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-orders i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
}

.order-info {
  display: flex;
  flex-direction: column;
}

.order-number {
  font-weight: bold;
  color: #333;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.order-status.pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.order-status.processing {
  background-color: #e3f2fd;
  color: #1976d2;
}

.order-status.completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.order-status.cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
}

.item-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #333;
}

.item-quantity {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.item-price {
  margin: 0.5rem 0 0;
  font-weight: 500;
  color: #3f51b5;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
}

.order-total {
  font-weight: bold;
  color: #333;
}

.view-order-btn {
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.view-order-btn:hover {
  background-color: #303f9f;
}

.edit-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-btn:hover {
  background-color: #303f9f;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.save-btn:hover {
  background-color: #388e3c;
}

.save-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #d32f2f;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.edit-buttons {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
}

.address-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.full-width {
  grid-column: 1 / -1;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .profile-section {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
