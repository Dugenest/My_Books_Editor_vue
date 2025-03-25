<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo et nom du site -->
      <div class="site-brand">
        <router-link to="/" class="brand-link">
          <div class="logo-container">
            <img
              src="@/assets/images/MyBooks.png"
              alt="My Books Editor"
              class="site-logo"
              @error="onLogoError"
            />
            <i v-if="logoError" class="fas fa-book-open site-logo-fallback"></i>
          </div>
          <span class="site-name">MyBooksEditor</span>
        </router-link>
      </div>

      <!-- Navigation principale -->
      <nav class="main-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Accueil</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/categories" class="nav-link"
              >Catégories</router-link
            >
          </li>
          <li class="nav-item">
            <router-link to="/authors" class="nav-link">Auteurs</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/series" class="nav-link">Séries</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/new-releases" class="nav-link"
              >Nouveautés</router-link
            >
          </li>
          <li class="nav-item">
            <router-link to="/popular" class="nav-link">Populaires</router-link>
          </li>
        </ul>
      </nav>

      <!-- Recherche, panier et profil utilisateur -->
      <div class="header-actions">
        <!-- Recherche -->
        <div class="search-bar">
          <input
            type="text"
            v-model="searchQuery"
            @keyup.enter="performSearch"
            placeholder="Rechercher..."
            class="search-input"
          />
          <button @click="performSearch" class="search-button">
            <i class="fas fa-search"></i>
          </button>
        </div>

        <!-- Panier -->
        <div class="cart-dropdown">
          <button class="cart-button" @click="toggleCartDropdown">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="itemCount > 0" class="cart-badge">{{ itemCount }}</span>
          </button>

          <div v-show="showCartDropdown" class="cart-dropdown-content">
            <div v-if="cartItems.length === 0" class="empty-cart">
              <p>Votre panier est vide</p>
              <router-link to="/" class="btn-shop"
                >Parcourir le catalogue</router-link
              >
            </div>
            <div v-else>
              <div class="cart-items">
                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                  <div v-if="item.coverImage" class="item-image">
                    <img :src="item.coverImage" :alt="item.title" />
                  </div>
                  <div v-else class="item-image-placeholder">
                    <i class="fas fa-book"></i>
                  </div>
                  <div class="item-details">
                    <div class="item-title">{{ item.title }}</div>
                    <div class="item-quantity-price">
                      <span class="item-quantity">{{ item.quantity }} × </span>
                      <span class="item-price">{{
                        formatPrice(item.price)
                      }}</span>
                    </div>
                  </div>
                  <button @click="removeItem(item.id)" class="btn-remove">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div class="cart-summary">
                <div class="cart-total">
                  <span>Total:</span>
                  <span>{{ formatPrice(cartTotal) }}</span>
                </div>
                <div class="cart-actions">
                  <router-link to="/basket" class="btn-view-cart"
                    >Voir le panier</router-link
                  >
                  <router-link to="/checkout" class="btn-checkout"
                    >Commander</router-link
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profil utilisateur -->
        <div class="user-dropdown">
          <button class="user-button" @click="toggleUserDropdown">
            <i class="fas fa-user"></i>
          </button>

          <div v-show="showUserDropdown" class="user-dropdown-content">
            <div v-if="isAuthenticated">
              <div class="user-info">
                <span class="user-name">{{ userName }}</span>
                <span class="user-email">{{ userEmail }}</span>
              </div>
              <div class="user-links">
                <router-link to="/profile" class="dropdown-link">
                  <i class="fas fa-user-circle"></i> Mon profil
                </router-link>
                <router-link to="/orders" class="dropdown-link">
                  <i class="fas fa-shopping-bag"></i> Mes commandes
                </router-link>
                <router-link to="/wishlist" class="dropdown-link">
                  <i class="fas fa-heart"></i> Ma liste d'envies
                </router-link>
                <!-- Option pour les administrateurs -->
                <router-link
                  v-if="isAdmin"
                  to="/admin/settings"
                  class="dropdown-link"
                >
                  <i class="fas fa-cog"></i> Paramètres du site
                </router-link>
                <a href="#" @click.prevent="logout" class="dropdown-link">
                  <i class="fas fa-sign-out-alt"></i> Déconnexion
                </a>
              </div>
            </div>
            <div v-else class="user-auth">
              <router-link to="/login" class="btn-login">Connexion</router-link>
              <router-link to="/register" class="btn-register"
                >Inscription</router-link
              >
            </div>
          </div>
        </div>

        <!-- Menu mobile -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <i :class="[showMobileMenu ? 'fa-times' : 'fa-bars', 'fas']"></i>
        </button>
      </div>
    </div>

    <!-- Menu mobile -->
    <div v-show="showMobileMenu" class="mobile-menu">
      <nav :class="['mobile-nav', showMobileMenu ? 'active' : '']">
        <ul class="mobile-nav-list">
          <li class="mobile-nav-item">
            <router-link
              to="/"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Accueil</router-link
            >
          </li>
          <li class="mobile-nav-item">
            <router-link
              to="/categories"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Catégories</router-link
            >
          </li>
          <li class="mobile-nav-item">
            <router-link
              to="/authors"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Auteurs</router-link
            >
          </li>
          <li class="mobile-nav-item">
            <router-link
              to="/series"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Séries</router-link
            >
          </li>
          <li class="mobile-nav-item">
            <router-link
              to="/new-releases"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Nouveautés</router-link
            >
          </li>
          <li class="mobile-nav-item">
            <router-link
              to="/popular"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Populaires</router-link
            >
          </li>
          <li class="mobile-nav-item">
            <router-link
              to="/basket"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
            >
              Panier
              <span v-if="itemCount > 0" class="mobile-cart-badge"
                >({{ itemCount }})</span
              >
            </router-link>
          </li>

          <!-- Séparateur pour les utilisateurs connectés -->
          <li v-if="isAuthenticated" class="mobile-nav-separator">
            <div class="separator-line"></div>
            <div class="separator-text">Mon compte</div>
          </li>

          <li v-if="isAuthenticated" class="mobile-nav-item">
            <router-link
              to="/profile"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Mon profil</router-link
            >
          </li>
          <li v-if="isAuthenticated" class="mobile-nav-item">
            <router-link
              to="/orders"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Mes commandes</router-link
            >
          </li>
          <li v-if="isAuthenticated && isAdmin" class="mobile-nav-item">
            <router-link
              to="/admin/settings"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Paramètres du site</router-link
            >
          </li>
          <li v-if="isAuthenticated" class="mobile-nav-item">
            <a href="#" @click.prevent="logout" class="mobile-nav-link"
              >Déconnexion</a
            >
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'AppHeader',

  setup() {
    const router = useRouter();
    const store = useStore();

    // États
    const searchQuery = ref('');
    const showCartDropdown = ref(false);
    const showUserDropdown = ref(false);
    const showMobileMenu = ref(false);
    const logoError = ref(false);

    // Propriétés calculées
    const isAuthenticated = computed(() => store.getters['auth/isLoggedIn']);
    const isAdmin = computed(() => store.getters['auth/hasRole']('ADMIN'));
    const userName = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user ? `${user.firstName} ${user.lastName}` : '';
    });
    const userEmail = computed(() => {
      const user = store.getters['auth/currentUser'];
      return user ? user.email : '';
    });

    const cartItems = computed(() => store.state.basket.items);
    const itemCount = computed(() => store.getters['basket/itemCount']);
    const cartTotal = computed(() => store.getters['basket/totalPrice']);

    // Méthodes
    const performSearch = () => {
      if (!searchQuery.value.trim()) return;

      router.push({
        name: 'SearchResults',
        query: { q: searchQuery.value },
      });

      searchQuery.value = '';
      showMobileMenu.value = false;
    };

    const toggleCartDropdown = () => {
      showCartDropdown.value = !showCartDropdown.value;
      if (showCartDropdown.value) {
        showUserDropdown.value = false;
      }
    };

    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value;
      if (showUserDropdown.value) {
        showCartDropdown.value = false;
      }
    };

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value;
    };

    const removeItem = (itemId) => {
      store.dispatch('basket/removeItem', itemId);
    };

    const logout = () => {
      store.dispatch('auth/logout');
      showUserDropdown.value = false;
      showMobileMenu.value = false;
      router.push('/');
    };

    const formatPrice = (price) => {
      return `${price.toFixed(2)} €`;
    };

    const closeDropdowns = (event) => {
      // Fermer les dropdown si on clique ailleurs
      if (
        !event.target.closest('.cart-dropdown') &&
        !event.target.closest('.user-dropdown')
      ) {
        showCartDropdown.value = false;
        showUserDropdown.value = false;
      }
    };

    const onLogoError = () => {
      logoError.value = true;
    };

    // Observateurs
    watch(showCartDropdown, (newVal) => {
      if (newVal) {
        // Initialiser le panier si ce n'est pas déjà fait
        store.dispatch('basket/initializeBasket');
      }
    });

    // Gestion des événements
    onMounted(() => {
      // Initialiser le panier
      store.dispatch('basket/initializeBasket');

      // Ajouter un écouteur d'événement pour fermer les dropdown lors d'un clic en dehors
      document.addEventListener('click', closeDropdowns);

      // Fermer le menu mobile lors de changements de route
      router.afterEach(() => {
        showMobileMenu.value = false;
      });
    });

    onBeforeUnmount(() => {
      // Supprimer l'écouteur d'événement
      document.removeEventListener('click', closeDropdowns);
    });

    return {
      searchQuery,
      showCartDropdown,
      showUserDropdown,
      showMobileMenu,
      isAuthenticated,
      isAdmin,
      userName,
      userEmail,
      cartItems,
      itemCount,
      cartTotal,
      performSearch,
      toggleCartDropdown,
      toggleUserDropdown,
      toggleMobileMenu,
      removeItem,
      logout,
      formatPrice,
      logoError,
      onLogoError,
    };
  },
};
</script>

