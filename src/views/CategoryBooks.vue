<template>
  <div class="category-books-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement des livres...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchCategoryBooks" class="retry-button">
        Réessayer
      </button>
    </div>

    <template v-else>
      <div class="category-header">
        <h1 class="category-title">{{ category.name }}</h1>
        <p class="category-description">{{ category.description }}</p>
      </div>

      <div class="filters-section">
        <div class="sort-filter">
          <label for="sort">Trier par:</label>
          <select id="sort" v-model="sortBy" @change="handleSort">
            <option value="title">Titre</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
            <option value="date">Date de parution</option>
          </select>
        </div>

        <div class="price-filter">
          <label>Prix:</label>
          <div class="price-inputs">
            <input
              type="number"
              v-model="priceRange.min"
              placeholder="Min"
              @input="handlePriceFilter"
            />
            <span>-</span>
            <input
              type="number"
              v-model="priceRange.max"
              placeholder="Max"
              @input="handlePriceFilter"
            />
          </div>
        </div>
      </div>

      <div v-if="filteredBooks.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>Aucun livre ne correspond à vos critères</p>
      </div>

      <div v-else class="books-grid">
        <div v-for="book in filteredBooks" :key="book.id" class="book-card">
          <router-link :to="{ name: 'BookDetails', params: { id: book.id } }">
            <img :src="book.coverImage" :alt="book.title" class="book-cover" />
          </router-link>
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

      <div v-if="hasMoreBooks" class="load-more">
        <button
          @click="loadMoreBooks"
          :disabled="loadingMore"
          class="load-more-button"
        >
          <span v-if="loadingMore">
            <i class="fas fa-spinner fa-spin"></i> Chargement...
          </span>
          <span v-else>Voir plus de livres</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import CategoryService from '@/services/CategoryService';
import BookService from '@/services/BookService';

export default {
  name: 'CategoryBooks',

  setup() {
    const route = useRoute();
    const store = useStore();
    const categoryId = route.params.id;

    const category = ref({});
    const books = ref([]);
    const loading = ref(true);
    const loadingMore = ref(false);
    const error = ref('');
    const page = ref(1);
    const hasMoreBooks = ref(true);
    const sortBy = ref('title');
    const priceRange = ref({ min: '', max: '' });

    const fetchCategoryBooks = async () => {
      loading.value = true;
      error.value = '';

      try {
        const [categoryResponse, booksResponse] = await Promise.all([
          CategoryService.getCategory(categoryId),
          BookService.getBooksByCategory(categoryId, {
            page: page.value,
            sort: sortBy.value,
            minPrice: priceRange.value.min,
            maxPrice: priceRange.value.max,
          }),
        ]);

        category.value = categoryResponse.data;
        books.value = booksResponse.data.books;
        hasMoreBooks.value = booksResponse.data.hasMore;
      } catch (err) {
        console.error('Erreur lors du chargement des livres:', err);
        error.value =
          'Impossible de charger les livres. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    const loadMoreBooks = async () => {
      if (loadingMore.value || !hasMoreBooks.value) return;

      loadingMore.value = true;
      page.value++;

      try {
        const response = await BookService.getBooksByCategory(categoryId, {
          page: page.value,
          sort: sortBy.value,
          minPrice: priceRange.value.min,
          maxPrice: priceRange.value.max,
        });

        books.value = [...books.value, ...response.data.books];
        hasMoreBooks.value = response.data.hasMore;
      } catch (err) {
        console.error('Erreur lors du chargement de plus de livres:', err);
      } finally {
        loadingMore.value = false;
      }
    };

    const handleSort = () => {
      page.value = 1;
      books.value = [];
      fetchCategoryBooks();
    };

    const handlePriceFilter = () => {
      page.value = 1;
      books.value = [];
      fetchCategoryBooks();
    };

    const filteredBooks = computed(() => {
      return books.value;
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
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

    watch(
      () => route.params.id,
      (newId) => {
        if (newId !== categoryId) {
          page.value = 1;
          books.value = [];
          fetchCategoryBooks();
        }
      }
    );

    onMounted(fetchCategoryBooks);

    return {
      category,
      books,
      loading,
      loadingMore,
      error,
      hasMoreBooks,
      sortBy,
      priceRange,
      filteredBooks,
      formatPrice,
      fetchCategoryBooks,
      loadMoreBooks,
      handleSort,
      handlePriceFilter,
      addToCart,
    };
  },
};
</script>

<style scoped>
.category-books-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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

.category-header {
  text-align: center;
  margin-bottom: 2rem;
}

.category-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.category-description {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.filters-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.sort-filter,
.price-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
}

select,
input[type='number'] {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-inputs input {
  width: 80px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 2rem;
}

.book-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.book-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.book-price {
  font-weight: 600;
  color: #3f51b5;
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
}

.add-to-cart:hover {
  background-color: #303f9f;
}

.add-to-cart:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}

.load-more-button {
  padding: 0.75rem 2rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.load-more-button:hover {
  background-color: #e0e0e0;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-results i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

@media (max-width: 768px) {
  .category-books-container {
    padding: 1rem;
  }

  .filters-section {
    flex-direction: column;
    gap: 1rem;
  }

  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .book-cover {
    height: 200px;
  }
}
</style>
