<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Mon Tableau de Bord</h1>
      <div class="user-welcome" v-if="user">
        <span>Bienvenue, {{ user.firstName }} {{ user.lastName }}</span>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="dashboard-sidebar">
        <nav class="dashboard-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="['nav-item', { active: currentTab === tab.id }]"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <div class="dashboard-main">
        <!-- Aperçu général -->
        <div v-if="currentTab === 'overview'" class="dashboard-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-shopping-bag"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.totalOrders }}</span>
                <span class="stat-label">Commandes totales</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-heart"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.wishlistItems }}</span>
                <span class="stat-label">Liste de souhaits</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-book"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ stats.totalBooks }}</span>
                <span class="stat-label">Livres achetés</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-euro-sign"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value"
                  >{{ formatPrice(stats.totalSpent) }} €</span
                >
                <span class="stat-label">Total dépensé</span>
              </div>
            </div>
          </div>

          <div class="recent-activity">
            <h2>Activité récente</h2>
            <div class="activity-list">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">
                  <i :class="activity.icon"></i>
                </div>
                <div class="activity-details">
                  <p class="activity-text">{{ activity.text }}</p>
                  <span class="activity-date">{{
                    formatDate(activity.date)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Commandes -->
        <div v-if="currentTab === 'orders'" class="dashboard-section">
          <div class="section-header">
            <h2>Mes Commandes</h2>
            <div class="filters">
              <select v-model="orderFilter" class="filter-select">
                <option value="all">Toutes les commandes</option>
                <option value="pending">En cours</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
          </div>

          <div class="orders-list">
            <div
              v-for="order in filteredOrders"
              :key="order.id"
              class="order-card"
            >
              <div class="order-header">
                <div class="order-info">
                  <span class="order-number">Commande #{{ order.number }}</span>
                  <span class="order-date">{{ formatDate(order.date) }}</span>
                </div>
                <div class="order-status" :class="order.status.toLowerCase()">
                  {{ order.status }}
                </div>
              </div>

              <div class="order-items">
                <div
                  v-for="item in order.items"
                  :key="item.id"
                  class="order-item"
                >
                  <img
                    :src="item.coverImage"
                    :alt="item.title"
                    class="item-image"
                  />
                  <div class="item-details">
                    <span class="item-title">{{ item.title }}</span>
                    <span class="item-quantity">x{{ item.quantity }}</span>
                  </div>
                  <span class="item-price"
                    >{{ formatPrice(item.price) }} €</span
                  >
                </div>
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span>Total</span>
                  <span class="total-amount"
                    >{{ formatPrice(order.total) }} €</span
                  >
                </div>
                <router-link
                  :to="{ name: 'OrderDetails', params: { id: order.id } }"
                  class="btn-details"
                >
                  Voir les détails
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste de souhaits -->
        <div v-if="currentTab === 'wishlist'" class="dashboard-section">
          <div class="section-header">
            <h2>Ma Liste de Souhaits</h2>
          </div>

          <div class="wishlist-grid">
            <div
              v-for="book in wishlistItems"
              :key="book.id"
              class="wishlist-item"
            >
              <button
                class="remove-wishlist"
                @click="removeFromWishlist(book.id)"
              >
                <i class="fas fa-times"></i>
              </button>
              <img
                :src="book.coverImage"
                :alt="book.title"
                class="book-cover"
              />
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">{{ book.author }}</p>
                <p class="book-price">{{ formatPrice(book.price) }} €</p>
                <button
                  class="add-to-cart"
                  @click="addToCart(book)"
                  :disabled="!book.inStock"
                >
                  <i class="fas fa-shopping-cart"></i>
                  {{ book.inStock ? 'Ajouter au panier' : 'Indisponible' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Profil -->
        <div v-if="currentTab === 'profile'" class="dashboard-section">
          <div class="section-header">
            <h2>Mon Profil</h2>
          </div>

          <form @submit.prevent="updateProfile" class="profile-form">
            <div class="form-section">
              <h3>Informations personnelles</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input
                    type="text"
                    id="firstName"
                    v-model="profile.firstName"
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input
                    type="text"
                    id="lastName"
                    v-model="profile.lastName"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="profile.email"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input type="tel" id="phone" v-model="profile.phone" />
              </div>
            </div>

            <div class="form-section">
              <h3>Adresse de livraison par défaut</h3>
              <div class="form-group">
                <label for="address">Adresse</label>
                <input type="text" id="address" v-model="profile.address" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="postalCode">Code postal</label>
                  <input
                    type="text"
                    id="postalCode"
                    v-model="profile.postalCode"
                    pattern="[0-9]{5}"
                  />
                </div>
                <div class="form-group">
                  <label for="city">Ville</label>
                  <input type="text" id="city" v-model="profile.city" />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3>Changer le mot de passe</h3>
              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  v-model="passwordChange.current"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="newPassword">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="newPassword"
                    v-model="passwordChange.new"
                  />
                </div>
                <div class="form-group">
                  <label for="confirmPassword">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    v-model="passwordChange.confirm"
                  />
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-primary" :disabled="loading">
                <span v-if="loading">
                  <i class="fas fa-spinner fa-spin"></i> Enregistrement...
                </span>
                <span v-else>Enregistrer les modifications</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'DashboardView',

  setup() {
    const store = useStore();
    const currentTab = ref('overview');
    const loading = ref(false);
    const orderFilter = ref('all');

    const tabs = [
      { id: 'overview', label: 'Aperçu', icon: 'fas fa-home' },
      { id: 'orders', label: 'Commandes', icon: 'fas fa-shopping-bag' },
      { id: 'wishlist', label: 'Liste de souhaits', icon: 'fas fa-heart' },
      { id: 'profile', label: 'Profil', icon: 'fas fa-user' },
    ];

    const user = computed(() => store.state.auth.user);
    const wishlistItems = computed(() => store.state.wishlist.items);

    const profile = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
    });

    const passwordChange = ref({
      current: '',
      new: '',
      confirm: '',
    });

    const stats = ref({
      totalOrders: 0,
      wishlistItems: 0,
      totalBooks: 0,
      totalSpent: 0,
    });

    const recentActivities = ref([]);
    const orders = ref([]);

    const filteredOrders = computed(() => {
      if (orderFilter.value === 'all') return orders.value;
      return orders.value.filter(
        (order) => order.status.toLowerCase() === orderFilter.value
      );
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const fetchDashboardData = async () => {
      loading.value = true;
      try {
        const [statsData, activitiesData, ordersData] = await Promise.all([
          store.dispatch('dashboard/getStats'),
          store.dispatch('dashboard/getRecentActivities'),
          store.dispatch('orders/getOrders'),
        ]);

        stats.value = statsData;
        recentActivities.value = activitiesData;
        orders.value = ordersData;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        loading.value = false;
      }
    };

    const updateProfile = async () => {
      loading.value = true;
      try {
        await store.dispatch('auth/updateProfile', {
          ...profile.value,
          passwordChange: passwordChange.value.new
            ? passwordChange.value
            : null,
        });
        // Réinitialiser les champs de mot de passe
        passwordChange.value = { current: '', new: '', confirm: '' };
      } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
      } finally {
        loading.value = false;
      }
    };

    const removeFromWishlist = (bookId) => {
      store.dispatch('wishlist/removeFromWishlist', bookId);
    };

    const addToCart = (book) => {
      store.dispatch('cart/addItem', {
        id: book.id,
        title: book.title,
        price: book.price,
        quantity: 1,
        coverImage: book.coverImage,
      });
    };

    onMounted(() => {
      fetchDashboardData();
      if (user.value) {
        profile.value = { ...user.value };
      }
    });

    return {
      currentTab,
      tabs,
      user,
      profile,
      passwordChange,
      stats,
      recentActivities,
      orders,
      orderFilter,
      filteredOrders,
      wishlistItems,
      loading,
      formatPrice,
      formatDate,
      updateProfile,
      removeFromWishlist,
      addToCart,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #333;
  font-size: 2rem;
}

.user-welcome {
  color: #666;
  font-size: 1.1rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

.dashboard-sidebar {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.dashboard-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: none;
  background: none;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #3f51b5;
}

.nav-item.active {
  background-color: #3f51b5;
  color: white;
}

.nav-item i {
  width: 20px;
}

.dashboard-main {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: #f5f7ff;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #3f51b5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.recent-activity {
  margin-top: 2rem;
}

.recent-activity h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3f51b5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-details {
  flex: 1;
}

.activity-text {
  color: #333;
  margin-bottom: 0.25rem;
}

.activity-date {
  color: #666;
  font-size: 0.85rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.25rem;
  color: #333;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

.order-number {
  font-weight: 600;
  color: #333;
}

.order-date {
  color: #666;
  font-size: 0.9rem;
  margin-left: 1rem;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
}

.order-status.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.order-status.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.order-status.cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 0;
}

.item-image {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title {
  font-weight: 500;
  color: #333;
}

.item-quantity {
  color: #666;
  font-size: 0.9rem;
}

.item-price {
  color: #333;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.total-amount {
  font-weight: 600;
  color: #333;
}

.btn-details {
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-details:hover {
  background-color: #303f9f;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.wishlist-item {
  position: relative;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.remove-wishlist {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.remove-wishlist:hover {
  background-color: #ffebee;
}

.book-cover {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.book-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.book-price {
  color: #3f51b5;
  font-weight: 500;
  margin-bottom: 1rem;
}

.add-to-cart {
  width: 100%;
  padding: 0.5rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #303f9f;
}

.add-to-cart:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.profile-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3f51b5;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #303f9f;
}

.btn-primary:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

@media (max-width: 968px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .dashboard-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .nav-item {
    white-space: nowrap;
  }
}

@media (max-width: 576px) {
  .dashboard-container {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .wishlist-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