<style scoped>
.app-header {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: auto;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo et nom du site */
.site-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.logo-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.site-logo {
  max-width: 100%;
  max-height: 100%;
  height: auto;
}

.site-logo-fallback {
  font-size: 1.8rem;
  color: #3f51b5;
}

.site-name {
  font-size: 1.5rem;
  font-weight: bold;
}

/* Navigation principale */
.main-nav {
  display: flex;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin: 0 15px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 0;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background-color: #3f51b5;
  transition: width 0.3s;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

/* Actions (recherche, panier, profil) */
.header-actions {
  display: flex;
  align-items: center;
}

/* Barre de recherche */
.search-bar {
  display: flex;
  margin-right: 15px;
}

.search-input {
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  width: 200px;
}

.search-button {
  padding: 8px 12px;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

/* Panier dropdown */
.cart-dropdown,
.user-dropdown {
  position: relative;
  margin-left: 15px;
}

.cart-button,
.user-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #333;
  cursor: pointer;
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e91e63;
  color: white;
  border-radius: 50%;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-dropdown-content,
.user-dropdown-content {
  position: absolute;
  right: 0;
  top: 100%;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  min-width: 300px;
  z-index: 1000;
  padding: 15px;
  margin-top: 10px;
}

.cart-dropdown-content::before,
.user-dropdown-content::before {
  content: '';
  position: absolute;
  top: -10px;
  right: 10px;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
}

/* Contenu du panier */
.empty-cart {
  text-align: center;
  padding: 20px 0;
}

.btn-shop {
  display: inline-block;
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
}

.cart-items {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 50px;
  height: 70px;
  object-fit: cover;
  margin-right: 10px;
}

.item-details {
  flex-grow: 1;
}

.item-title {
  font-weight: 500;
  margin-bottom: 5px;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.item-quantity-price {
  font-size: 0.9rem;
  color: #666;
}

.item-price {
  font-weight: 500;
  color: #e91e63;
}

.btn-remove {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 5px;
}

.btn-remove:hover {
  color: #f44336;
}

.cart-summary {
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.cart-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 15px;
}

.cart-actions {
  display: flex;
  gap: 10px;
}

.btn-view-cart,
.btn-checkout {
  padding: 8px 15px;
  border-radius: 4px;
  text-decoration: none;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
  flex: 1;
}

.btn-view-cart {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-checkout {
  background-color: #3f51b5;
  color: white;
  border: none;
}

/* Dropdown utilisateur */
.user-info {
  display: flex;
  flex-direction: column;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
}

.user-name {
  font-weight: 500;
  font-size: 1rem;
}

.user-email {
  font-size: 0.8rem;
  color: #666;
}

.user-links {
  display: flex;
  flex-direction: column;
}

.dropdown-link {
  padding: 10px 0;
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.dropdown-link:hover {
  color: #3f51b5;
}

.dropdown-link i {
  width: 20px;
  text-align: center;
}

.user-auth {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-login,
.btn-register {
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  text-align: center;
  font-weight: 500;
}

.btn-login {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-register {
  background-color: #3f51b5;
  color: white;
  border: none;
}

/* Menu mobile */
.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #333;
  cursor: pointer;
  margin-left: 15px;
}

.mobile-menu {
  display: none;
  background-color: white;
  padding: 15px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
}

.mobile-nav {
  display: none;
}

.mobile-nav.active {
  display: block;
}

.mobile-nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  margin: 10px 0;
}

.mobile-nav-link {
  color: #333;
  text-decoration: none;
  font-weight: 500;
  display: block;
  padding: 10px;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.mobile-cart-badge {
  color: #e91e63;
  font-weight: bold;
}

/* Styles pour le séparateur du menu mobile */
.mobile-nav-separator {
  margin: 15px 0;
  position: relative;
}

.separator-line {
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
}

.separator-text {
  color: #999;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 5px 0;
}

/* Responsive */
@media (max-width: 992px) {
  .main-nav {
    display: none;
  }

  .mobile-menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: block;
    display: none; /* Par défaut, le menu est caché */
  }

  .mobile-menu.show {
    display: block;
  }

  .search-input {
    width: 150px;
  }
}

@media (max-width: 768px) {
  .search-bar {
    display: none;
  }

  .header-container {
    height: 60px;
  }

  .site-logo {
    height: 30px;
  }

  .site-name {
    font-size: 1.2rem;
  }
}

.item-image-placeholder {
  width: 50px;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-right: 10px;
  color: #6c757d;
}

.item-image-placeholder i {
  font-size: 1.5rem;
}
</style>
