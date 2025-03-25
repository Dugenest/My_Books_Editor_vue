<template>
  <div class="book-details">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Chargement des détails...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="book" class="book-content">
      <div class="book-header">
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
          <h1>{{ book.title }}</h1>
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
          <p
            class="stock"
            :class="{
              'in-stock': book.stock > 0,
              'out-of-stock': book.stock === 0,
            }"
          >
            {{ book.stock > 0 ? 'En stock' : 'Rupture de stock' }}
          </p>
          <button
            class="add-to-cart"
            @click="addToCart"
            :disabled="book.stock === 0"
          >
            Ajouter au panier
          </button>
        </div>
      </div>

      <div class="book-description">
        <h2>Description</h2>
        <p>{{ book.detail || 'Aucune description disponible.' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BookService from '@/services/BookService';

export default {
  name: 'BookDetailsView',
  setup() {
    const route = useRoute();
    const book = ref(null);
    const isLoading = ref(true);
    const error = ref(null);

    const loadBookDetails = async () => {
      try {
        isLoading.value = true;
        error.value = null;
        const response = await BookService.getBookById(route.params.id);
        book.value = response.data;
      } catch (err) {
        console.error('Erreur lors du chargement des détails:', err);
        error.value =
          'Une erreur est survenue lors du chargement des détails du livre.';
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

    const addToCart = () => {
      // TODO: Implémenter l'ajout au panier
      console.log('Ajouter au panier:', book.value.id);
    };

    onMounted(() => {
      if (route.params.id) {
        loadBookDetails();
      }
    });

    return {
      book,
      isLoading,
      error,
      formatPrice,
      addToCart,
    };
  },
};
</script>

<style scoped>
.book-details {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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

.book-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.book-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.book-image {
  position: relative;
  width: 100%;
  height: 400px;
}

.image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
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
  border-radius: 8px;
}

.book-info {
  padding: 1rem;
}

.book-info h1 {
  margin: 0 0 1rem;
  font-size: 2rem;
  color: #333;
}

.author {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2ecc71;
  margin-bottom: 1rem;
}

.stock {
  font-weight: bold;
  margin-bottom: 1rem;
}

.in-stock {
  color: #2ecc71;
}

.out-of-stock {
  color: #e74c3c;
}

.add-to-cart {
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart:hover:not(:disabled) {
  background-color: #2980b9;
}

.add-to-cart:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.book-description {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.book-description h2 {
  margin: 0 0 1rem;
  color: #333;
}

.book-description p {
  color: #666;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .book-header {
    grid-template-columns: 1fr;
  }

  .book-image {
    height: 300px;
  }
}
</style>
