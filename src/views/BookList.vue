<template>
  <div class="book-list-container">
    <h1>Catalogue de Livres</h1>

    <!-- Filtres -->
    <div class="filters">
      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher un livre..."
          @input="filterBooks"
        />
      </div>

      <div class="category-filter">
        <select v-model="selectedCategory" @change="filterBooks">
          <option value="">Toutes les catégories</option>
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Message de chargement ou d'erreur -->
    <div v-if="loading" class="loading">Chargement des livres...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Grille de livres -->
    <div v-if="!loading && !error" class="books-grid">
      <div v-for="book in filteredBooks" :key="book.id" class="book-card">
        <div class="book-image">
          <img
            :src="book.coverImage || '/assets/default-book-cover.png'"
            :alt="book.title"
          />
        </div>
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">
            Par {{ book.author.firstName }} {{ book.author.lastName }}
          </p>
          <p class="book-price">{{ book.price.toFixed(2) }} €</p>
          <div class="book-actions">
            <button @click="viewBookDetails(book.id)" class="btn-details">
              Détails
            </button>
            <button @click="addToBasket(book)" class="btn-add-to-cart">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="btn-page"
      >
        Précédent
      </button>

      <span class="page-info">Page {{ currentPage }} sur {{ totalPages }}</span>

      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="btn-page"
      >
        Suivant
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BookService from '@/services/BookService';
import CategoryService from '@/services/CategoryService';
import { useStore } from 'vuex';

export default {
  name: 'BookList',

  setup() {
    const router = useRouter();
    const store = useStore();

    // États
    const books = ref([]);
    const filteredBooks = ref([]);
    const categories = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const currentPage = ref(1);
    const totalPages = ref(1);
    const pageSize = 12;

    // Méthodes
    const fetchBooks = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await BookService.getBooks(
          currentPage.value,
          pageSize
        );
        books.value = response.data.content;
        filteredBooks.value = [...books.value];
        totalPages.value = response.data.totalPages;
      } catch (err) {
        console.error('Erreur lors de la récupération des livres:', err);
        error.value =
          'Impossible de charger les livres. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await CategoryService.getCategories();
        categories.value = response.data;
      } catch (err) {
        console.error('Erreur lors de la récupération des catégories:', err);
      }
    };

    const filterBooks = () => {
      if (!books.value.length) return;

      filteredBooks.value = books.value.filter((book) => {
        const matchesSearch = searchQuery.value
          ? book.title
              .toLowerCase()
              .includes(searchQuery.value.toLowerCase()) ||
            book.author.firstName
              .toLowerCase()
              .includes(searchQuery.value.toLowerCase()) ||
            book.author.lastName
              .toLowerCase()
              .includes(searchQuery.value.toLowerCase())
          : true;

        const matchesCategory = selectedCategory.value
          ? book.category.id === selectedCategory.value
          : true;

        return matchesSearch && matchesCategory;
      });
    };

    const changePage = (page) => {
      currentPage.value = page;
      fetchBooks();
    };

    const viewBookDetails = (bookId) => {
      router.push({ name: 'BookDetails', params: { id: bookId } });
    };

    const addToBasket = (book) => {
      store.dispatch('basket/addItem', book);
      // Notification optionnelle
      alert(`"${book.title}" a été ajouté à votre panier`);
    };

    // Cycle de vie
    onMounted(async () => {
      await Promise.all([fetchBooks(), fetchCategories()]);
    });

    return {
      books,
      filteredBooks,
      categories,
      loading,
      error,
      searchQuery,
      selectedCategory,
      currentPage,
      totalPages,
      filterBooks,
      changePage,
      viewBookDetails,
      addToBasket,
    };
  },
};
</script>

<style scoped>
.book-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.filters {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box input,
.category-filter select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
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
  height: 200px;
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
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.book-author {
  color: #666;
  margin-bottom: 10px;
}

.book-price {
  font-weight: bold;
  color: #e91e63;
  margin-bottom: 15px;
}

.book-actions {
  display: flex;
  gap: 10px;
}

.btn-details,
.btn-add-to-cart {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-details {
  background-color: #f5f5f5;
  color: #333;
}

.btn-add-to-cart {
  background-color: #3f51b5;
  color: white;
  flex-grow: 1;
}

.loading,
.error {
  text-align: center;
  padding: 20px;
}

.error {
  color: #f44336;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.btn-page {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
