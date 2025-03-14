<!-- AdminSidebar.vue - Composant de barre latérale -->
<template>
  <nav class="admin-nav">
    <div class="nav-header">
      <h1>Administration</h1>
      <button
        class="btn-toggle-nav"
        @click="isMobileNavOpen = !isMobileNavOpen"
      >
        <i class="fas" :class="isMobileNavOpen ? 'fa-times' : 'fa-bars'"></i>
      </button>
    </div>

    <div class="nav-content" :class="{ 'mobile-open': isMobileNavOpen }">
      <div
        v-for="(section, index) in navSections"
        :key="index"
        class="nav-section"
      >
        <button
          class="nav-item"
          :class="{ active: currentSection === section.id }"
          @click="$emit('change-section', section.id)"
        >
          <i :class="section.icon"></i>
          {{ section.label }}
        </button>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AdminSidebar',

  props: {
    navSections: {
      type: Array,
      required: true,
    },
    currentSection: {
      type: String,
      required: true,
    },
  },

  emits: ['change-section'],

  setup() {
    const isMobileNavOpen = ref(false);

    return {
      isMobileNavOpen,
    };
  },
};
</script>

<style scoped>
.admin-nav {
  background-color: #1a237e;
  color: white;
  padding: 1.5rem;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.nav-header h1 {
  font-size: 1.5rem;
  margin: 0;
}

.btn-toggle-nav {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
}

.nav-section {
  margin-bottom: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 4px;
}

.nav-item:hover,
.nav-item.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item i {
  width: 20px;
}

@media (max-width: 1024px) {
  .admin-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    padding: 1rem;
  }

  .btn-toggle-nav {
    display: block;
  }

  .nav-content {
    display: none;
  }

  .nav-content.mobile-open {
    display: block;
  }
}
</style>
