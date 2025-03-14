<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Découvrez notre sélection de livres</h1>
        <p>
          Explorez notre vaste collection et trouvez votre prochaine lecture
          préférée
        </p>
        <div class="hero-search">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Rechercher par titre, auteur, ISBN..."
            @keyup.enter="searchBooks"
          />
          <button @click="searchBooks" class="btn-search">Rechercher</button>
        </div>
      </div>
    </section>

    <!-- Nouveautés -->
    <section class="books-section">
      <div class="section-header">
        <h2>Nouveautés</h2>
        <router-link to="/new-releases" class="btn-view-all"
          >Voir tout</router-link
        >
      </div>

      <div v-if="loadingNewReleases" class="loading">
        Chargement des nouveautés...
      </div>
      <div v-else-if="newReleasesError" class="error">
        {{ newReleasesError }}
      </div>
      <div v-else class="books-carousel">
        <div v-for="book in newReleases" :key="book.id" class="book-card">
          <div class="book-image">
            <img
              :src="book.coverImage || '/assets/default-book-cover.png'"
              :alt="book.title"
            />
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">
              {{ book.author.firstName }} {{ book.author.lastName }}
            </p>
            <p class="book-price">{{ formatPrice(book.price) }}</p>
            <div class="book-actions">
              <button @click="viewBookDetails(book.id)" class="btn-details">
                Détails
              </button>
              <button @click="addToBasket(book)" class="btn-add-to-cart">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Livres populaires -->
    <section class="books-section">
      <div class="section-header">
        <h2>Livres populaires</h2>
        <router-link to="/popular-books" class="btn-view-all"
          >Voir tout</router-link
        >
      </div>

      <div v-if="loadingPopularBooks" class="loading">
        Chargement des livres populaires...
      </div>
      <div v-else-if="popularBooksError" class="error">
        {{ popularBooksError }}
      </div>
      <div v-else class="books-carousel">
        <div v-for="book in popularBooks" :key="book.id" class="book-card">
          <div class="book-image">
            <img
              :src="book.coverImage || '/assets/default-book-cover.png'"
              :alt="book.title"
            />
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">
              {{ book.author.firstName }} {{ book.author.lastName }}
            </p>
            <p class="book-price">{{ formatPrice(book.price) }}</p>
            <div class="book-actions">
              <button @click="viewBookDetails(book.id)" class="btn-details">
                Détails
              </button>
              <button @click="addToBasket(book)" class="btn-add-to-cart">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Catégories -->
    <section class="categories-section">
      <div class="section-header">
        <h2>Parcourir par catégorie</h2>
      </div>

      <div v-if="loadingCategories" class="loading">
        Chargement des catégories...
      </div>
      <div v-else-if="categoriesError" class="error">{{ categoriesError }}</div>
      <div v-else class="categories-grid">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="{ name: 'CategoryBooks', params: { id: category.id } }"
          class="category-card"
        >
          <div class="category-icon">
            <i :class="getCategoryIcon(category.name)"></i>
          </div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.bookCount }} livres</p>
        </router-link>
      </div>
    </section>

    <!-- Recommandations (si l'utilisateur est connecté) -->
    <section v-if="isAuthenticated" class="books-section">
      <div class="section-header">
        <h2>Recommandé pour vous</h2>
        <router-link to="/recommendations" class="btn-view-all"
          >Voir tout</router-link
        >
      </div>

      <div v-if="loadingRecommendations" class="loading">
        Chargement des recommandations...
      </div>
      <div v-else-if="recommendationsError" class="error">
        {{ recommendationsError }}
      </div>
      <div v-else-if="recommendations.length === 0" class="no-recommendations">
        <p>
          Explorez notre catalogue et effectuez des achats pour obtenir des
          recommandations personnalisées.
        </p>
      </div>
      <div v-else class="books-carousel">
        <div v-for="book in recommendations" :key="book.id" class="book-card">
          <div class="book-image">
            <img
              :src="book.coverImage || '/assets/default-book-cover.png'"
              :alt="book.title"
            />
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-author">
              {{ book.author.firstName }} {{ book.author.lastName }}
            </p>
            <p class="book-price">{{ formatPrice(book.price) }}</p>
            <div class="book-actions">
              <button @click="viewBookDetails(book.id)" class="btn-details">
                Détails
              </button>
              <button @click="addToBasket(book)" class="btn-add-to-cart">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Inscription à la newsletter -->
    <section class="newsletter-section">
      <div class="newsletter-content">
        <h2>Restez informé</h2>
        <p>
          Inscrivez-vous à notre newsletter pour recevoir nos nouveautés et
          offres spéciales
        </p>
        <div class="newsletter-form">
          <input
            type="email"
            v-model="newsletterEmail"
            placeholder="Votre adresse email"
            :disabled="isSubscribing"
          />
          <button
            @click="subscribeNewsletter"
            class="btn-subscribe"
            :disabled="!isValidEmail || isSubscribing"
          >
            {{ isSubscribing ? 'Inscription...' : "S'inscrire" }}
          </button>
        </div>
        <p
          v-if="newsletterMessage"
          class="newsletter-message"
          :class="{ success: newsletterSuccess }"
        >
          {{ newsletterMessage }}
        </p>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import BookService from '@/services/BookService';
import CategoryService from '@/services/CategoryService';
import NewsletterService from '@/services/NewsletterService';

export default {
  name: 'HomeView',

  setup() {
    const router = useRouter();
    const store = useStore();

    // États
    const searchQuery = ref('');
    const newReleases = ref([]);
    const popularBooks = ref([]);
    const categories = ref([]);
    const recommendations = ref([]);
    const newsletterEmail = ref('');
    const newsletterMessage = ref('');
    const newsletterSuccess = ref(false);
    const isSubscribing = ref(false);

    // États de chargement et d'erreur
    const loadingNewReleases = ref(true);
    const loadingPopularBooks = ref(true);
    const loadingCategories = ref(true);
    const loadingRecommendations = ref(false);
    const newReleasesError = ref(null);
    const popularBooksError = ref(null);
    const categoriesError = ref(null);
    const recommendationsError = ref(null);

    // Propriétés calculées
    const isAuthenticated = computed(
      () => store.getters['auth/isAuthenticated']
    );

    const isValidEmail = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(newsletterEmail.value);
    });

    // Méthodes
    const fetchNewReleases = async () => {
      loadingNewReleases.value = true;
      newReleasesError.value = null;

      try {
        const response = await BookService.getNewReleases(8);
        newReleases.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des nouveautés:', error);
        newReleasesError.value =
          'Impossible de charger les nouveautés. Veuillez réessayer plus tard.';
      } finally {
        loadingNewReleases.value = false;
      }
    };

    const fetchPopularBooks = async () => {
      loadingPopularBooks.value = true;
      popularBooksError.value = null;

      try {
        const response = await BookService.getPopularBooks(8);
        popularBooks.value = response.data;
      } catch (error) {
        console.error(
          'Erreur lors du chargement des livres populaires:',
          error
        );
        popularBooksError.value =
          'Impossible de charger les livres populaires. Veuillez réessayer plus tard.';
      } finally {
        loadingPopularBooks.value = false;
      }
    };

    const fetchCategories = async () => {
      loadingCategories.value = true;
      categoriesError.value = null;

      try {
        const response = await CategoryService.getCategories();
        categories.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        categoriesError.value =
          'Impossible de charger les catégories. Veuillez réessayer plus tard.';
      } finally {
        loadingCategories.value = false;
      }
    };

    const fetchRecommendations = async () => {
      if (!isAuthenticated.value) return;

      loadingRecommendations.value = true;
      recommendationsError.value = null;

      try {
        const response = await BookService.getRecommendations(8);
        recommendations.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des recommandations:', error);
        recommendationsError.value =
          'Impossible de charger les recommandations. Veuillez réessayer plus tard.';
      } finally {
        loadingRecommendations.value = false;
      }
    };

    const searchBooks = () => {
      if (!searchQuery.value.trim()) return;

      router.push({
        name: 'SearchResults',
        query: { q: searchQuery.value },
      });
    };

    const viewBookDetails = (bookId) => {
      router.push({
        name: 'BookDetails',
        params: { id: bookId },
      });
    };

    const addToBasket = (book) => {
      store.dispatch('basket/addItem', book);
      alert(`"${book.title}" a été ajouté à votre panier.`);
    };

    const formatPrice = (price) => {
      return `${price.toFixed(2)} €`;
    };

    const getCategoryIcon = (categoryName) => {
      // Mapping des catégories vers des icônes Font Awesome
      const iconMap = {
        Roman: 'fas fa-book',
        'Science-Fiction': 'fas fa-rocket',
        Fantasy: 'fas fa-dragon',
        Thriller: 'fas fa-mask',
        Policier: 'fas fa-search',
        Jeunesse: 'fas fa-child',
        Histoire: 'fas fa-landmark',
        Biographie: 'fas fa-user-tie',
        Art: 'fas fa-palette',
        Cuisine: 'fas fa-utensils',
        Sciences: 'fas fa-flask',
        Informatique: 'fas fa-laptop-code',
        Business: 'fas fa-chart-line',
        'Développement personnel': 'fas fa-brain',
      };

      return iconMap[categoryName] || 'fas fa-book';
    };

    const subscribeNewsletter = async () => {
      if (!isValidEmail.value) return;

      isSubscribing.value = true;
      newsletterMessage.value = '';

      try {
        await NewsletterService.subscribe(newsletterEmail.value);
        newsletterMessage.value =
          'Vous êtes maintenant inscrit à notre newsletter!';
        newsletterSuccess.value = true;
        newsletterEmail.value = '';
      } catch (error) {
        console.error("Erreur lors de l'inscription à la newsletter:", error);
        newsletterMessage.value =
          'Une erreur est survenue. Veuillez réessayer plus tard.';
        newsletterSuccess.value = false;
      } finally {
        isSubscribing.value = false;
      }
    };

    // Cycle de vie
    onMounted(() => {
      // Chargement parallèle des données
      Promise.all([fetchNewReleases(), fetchPopularBooks(), fetchCategories()]);

      // Chargement des recommandations si l'utilisateur est authentifié
      if (isAuthenticated.value) {
        fetchRecommendations();
      }
    });

    return {
      searchQuery,
      newReleases,
      popularBooks,
      categories,
      recommendations,
      newsletterEmail,
      newsletterMessage,
      newsletterSuccess,
      isSubscribing,
      loadingNewReleases,
      loadingPopularBooks,
      loadingCategories,
      loadingRecommendations,
      newReleasesError,
      popularBooksError,
      categoriesError,
      recommendationsError,
      isAuthenticated,
      isValidEmail,
      searchBooks,
      viewBookDetails,
      addToBasket,
      formatPrice,
      getCategoryIcon,
      subscribeNewsletter,
    };
  },
};
</script>

