<template>
  <div class="book-details-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement du livre...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchBookDetails" class="retry-button">Réessayer</button>
    </div>

    <template v-else>
      <div class="book-content">
        <div class="book-image-section">
          <img :src="book.coverImage" :alt="book.title" class="book-cover" />
          <div class="book-actions">
            <div class="price-section">
              <span class="book-price">{{ formatPrice(book.price) }} €</span>
              <span v-if="book.originalPrice" class="original-price">
                {{ formatPrice(book.originalPrice) }} €
              </span>
            </div>
            <div
              class="stock-status"
              :class="{ 'out-of-stock': !book.inStock }"
            >
              {{ book.inStock ? 'En stock' : 'Indisponible' }}
            </div>
            <div class="action-buttons">
              <button
                class="add-to-cart"
                @click="addToCart"
                :disabled="!book.inStock"
              >
                <i class="fas fa-shopping-cart"></i>
                {{ book.inStock ? 'Ajouter au panier' : 'Indisponible' }}
              </button>
              <button
                class="add-to-wishlist"
                @click="toggleWishlist"
                :class="{ 'in-wishlist': isInWishlist }"
              >
                <i :class="isInWishlist ? 'fas fa-heart' : 'far fa-heart'"></i>
                {{ isInWishlist ? 'Dans la liste' : 'Ajouter à la liste' }}
              </button>
            </div>
          </div>
        </div>

        <div class="book-info-section">
          <div class="book-header">
            <h1 class="book-title">{{ book.title }}</h1>
            <div class="book-meta">
              <router-link
                :to="{ name: 'AuthorDetails', params: { id: book.authorId } }"
                class="author-link"
              >
                {{ book.author }}
              </router-link>
              <span class="publication-date">
                Publié le {{ formatDate(book.publicationDate) }}
              </span>
            </div>
          </div>

          <div class="book-categories">
            <router-link
              v-for="category in book.categories"
              :key="category.id"
              :to="{ name: 'CategoryBooks', params: { id: category.id } }"
              class="category-tag"
            >
              {{ category.name }}
            </router-link>
          </div>

          <div class="book-rating">
            <div class="stars">
              <i
                v-for="n in 5"
                :key="n"
                :class="[
                  'fas',
                  n <= Math.round(book.rating) ? 'fa-star' : 'fa-star-half-alt',
                ]"
              ></i>
            </div>
            <span class="rating-count">({{ book.ratingCount }} avis)</span>
          </div>

          <div class="book-details">
            <h2>Description</h2>
            <p class="book-description">{{ book.description }}</p>

            <h2>Détails du livre</h2>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">ISBN</span>
                <span class="detail-value">{{ book.isbn }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Éditeur</span>
                <span class="detail-value">{{ book.publisher }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Pages</span>
                <span class="detail-value">{{ book.pageCount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Langue</span>
                <span class="detail-value">{{ book.language }}</span>
              </div>
            </div>
          </div>

          <div
            v-if="book.reviews && book.reviews.length > 0"
            class="book-reviews"
          >
            <h2>Avis des lecteurs</h2>
            <div class="reviews-list">
              <div
                v-for="review in book.reviews"
                :key="review.id"
                class="review-card"
              >
                <div class="review-header">
                  <div class="reviewer-info">
                    <span class="reviewer-name">{{ review.userName }}</span>
                    <span class="review-date">
                      {{ formatDate(review.date) }}
                    </span>
                  </div>
                  <div class="review-rating">
                    <i
                      v-for="n in 5"
                      :key="n"
                      :class="[
                        'fas',
                        n <= review.rating ? 'fa-star' : 'fa-star-o',
                      ]"
                    ></i>
                  </div>
                </div>
                <p class="review-content">{{ review.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="relatedBooks.length > 0" class="related-books">
        <h2>Vous aimerez aussi</h2>
        <div class="related-books-grid">
          <div
            v-for="relatedBook in relatedBooks"
            :key="relatedBook.id"
            class="related-book-card"
          >
            <router-link
              :to="{ name: 'BookDetails', params: { id: relatedBook.id } }"
            >
              <img
                :src="relatedBook.coverImage"
                :alt="relatedBook.title"
                class="related-book-cover"
              />
              <div class="related-book-info">
                <h3>{{ relatedBook.title }}</h3>
                <p>{{ relatedBook.author }}</p>
                <span class="related-book-price">
                  {{ formatPrice(relatedBook.price) }} €
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import BookService from '@/services/BookService';

export default {
  name: 'BookDetails',

  setup() {
    const route = useRoute();
    const store = useStore();
    const bookId = route.params.id;

    const book = ref({});
    const relatedBooks = ref([]);
    const loading = ref(true);
    const error = ref('');

    const isInWishlist = computed(() => {
      return store.getters['wishlist/isInWishlist'](bookId);
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

    const fetchBookDetails = async () => {
      loading.value = true;
      error.value = '';

      try {
        const [bookResponse, relatedResponse] = await Promise.all([
          BookService.getBookDetails(bookId),
          BookService.getRelatedBooks(bookId),
        ]);

        book.value = bookResponse.data;
        relatedBooks.value = relatedResponse.data;
      } catch (err) {
        console.error('Erreur lors du chargement du livre:', err);
        error.value =
          'Impossible de charger les détails du livre. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    const addToCart = () => {
      store.dispatch('cart/addItem', {
        id: book.value.id,
        title: book.value.title,
        price: book.value.price,
        quantity: 1,
        coverImage: book.value.coverImage,
      });
    };

    const toggleWishlist = () => {
      if (isInWishlist.value) {
        store.dispatch('wishlist/removeFromWishlist', bookId);
      } else {
        store.dispatch('wishlist/addToWishlist', {
          id: book.value.id,
          title: book.value.title,
          author: book.value.author,
          price: book.value.price,
          coverImage: book.value.coverImage,
        });
      }
    };

    onMounted(fetchBookDetails);

    return {
      book,
      relatedBooks,
      loading,
      error,
      isInWishlist,
      formatPrice,
      formatDate,
      fetchBookDetails,
      addToCart,
      toggleWishlist,
    };
  },
};
</script>

<style scoped>
.book-details-container {
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

.book-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

.book-image-section {
  position: sticky;
  top: 2rem;
}

.book-cover {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.book-actions {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.price-section {
  margin-bottom: 1rem;
}

.book-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #3f51b5;
}

.original-price {
  text-decoration: line-through;
  color: #666;
  margin-left: 0.5rem;
}

.stock-status {
  color: #4caf50;
  font-weight: 500;
  margin-bottom: 1rem;
}

.stock-status.out-of-stock {
  color: #f44336;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-to-cart,
.add-to-wishlist {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-to-cart {
  background-color: #3f51b5;
  color: white;
}

.add-to-cart:hover {
  background-color: #303f9f;
}

.add-to-wishlist {
  background-color: #f5f5f5;
  color: #333;
}

.add-to-wishlist:hover {
  background-color: #e0e0e0;
}

.add-to-wishlist.in-wishlist {
  background-color: #ffebee;
  color: #d32f2f;
}

.book-info-section {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-header {
  margin-bottom: 1.5rem;
}

.book-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.book-meta {
  color: #666;
}

.author-link {
  color: #3f51b5;
  text-decoration: none;
}

.author-link:hover {
  text-decoration: underline;
}

.publication-date {
  margin-left: 1rem;
}

.book-categories {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.category-tag {
  padding: 0.25rem 0.75rem;
  background-color: #f5f5f5;
  border-radius: 16px;
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
}

.category-tag:hover {
  background-color: #e0e0e0;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.stars {
  color: #ffc107;
}

.rating-count {
  color: #666;
  font-size: 0.9rem;
}

.book-details h2 {
  font-size: 1.25rem;
  color: #333;
  margin: 1.5rem 0 1rem;
}

.book-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  color: #666;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: #333;
}

.book-reviews {
  margin-top: 2rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-card {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.reviewer-name {
  font-weight: 500;
}

.review-date {
  color: #666;
  font-size: 0.9rem;
  margin-left: 0.5rem;
}

.review-rating {
  color: #ffc107;
}

.review-content {
  color: #666;
  line-height: 1.5;
}

.related-books {
  margin-top: 3rem;
}

.related-books h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.related-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1.5rem;
}

.related-book-card {
  text-decoration: none;
  color: inherit;
}

.related-book-cover {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.related-book-info h3 {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.related-book-info p {
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.related-book-price {
  color: #3f51b5;
  font-weight: 500;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .book-details-container {
    padding: 1rem;
  }

  .book-content {
    grid-template-columns: 1fr;
  }

  .book-image-section {
    position: static;
    max-width: 300px;
    margin: 0 auto;
  }

  .book-info-section {
    padding: 1rem;
  }

  .book-title {
    font-size: 1.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .related-books-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}
</style>
