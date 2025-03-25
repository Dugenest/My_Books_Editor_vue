<template>
  <div class="authors-container">
    <h1 class="page-title">Auteurs</h1>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement des auteurs...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchAuthors" class="retry-button">Réessayer</button>
    </div>

    <div v-else class="authors-grid">
      <router-link
        v-for="author in authors"
        :key="author.id"
        :to="{ name: 'AuthorDetails', params: { id: author.id } }"
        class="author-card"
      >
        <div class="author-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <h2 class="author-name">
          {{ author.firstName }} {{ author.lastName }}
        </h2>
        <p class="author-count">{{ author.bookCount }} livres</p>
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import AuthorService from '@/services/AuthorService';

export default {
  name: 'AuthorsView',

  setup() {
    const authors = ref([]);
    const loading = ref(true);
    const error = ref('');

    const fetchAuthors = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await AuthorService.getAuthors();
        console.log('Réponse brute des auteurs:', response);

        // Initialiser le tableau des auteurs
        let authorsData = [];

        // Déterminer la structure de la réponse et extraire les données
        if (response && response.data) {
          // Si la réponse a un format paginé (content)
          if (response.data.content && Array.isArray(response.data.content)) {
            authorsData = response.data.content;
          }
          // Si la réponse est un tableau simple
          else if (Array.isArray(response.data)) {
            authorsData = response.data;
          }
          // Si la réponse elle-même est le tableau
          else if (response.content && Array.isArray(response.content)) {
            authorsData = response.content;
          }
        } else if (Array.isArray(response)) {
          authorsData = response;
        }

        // Filtrer les auteurs valides (avec un ID)
        authors.value = authorsData
          .filter(
            (author) =>
              author && typeof author.id !== 'undefined' && author.id !== null
          )
          .map((author) => ({
            id: author.id,
            firstName: author.firstName || 'Prénom inconnu',
            lastName: author.lastName || 'Nom inconnu',
            bookCount: author.bookCount || 0,
            biography: author.biography || '',
          }));

        console.log('Auteurs traités:', authors.value);
      } catch (err) {
        console.error('Erreur lors du chargement des auteurs:', err);
        error.value =
          'Impossible de charger les auteurs. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchAuthors);

    return {
      authors,
      loading,
      error,
      fetchAuthors,
    };
  },
};
</script>

<style scoped>
.authors-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 80px;
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

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.author-card {
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

.author-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.author-avatar {
  font-size: 3rem;
  color: #3f51b5;
  margin-bottom: 1rem;
}

.author-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-align: center;
}

.author-count {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .authors-container {
    padding: 1rem;
  }

  .authors-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .author-card {
    padding: 1.5rem;
  }
}
</style>
