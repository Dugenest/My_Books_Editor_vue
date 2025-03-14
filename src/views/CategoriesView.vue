<template>
  <div class="categories-container">
    <h1 class="page-title">Catégories</h1>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement des catégories...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchCategories" class="retry-button">Réessayer</button>
    </div>

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
        <h2 class="category-name">{{ category.name }}</h2>
        <p class="category-count">{{ category.bookCount }} livres</p>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import CategoryService from '@/services/CategoryService';

export default {
  name: 'CategoriesView',

  setup() {
    const categories = ref([]);
    const loading = ref(true);
    const error = ref('');

    const getCategoryIcon = (categoryName) => {
      const icons = {
        Roman: 'fas fa-book',
        'Science-Fiction': 'fas fa-rocket',
        Policier: 'fas fa-search',
        Fantasy: 'fas fa-dragon',
        Biographie: 'fas fa-user-edit',
        Histoire: 'fas fa-landmark',
        Sciences: 'fas fa-atom',
        Art: 'fas fa-palette',
        Cuisine: 'fas fa-utensils',
        Jeunesse: 'fas fa-child',
      };
      return icons[categoryName] || 'fas fa-book';
    };

    const fetchCategories = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await CategoryService.getAllCategories();
        categories.value = response.data;
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
        error.value =
          'Impossible de charger les catégories. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchCategories);

    return {
      categories,
      loading,
      error,
      getCategoryIcon,
      fetchCategories,
    };
  },
};
</script>

<style scoped>
.categories-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #333;
  transition: transform 0.3s, box-shadow 0.3s;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 2.5rem;
  color: #3f51b5;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
}

.category-count {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .categories-container {
    padding: 1rem;
  }

  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .category-card {
    padding: 1.5rem;
  }
}
</style>
