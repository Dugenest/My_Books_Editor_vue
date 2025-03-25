<template>
  <div class="series-container">
    <h1 class="page-title">Séries</h1>

    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement des séries...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchSeries" class="retry-button">Réessayer</button>
    </div>

    <div v-else class="series-grid">
      <div v-for="series in seriesList" :key="series.id" class="series-card">
        <div class="series-header">
          <i class="fas fa-bookmark series-icon"></i>
          <h2 class="series-title">{{ series.name }}</h2>
        </div>
        <div class="series-info">
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
        <router-link
          :to="{ name: 'SeriesDetails', params: { id: series.id } }"
          class="view-series-btn"
        >
          Voir la série
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import SeriesService from '@/services/SeriesService';

export default {
  name: 'SeriesView',

  setup() {
    const seriesList = ref([]);
    const loading = ref(true);
    const error = ref('');

    const fetchSeries = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await SeriesService.getSeries();
        console.log('Réponse brute des séries:', response);

        // Initialiser le tableau des séries
        let seriesData = [];

        // Déterminer la structure de la réponse et extraire les données
        if (response && response.data) {
          if (response.data.content && Array.isArray(response.data.content)) {
            seriesData = response.data.content;
          } else if (Array.isArray(response.data)) {
            seriesData = response.data;
          } else if (response.content && Array.isArray(response.content)) {
            seriesData = response.content;
          }
        } else if (Array.isArray(response)) {
          seriesData = response;
        }

        // Filtrer les séries valides (avec un ID)
        seriesList.value = seriesData
          .filter(
            (series) =>
              series && typeof series.id !== 'undefined' && series.id !== null
          )
          .map((series) => ({
            id: series.id,
            name: series.name || 'Série sans nom',
            description: series.description || '',
            bookCount: series.bookCount || 0,
            authorCount: series.authorCount || 0,
          }));

        console.log('Séries traitées:', seriesList.value);
      } catch (err) {
        console.error('Erreur lors du chargement des séries:', err);
        error.value =
          'Impossible de charger les séries. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchSeries);

    return {
      seriesList,
      loading,
      error,
      fetchSeries,
    };
  },
};
</script>

<style scoped>
.series-container {
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

.series-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.series-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.series-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.series-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.series-icon {
  font-size: 2rem;
  color: #3f51b5;
}

.series-title {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
}

.series-info {
  margin-bottom: 1.5rem;
}

.series-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.series-stats {
  display: flex;
  gap: 1rem;
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

.view-series-btn {
  display: block;
  text-align: center;
  padding: 0.75rem;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.view-series-btn:hover {
  background-color: #303f9f;
}

@media (max-width: 768px) {
  .series-container {
    padding: 1rem;
  }

  .series-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .series-card {
    padding: 1rem;
  }

  .series-title {
    font-size: 1.25rem;
  }
}
</style>