<style scoped>
.home-container {
  width: 100%;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(rgba(63, 81, 181, 0.8), rgba(63, 81, 181, 0.6));
  background-size: cover;
  background-position: center;
  padding: 80px 20px;
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
}

.hero-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
}

.hero-search {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
}

.hero-search input {
  flex-grow: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.btn-search {
  background-color: #e91e63;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 500;
}

/* Books Sections */
.books-section {
  padding: 40px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  color: #333;
  margin: 0;
}

.btn-view-all {
  color: #3f51b5;
  text-decoration: none;
}

.btn-view-all:hover {
  text-decoration: underline;
}

.books-carousel {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.book-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.book-image {
  height: 250px;
  overflow: hidden;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-info {
  padding: 15px;
}

.book-title {
  margin: 0 0 5px;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.book-author {
  color: #666;
  margin: 0 0 10px;
  font-size: 0.9rem;
}

.book-price {
  font-weight: bold;
  color: #e91e63;
  margin: 0 0 10px;
}

.book-actions {
  display: flex;
  gap: 10px;
}

.btn-details,
.btn-add-to-cart {
  padding: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  flex: 1;
}

.btn-details {
  background-color: #f5f5f5;
  color: #333;
}

.btn-add-to-cart {
  background-color: #3f51b5;
  color: white;
}

/* Categories Section */
.categories-section {
  background-color: #f9f9f9;
  padding: 40px 20px;
}

.categories-section .section-header {
  max-width: 1200px;
  margin: 0 auto 30px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.category-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
  color: #333;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 2rem;
  color: #3f51b5;
  margin-bottom: 15px;
}

.category-card h3 {
  margin: 0 0 5px;
  font-size: 1.1rem;
}

.category-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

/* Newsletter Section */
.newsletter-section {
  background-color: #3f51b5;
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
}

.newsletter-content h2 {
  margin-top: 0;
  margin-bottom: 15px;
}

.newsletter-content p {
  margin-bottom: 20px;
}

.newsletter-form {
  display: flex;
  margin-bottom: 15px;
}

.newsletter-form input {
  flex-grow: 1;
  padding: 12px 15px;
  border: none;
  border-radius: 4px 0 0 4px;
  font-size: 1rem;
}

.btn-subscribe {
  background-color: #e91e63;
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-weight: 500;
}

.btn-subscribe:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.newsletter-message {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #ff9a9a;
}

.newsletter-message.success {
  color: #a0ffb0;
}

/* Loading and Error States */
.loading,
.error,
.no-recommendations {
  text-align: center;
  padding: 30px;
  color: #666;
}

.error {
  color: #f44336;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-search {
    flex-direction: column;
  }

  .hero-search input {
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .btn-search {
    border-radius: 4px;
    padding: 10px;
  }

  .books-carousel {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form input {
    border-radius: 4px;
    margin-bottom: 10px;
  }

  .btn-subscribe {
    border-radius: 4px;
    padding: 10px;
  }
}
</style>
