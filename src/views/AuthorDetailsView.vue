<template>
  <div class="author-details-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement des informations de l'auteur...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchAuthorDetails" class="retry-button">
        Réessayer
      </button>
    </div>

    <div v-else class="author-details">
      <div class="author-header">
        <div class="author-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="author-info">
          <h1 class="author-name">
            {{ author.firstName }} {{ author.lastName }}
          </h1>
          <p class="author-books-count">
            {{ author.bookCount }} livres publiés
          </p>
        </div>
      </div>

      <div class="author-biography">
        <h2>Biographie</h2>
        <p>{{ author.biography || 'Aucune biographie disponible.' }}</p>
      </div>

      <div class="author-books">
        <h2>Livres de l'auteur</h2>
        <div v-if="loadingBooks" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Chargement des livres...</span>
        </div>
        <div v-else-if="booksError" class="error-state">
          <p>{{ booksError }}</p>
        </div>
        <div v-else-if="books.length === 0" class="no-books">
          <p>Aucun livre trouvé pour cet auteur.</p>
        </div>
        <div v-else class="books-grid">
          <div v-for="book in books" :key="book.id" class="book-card">
            <router-link :to="{ name: 'BookDetails', params: { id: book.id } }">
              <div class="book-image">
                <img
                  v-if="book.coverImage"
                  :src="book.coverImage"
                  :alt="book.title"
                />
                <div v-else class="default-cover">
                  <i class="fas fa-book"></i>
                  <span class="book-title-placeholder">{{ book.title }}</span>
                </div>
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-price">{{ formatPrice(book.price) }}</p>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AuthorService from '@/services/AuthorService';
import BookService from '@/services/BookService';

export default {
  name: 'AuthorDetailsView',

  setup() {
    const route = useRoute();
    const author = ref({});
    const books = ref([]);
    const loading = ref(true);
    const loadingBooks = ref(false);
    const error = ref('');
    const booksError = ref('');

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    const fetchAuthorDetails = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await AuthorService.getAuthorById(route.params.id);
        author.value = response.data;
        await fetchAuthorBooks();
      } catch (err) {
        console.error(
          "Erreur lors du chargement des détails de l'auteur:",
          err
        );
        error.value = "Impossible de charger les informations de l'auteur.";
      } finally {
        loading.value = false;
      }
    };

    const fetchAuthorBooks = async () => {
      loadingBooks.value = true;
      booksError.value = '';

      try {
        const response = await BookService.getBooksByAuthor(route.params.id);
        books.value = response.data;
      } catch (err) {
        console.error("Erreur lors du chargement des livres de l'auteur:", err);
        booksError.value = "Impossible de charger les livres de l'auteur.";
      } finally {
        loadingBooks.value = false;
      }
    };

    onMounted(fetchAuthorDetails);

    return {
      author,
      books,
      loading,
      loadingBooks,
      error,
      booksError,
      fetchAuthorDetails,
      formatPrice,
    };
  },
};
</script>

<style scoped>
.author-details-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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

.author-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.author-avatar {
  font-size: 4rem;
  color: #3f51b5;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 2rem;
  color: #333;
  margin: 0 0 0.5rem;
}

.author-books-count {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.author-biography {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.author-biography h2 {
  color: #333;
  margin: 0 0 1rem;
}

.author-books {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.author-books h2 {
  color: #333;
  margin: 0 0 1.5rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-image {
  position: relative;
  padding-top: 150%;
  background-color: #f5f5f5;
}

.book-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #666;
}

.default-cover i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.book-title-placeholder {
  font-size: 0.9rem;
  text-align: center;
  padding: 0 0.5rem;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1rem;
  color: #333;
  margin: 0 0 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.book-price {
  font-size: 1.1rem;
  color: #3f51b5;
  font-weight: 600;
  margin: 0;
}

.no-books {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@media (max-width: 768px) {
  .author-details-container {
    padding: 1rem;
  }

  .author-header {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }

  .author-avatar {
    font-size: 3rem;
  }

  .author-name {
    font-size: 1.5rem;
  }

  .author-biography,
  .author-books {
    padding: 1.5rem;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
