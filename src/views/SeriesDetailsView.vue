<template>
  <div class="series-details-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement de la série...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchSeriesDetails" class="retry-button">
        Réessayer
      </button>
    </div>

    <div v-else class="series-details">
      <div class="series-header">
        <div class="series-info">
          <h1 class="series-title">{{ series.name }}</h1>
          <p class="series-description">
            {{ series.description || 'Aucune description disponible.' }}
          </p>
          <div class="series-stats">
            <span class="stat">
              <i class="fas fa-book"></i>
              {{ series.bookCount }} livres
            </span>
            <span class="stat">
              <i class="fas fa-user"></i>
              {{ series.authorCount }} auteurs
            </span>
          </div>
        </div>
      </div>

      <div class="books-section">
        <h2 class="section-title">Livres de la série</h2>

        <div v-if="booksLoading" class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Chargement des livres...</span>
        </div>

        <div v-else-if="booksError" class="error-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ booksError }}</p>
          <button @click="fetchBooks" class="retry-button">Réessayer</button>
        </div>

        <div v-else-if="books.length === 0" class="no-books">
          <i class="fas fa-book"></i>
          <p>Aucun livre disponible dans cette série.</p>
        </div>

        <div v-else class="books-grid">
          <div v-for="book in books" :key="book.id" class="book-card">
            <router-link
              :to="{ name: 'BookDetails', params: { id: book.id } }"
              class="book-link"
            >
              <div class="book-cover">
                <img
                  v-if="book.picture"
                  :src="book.picture"
                  :alt="book.title"
                  class="book-image"
                />
                <div v-else class="book-placeholder">
                  <i class="fas fa-book"></i>
                  <span>{{ book.title }}</span>
                </div>
              </div>
              <div class="book-info">
                <h3 class="book-title">{{ book.title }}</h3>
                <p class="book-author">
                  {{
                    book.authors?.length
                      ? book.authors[0].name
                      : 'Auteur inconnu'
                  }}
                </p>
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
import SeriesService from '@/services/SeriesService';

export default {
  name: 'SeriesDetailsView',

  setup() {
    const route = useRoute();
    const series = ref({});
    const books = ref([]);
    const loading = ref(true);
    const error = ref('');
    const booksLoading = ref(true);
    const booksError = ref('');

    const fetchSeriesDetails = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await SeriesService.getSeriesById(route.params.id);
        series.value = response.data;
      } catch (err) {
        console.error(
          'Erreur lors du chargement des détails de la série:',
          err
        );
        error.value =
          'Impossible de charger les détails de la série. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    const fetchBooks = async () => {
      booksLoading.value = true;
      booksError.value = '';

      try {
        const response = await SeriesService.getBooksBySeries(route.params.id);
        books.value = response.data;
      } catch (err) {
        console.error('Erreur lors du chargement des livres de la série:', err);
        booksError.value =
          'Impossible de charger les livres de la série. Veuillez réessayer plus tard.';
      } finally {
        booksLoading.value = false;
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    onMounted(() => {
      fetchSeriesDetails();
      fetchBooks();
    });

    return {
      series,
      books,
      loading,
      error,
      booksLoading,
      booksError,
      fetchSeriesDetails,
      fetchBooks,
      formatPrice,
    };
  },
};
</script>

<style scoped>
.series-details-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
}

.loading-state,
.error-state,
.no-books {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-state i,
.error-state i,
.no-books i {
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

.series-header {
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.series-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1rem;
}

.series-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.series-stats {
  display: flex;
  gap: 2rem;
  color: #666;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat i {
  color: #3f51b5;
}

.section-title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.book-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.book-link {
  text-decoration: none;
  color: inherit;
}

.book-cover {
  position: relative;
  padding-top: 150%;
  background-color: #f5f5f5;
  overflow: hidden;
}

.book-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
  text-align: center;
  padding: 1rem;
}

.book-placeholder i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.book-price {
  font-size: 1rem;
  color: #3f51b5;
  font-weight: bold;
}

@media (max-width: 768px) {
  .series-details-container {
    padding: 1rem;
  }

  .series-header {
    padding: 1rem;
  }

  .series-title {
    font-size: 1.5rem;
  }

  .series-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
}
</style>
