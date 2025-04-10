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
          <li class="nav-item accessibility-dropdown">
            <a
              href="#"
              class="nav-link"
              @click.prevent="toggleAccessibilityMenu"
            >
              Accessibilité <i class="fas fa-chevron-down"></i>
            </a>
            <div
              v-show="showAccessibilityMenu"
              class="accessibility-dropdown-content"
            >
              <div class="accessibility-section">
                <h3>Thème</h3>
                <div class="theme-options">
                  <button
                    @click="setTheme('light')"
                    class="theme-option"
                    :class="{ active: currentTheme === 'light' }"
                  >
                    <i class="fas fa-sun"></i> Clair
                  </button>
                  <button
                    @click="setTheme('dark')"
                    class="theme-option"
                    :class="{ active: currentTheme === 'dark' }"
                  >
                    <i class="fas fa-moon"></i> Sombre
                  </button>
                </div>
              </div>
              <div class="accessibility-section">
                <h3>Taille du texte</h3>
                <div class="text-size-options">
                  <button
                    @click="setTextSize('small')"
                    class="text-size-option small"
                    :class="{ active: currentTextSize === 'small' }"
                  >
                    A
                  </button>
                  <button
                    @click="setTextSize('medium')"
                    class="text-size-option medium"
                    :class="{ active: currentTextSize === 'medium' }"
                  >
                    A
                  </button>
                  <button
                    @click="setTextSize('large')"
                    class="text-size-option large"
                    :class="{ active: currentTextSize === 'large' }"
                  >
                    A
                  </button>
                </div>
              </div>
              <div class="accessibility-section">
                <h3>Contraste</h3>
                <div class="contrast-options">
                  <button
                    @click="setContrast('normal')"
                    class="contrast-option"
                    :class="{ active: currentContrast === 'normal' }"
                  >
                    Normal
                  </button>
                  <button
                    @click="setContrast('high')"
                    class="contrast-option"
                    :class="{ active: currentContrast === 'high' }"
                  >
                    Élevé
                  </button>
                </div>
              </div>
              <div class="accessibility-section">
                <label class="checkbox-option">
                  <input
                    type="checkbox"
                    v-model="reduceAnimations"
                    @change="setReduceAnimations"
                  />
                  Réduire les animations
                </label>
              </div>
            </div>
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
                <!-- Options pour les administrateurs uniquement -->
                <router-link
                  v-if="isAdmin && !isAuthor && !isEditor"
                  to="/admin"
                  class="dropdown-link"
                >
                  <i class="fas fa-cog"></i> Administration
                </router-link>

                <!-- Option pour les auteurs uniquement -->
                <router-link
                  v-if="isAuthor && !isAdmin"
                  to="/admin/author"
                  class="dropdown-link"
                >
                  <i class="fas fa-user-edit"></i> Espace auteur
                </router-link>

                <!-- Option pour les éditeurs uniquement -->
                <router-link
                  v-if="isEditor && !isAdmin"
                  to="/admin/editor"
                  class="dropdown-link"
                >
                  <i class="fas fa-building"></i> Espace éditeur
                </router-link>

                <!-- Options multiples pour l'administrateur -->
                <div v-if="isAdmin" class="admin-options">
                  <router-link
                    v-if="isAdmin && isAuthor"
                    to="/admin/author"
                    class="dropdown-link"
                  >
                    <i class="fas fa-user-edit"></i> Espace auteur
                  </router-link>
                  <router-link
                    v-if="isAdmin && isEditor"
                    to="/admin/editor"
                    class="dropdown-link"
                  >
                    <i class="fas fa-building"></i> Espace éditeur
                  </router-link>
                </div>
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
          <li class="mobile-nav-item mobile-accessibility-dropdown">
            <a
              href="#"
              class="mobile-nav-link"
              @click.prevent="toggleMobileAccessibility"
            >
              Accessibilité
              <i
                :class="[
                  'fas',
                  showMobileAccessibility ? 'fa-chevron-up' : 'fa-chevron-down',
                ]"
              ></i>
            </a>
            <div
              v-if="showMobileAccessibility"
              class="mobile-accessibility-content"
            >
              <div class="accessibility-section">
                <h3>Thème</h3>
                <div class="theme-options">
                  <button
                    @click="setTheme('light')"
                    class="theme-option"
                    :class="{ active: currentTheme === 'light' }"
                  >
                    <i class="fas fa-sun"></i> Clair
                  </button>
                  <button
                    @click="setTheme('dark')"
                    class="theme-option"
                    :class="{ active: currentTheme === 'dark' }"
                  >
                    <i class="fas fa-moon"></i> Sombre
                  </button>
                </div>
              </div>
              <div class="accessibility-section">
                <h3>Taille du texte</h3>
                <div class="text-size-options">
                  <button
                    @click="setTextSize('small')"
                    class="text-size-option small"
                    :class="{ active: currentTextSize === 'small' }"
                  >
                    A
                  </button>
                  <button
                    @click="setTextSize('medium')"
                    class="text-size-option medium"
                    :class="{ active: currentTextSize === 'medium' }"
                  >
                    A
                  </button>
                  <button
                    @click="setTextSize('large')"
                    class="text-size-option large"
                    :class="{ active: currentTextSize === 'large' }"
                  >
                    A
                  </button>
                </div>
              </div>
              <div class="accessibility-section">
                <h3>Contraste</h3>
                <div class="contrast-options">
                  <button
                    @click="setContrast('normal')"
                    class="contrast-option"
                    :class="{ active: currentContrast === 'normal' }"
                  >
                    Normal
                  </button>
                  <button
                    @click="setContrast('high')"
                    class="contrast-option"
                    :class="{ active: currentContrast === 'high' }"
                  >
                    Élevé
                  </button>
                </div>
              </div>
              <div class="accessibility-section">
                <label class="checkbox-option">
                  <input
                    type="checkbox"
                    v-model="reduceAnimations"
                    @change="setReduceAnimations"
                  />
                  Réduire les animations
                </label>
              </div>
            </div>
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
          <li v-if="isAuthenticated" class="mobile-nav-item">
            <router-link
              to="/wishlist"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Ma liste d'envies</router-link
            >
          </li>
          <!-- Options pour administrateurs uniquement -->
          <li
            v-if="isAuthenticated && isAdmin && !isAuthor && !isEditor"
            class="mobile-nav-item"
          >
            <router-link
              to="/admin"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Administration</router-link
            >
          </li>

          <!-- Option pour les auteurs uniquement -->
          <li
            v-if="isAuthenticated && isAuthor && !isAdmin"
            class="mobile-nav-item"
          >
            <router-link
              to="/admin/author"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Espace auteur</router-link
            >
          </li>

          <!-- Option pour les éditeurs uniquement -->
          <li
            v-if="isAuthenticated && isEditor && !isAdmin"
            class="mobile-nav-item"
          >
            <router-link
              to="/admin/editor"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Espace éditeur</router-link
            >
          </li>

          <!-- Options multiples pour l'administrateur -->
          <li
            v-if="isAuthenticated && isAdmin && isAuthor"
            class="mobile-nav-item"
          >
            <router-link
              to="/admin/author"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Espace auteur</router-link
            >
          </li>
          <li
            v-if="isAuthenticated && isAdmin && isEditor"
            class="mobile-nav-item"
          >
            <router-link
              to="/admin/editor"
              class="mobile-nav-link"
              @click="showMobileMenu = false"
              >Espace éditeur</router-link
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
    const showAccessibilityMenu = ref(false);
    const currentTheme = ref('light');
    const currentTextSize = ref('medium');
    const currentContrast = ref('normal');
    const reduceAnimations = ref(false);
    const showMobileAccessibility = ref(false);

    // Propriétés calculées
    const isAuthenticated = computed(() => {
      // Vérifier l'état d'authentification via le store
      return (
        store.getters['auth/isLoggedIn'] ||
        store.getters['auth/isAuthenticated']
      );
    });
    const isAdmin = computed(() => {
      const user = store.getters['auth/currentUser'];
      if (!user || !user.role) return false;

      const role = user.role.toUpperCase();
      return (
        role === 'ADMIN' || role.includes('ADMIN') || role === 'ROLE_ADMIN'
      );
    });

    const isAuthor = computed(() => {
      const user = store.getters['auth/currentUser'];
      if (!user || !user.role) return false;

      const role = user.role.toUpperCase();
      return (
        role === 'AUTHOR' || role.includes('AUTHOR') || role === 'ROLE_AUTHOR'
      );
    });

    const isEditor = computed(() => {
      const user = store.getters['auth/currentUser'];
      if (!user || !user.role) return false;

      const role = user.role.toUpperCase();
      return (
        role === 'EDITOR' || role.includes('EDITOR') || role === 'ROLE_EDITOR'
      );
    });
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

    const toggleAccessibilityMenu = (event) => {
      // Empêcher la propagation pour éviter que le document ne reçoive l'événement
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Fermer les autres menus si on ouvre celui-ci
      if (!showAccessibilityMenu.value) {
        showCartDropdown.value = false;
        showUserDropdown.value = false;
      }

      showAccessibilityMenu.value = !showAccessibilityMenu.value;
    };

    const toggleMobileAccessibility = (event) => {
      // Empêcher la propagation pour éviter que le document ne reçoive l'événement
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      showMobileAccessibility.value = !showMobileAccessibility.value;
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

    const setTheme = (theme) => {
      currentTheme.value = theme;
      // Implement theme setting logic
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    };

    const setTextSize = (size) => {
      currentTextSize.value = size;
      // Implement text size setting logic
      document.body.classList.remove('text-small', 'text-medium', 'text-large');
      document.body.classList.add(`text-${size}`);
      localStorage.setItem('textSize', size);

      // Appliquer la taille du texte
      let fontSize;
      switch (size) {
        case 'small':
          fontSize = '14px';
          break;
        case 'medium':
          fontSize = '16px';
          break;
        case 'large':
          fontSize = '18px';
          break;
        default:
          fontSize = '16px';
      }
      document.documentElement.style.fontSize = fontSize;
    };

    const setContrast = (contrast) => {
      currentContrast.value = contrast;
      // Implement contrast setting logic
      if (contrast === 'high') {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      localStorage.setItem('contrast', contrast);
    };

    const setReduceAnimations = () => {
      // Implement reduce animations setting logic
      if (reduceAnimations.value) {
        document.body.classList.add('reduce-animations');
      } else {
        document.body.classList.remove('reduce-animations');
      }
      localStorage.setItem('reduceAnimations', reduceAnimations.value);
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

      // Charger les préférences d'accessibilité
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        currentTheme.value = savedTheme;
        setTheme(savedTheme);
      }

      const savedTextSize = localStorage.getItem('textSize');
      if (savedTextSize) {
        currentTextSize.value = savedTextSize;
        setTextSize(savedTextSize);
      }

      const savedContrast = localStorage.getItem('contrast');
      if (savedContrast) {
        currentContrast.value = savedContrast;
        setContrast(savedContrast);
      }

      const savedReduceAnimations = localStorage.getItem('reduceAnimations');
      if (savedReduceAnimations) {
        reduceAnimations.value = savedReduceAnimations === 'true';
        setReduceAnimations();
      }

      // Vérifier l'état d'authentification au chargement
      store
        .dispatch('auth/checkAuth')
        .then(() => {
          console.log("État d'authentification vérifié");

          // Afficher les informations utilisateur pour déboguer
          const user = store.getters['auth/currentUser'];
          console.log('Informations utilisateur:', user);
          console.log('Authentifié:', isAuthenticated.value);
          console.log('Admin:', isAdmin.value);
          console.log('Auteur:', isAuthor.value);
          console.log('Éditeur:', isEditor.value);
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la vérification de l'authentification:",
            error
          );
        });

      // Ajouter un écouteur d'événement pour fermer les dropdown lors d'un clic en dehors
      document.addEventListener('click', closeDropdowns);

      // Fermer le menu mobile lors de changements de route
      router.afterEach(() => {
        showMobileMenu.value = false;
      });

      // Ajouter un écouteur pour fermer le menu d'accessibilité quand on clique ailleurs
      document.addEventListener('click', (event) => {
        if (
          !event.target.closest('.accessibility-dropdown') &&
          showAccessibilityMenu.value
        ) {
          showAccessibilityMenu.value = false;
        }
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
      isAuthor,
      isEditor,
      userName,
      userEmail,
      cartItems,
      itemCount,
      cartTotal,
      performSearch,
      toggleCartDropdown,
      toggleUserDropdown,
      toggleMobileMenu,
      toggleAccessibilityMenu,
      toggleMobileAccessibility,
      removeItem,
      logout,
      formatPrice,
      logoError,
      onLogoError,
      showAccessibilityMenu,
      showMobileAccessibility,
      currentTheme,
      currentTextSize,
      currentContrast,
      reduceAnimations,
      setTheme,
      setTextSize,
      setContrast,
      setReduceAnimations,
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

.admin-options {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.dropdown-header {
  font-size: 0.85rem;
  color: #777;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.mobile-nav-header {
  padding: 0.5rem 1rem;
  color: #777;
  font-size: 0.85rem;
  font-weight: 500;
  background-color: #f5f5f5;
}

/* Styles pour réduire les animations */
body.reduce-animations * {
  transition: none !important;
  animation: none !important;
}

body.reduce-animations .fade-enter-active,
body.reduce-animations .fade-leave-active {
  transition: none !important;
}

/* Styles pour les différentes tailles de texte */
body.text-small {
  font-size: 14px;
}

body.text-medium {
  font-size: 16px;
}

body.text-large {
  font-size: 18px;
}

body.high-contrast .accessibility-dropdown-content,
body.high-contrast .mobile-menu {
  background-color: #000;
  border: 2px solid #fff;
}

/* Styles pour le menu d'accessibilité */
.accessibility-dropdown {
  position: relative;
}

.accessibility-dropdown-content {
  position: absolute;
  top: calc(100% + 15px);
  left: 0;
  background-color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  width: 320px;
  z-index: 1000;
  padding: 20px;
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s, transform 0.3s;
}

.accessibility-dropdown-content[v-show='false'] {
  opacity: 0;
  transform: translateY(-10px);
  pointer-events: none;
}

.accessibility-section {
  margin-bottom: 20px;
}

.accessibility-section:last-child {
  margin-bottom: 0;
}

.accessibility-section h3 {
  font-size: 0.95rem;
  margin: 0 0 12px 0;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.accessibility-section h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #3f51b5;
  margin-right: 8px;
  border-radius: 2px;
}

.theme-options,
.text-size-options,
.contrast-options {
  display: flex;
  gap: 10px;
}

.theme-option,
.contrast-option {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.theme-option:hover,
.contrast-option:hover,
.text-size-option:hover {
  border-color: #3f51b5;
  background-color: #f5f7ff;
}

.theme-option.active,
.contrast-option.active,
.text-size-option.active {
  background-color: #3f51b5;
  color: white;
  border-color: #3f51b5;
  box-shadow: 0 2px 8px rgba(63, 81, 181, 0.3);
}

.text-size-option {
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.text-size-option.small {
  font-size: 0.8rem;
}

.text-size-option.medium {
  font-size: 1rem;
}

.text-size-option.large {
  font-size: 1.2rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  user-select: none;
  padding: 5px 0;
}

.checkbox-option input {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: #3f51b5;
}

/* Styles pour le menu d'accessibilité en version mobile */
.mobile-accessibility-dropdown {
  position: relative;
}

.mobile-accessibility-content {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 12px 0;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s ease;
  max-height: 1000px;
  overflow: hidden;
}

.mobile-accessibility-content[v-if='false'] {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin: 0;
  opacity: 0;
}

.mobile-accessibility-content .accessibility-section {
  margin-bottom: 22px;
}

.mobile-accessibility-content .accessibility-section:last-child {
  margin-bottom: 0;
}

.mobile-accessibility-content .theme-option,
.mobile-accessibility-content .contrast-option,
.mobile-accessibility-content .text-size-option {
  border: 1px solid #ddd;
}
</style>
