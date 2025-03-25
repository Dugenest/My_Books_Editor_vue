<template>
  <div class="search-results">
    <h1>Résultats de recherche</h1>

    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des résultats...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="books.length === 0" class="no-results">
      <p>Aucun résultat trouvé pour "{{ query }}"</p>
    </div>

    <div v-else class="results-grid">
      <div v-for="book in books" :key="book.id" class="book-card">
        <div class="book-image">
          <div v-if="book.picture" class="image-container">
            <img :src="book.picture" :alt="book.title" />
          </div>
          <div v-else class="default-cover">
            <i class="fas fa-book"></i>
            <span class="book-title-placeholder">{{ book.title }}</span>
          </div>
        </div>
        <div class="book-info">
          <h3>{{ book.title }}</h3>
          <p class="author">
            <template v-if="book.authors && book.authors.length > 0">
              {{ book.authors[0].firstName }} {{ book.authors[0].lastName }}
            </template>
            <template v-else-if="book.author">
              {{ book.author.firstName }} {{ book.author.lastName }}
            </template>
            <template v-else>Auteur inconnu</template>
          </p>
          <p class="price">{{ formatPrice(book.price) }}</p>
          <router-link
            :to="{ name: 'BookDetails', params: { id: book.id } }"
            class="view-details"
          >
            Voir les détails
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import BookService from '@/services/BookService';

export default {
  name: 'SearchResultsView',
  props: {
    query: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const books = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    const loadSearchResults = async () => {
      try {
        isLoading.value = true;
        error.value = null;

        const response = await BookService.searchBooks(props.query);

        if (response && response.data) {
          // Si la réponse est un tableau, l'utiliser directement
          if (Array.isArray(response.data)) {
            books.value = response.data;
          }
          // Si la réponse a un format paginé (content)
          else if (
            response.data.content &&
            Array.isArray(response.data.content)
          ) {
            books.value = response.data.content;
          }
          // Si la réponse est un objet unique
          else if (response.data.id) {
            books.value = [response.data];
          } else {
            books.value = [];
          }
        } else {
          books.value = [];
        }
      } catch (err) {
        console.error('Erreur lors de la recherche:', err);
        error.value =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer.';
        books.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    onMounted(() => {
      if (props.query) {
        loadSearchResults();
      }
    });

    return {
      books,
      isLoading,
      error,
      formatPrice,
    };
  },
};
</script>

<style scoped>
.search-results {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error {
  color: #e74c3c;
  text-align: center;
  padding: 2rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.book-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-image {
  position: relative;
  width: 100%;
  height: 300px;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.image-container img {
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
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  border-radius: 8px 8px 0 0;
}

.book-info {
  padding: 1rem;
}

.book-info h3 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #333;
}

.author {
  color: #666;
  margin-bottom: 0.5rem;
}

.price {
  font-weight: bold;
  color: #2ecc71;
  margin-bottom: 1rem;
}

.view-details {
  display: inline-block;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.view-details:hover {
  background-color: #2980b9;
}

@media (max-width: 768px) {
  .search-results {
    padding: 1rem;
  }

  .results-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .book-image {
    height: 250px;
  }
}
</style>
