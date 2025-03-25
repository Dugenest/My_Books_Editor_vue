<!-- EditorsSection.vue - Composant pour la gestion des éditeurs -->
<template>
  <section class="editors-section">
    <div class="section-header">
      <h2>Gestion des éditeurs</h2>
      <button class="btn-primary" @click="$emit('add')">
        <i class="fas fa-plus"></i> Ajouter un éditeur
      </button>
    </div>

    <div class="card-container">
      <div v-if="!editors || editors.length === 0" class="no-data-card">
        <i class="fas fa-info-circle"></i>
        <p>Aucun éditeur disponible</p>
        <button class="btn-primary" @click="$emit('add')">
          Ajouter un éditeur
        </button>
      </div>

      <div v-else class="editors-grid">
        <div v-for="editor in editors" :key="editor.id" class="editor-card">
          <div class="editor-header">
            <h3>{{ editor.name }}</h3>
            <p v-if="editor.company" class="editor-company">
              <i class="fas fa-building"></i> {{ editor.company }}
            </p>
          </div>
          <div class="editor-content">
            <p v-if="editor.description" class="editor-description">
              <i class="fas fa-info-circle"></i>
              <span class="description-text">{{ editor.description }}</span>
            </p>
            <p v-else class="no-description">
              <i class="fas fa-info-circle"></i> Aucune description
            </p>
            <p v-if="editor.website" class="editor-website">
              <i class="fas fa-globe"></i>
              <a
                :href="editor.website"
                target="_blank"
                rel="noopener noreferrer"
                >{{ editor.website }}</a
              >
            </p>
            <p
              v-if="editor.books && editor.books.length > 0"
              class="editor-books"
            >
              <i class="fas fa-book"></i> {{ editor.books.length }} livres
            </p>
          </div>
          <div class="editor-actions">
            <button class="btn-edit" @click="$emit('edit', editor)">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="btn-delete" @click="$emit('delete', editor)">
              <i class="fas fa-trash"></i> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'EditorsSection',

  props: {
    editors: {
      type: Array,
      default: () => [],
    },
  },

  emits: ['add', 'edit', 'delete'],
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

.editors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.editor-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.editor-header {
  padding: 1rem;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
}

.editor-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.editor-content {
  padding: 1rem;
  min-height: 100px;
}

.editor-description {
  margin-top: 0.5rem;
  color: #333;
  font-size: 0.95rem;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.description-text {
  flex: 1;
}

.no-description {
  color: #888;
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.editor-company {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #555;
  font-weight: 500;
}

.editor-website {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.editor-website a {
  color: #1976d2;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor-website a:hover {
  text-decoration: underline;
}

.editor-books {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  color: #555;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-edit {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
}

.btn-edit:hover {
  background-color: #1e88e5;
}

.btn-delete {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete:hover {
  background-color: #e53935;
}

.no-data-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.no-data-card i {
  font-size: 3rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.no-data-card p {
  margin-bottom: 1.5rem;
  color: #666;
}
</style>
