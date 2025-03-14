<!-- CategoriesSection.vue - Composant de gestion des catégories -->
<template>
  <section class="categories-section">
    <div class="section-header">
      <h2>Gestion des catégories</h2>
      <div class="header-actions">
        <button class="btn-primary" @click="$emit('add')">
          <i class="fas fa-plus"></i>
          Ajouter une catégorie
        </button>
      </div>
    </div>

    <div class="categories-grid">
      <div
        v-for="category in categories"
        :key="category.id"
        class="category-card"
      >
        <div class="category-header">
          <i :class="category.icon || 'fas fa-book'"></i>
          <div class="category-actions">
            <button
              class="btn-icon"
              @click="$emit('edit', category)"
              title="Modifier"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn-icon delete"
              @click="$emit('delete', category)"
              title="Supprimer"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>

        <h3>{{ category.name }}</h3>
        <p>{{ category.description }}</p>

        <div class="category-stats">
          <div class="stat">
            <span class="stat-value">{{ category.booksCount }}</span>
            <span class="stat-label">Livres</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{ category.activeBooks }}</span>
            <span class="stat-label">Actifs</span>
          </div>
        </div>
      </div>

      <div v-if="categories.length === 0" class="no-data-card">
        <i class="fas fa-info-circle"></i>
        <p>Aucune catégorie trouvée</p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CategoriesSection',

  props: {
    categories: {
      type: Array,
      required: true,
    },
  },

  emits: ['edit', 'delete', 'add'],
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  color: #333;
  margin: 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.category-header i {
  font-size: 2rem;
  color: #3f51b5;
}

.category-card h3 {
  font-size: 1.25rem;
  color: #333;
  margin: 0 0 0.5rem;
}

.category-card p {
  color: #666;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.category-stats {
  display: flex;
  gap: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-icon:hover {
  background-color: #f5f5f5;
}

.btn-icon.delete:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.no-data-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.no-data-card i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #ddd;
}

.btn-primary {
  background-color: #1a237e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #303f9f;
}

@media (max-width: 576px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }
}
</style>
