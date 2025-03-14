<!-- src/views/AccessDeniedView.vue -->
<template>
  <div class="access-denied-container">
    <div class="access-denied-card">
      <div class="icon-container">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <h1>Accès refusé</h1>
      <p class="message">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <p class="sub-message">
        Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une
        erreur.
      </p>

      <div class="buttons">
        <button @click="goBack" class="btn btn-back">
          <i class="fas fa-arrow-left"></i> Retour
        </button>
        <router-link to="/" class="btn btn-home">
          <i class="fas fa-home"></i> Accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccessDeniedView',
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.access-denied-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  background-color: #f5f5f5;
}

.access-denied-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 40px;
  text-align: center;
}

.icon-container {
  font-size: 3rem;
  color: #e74c3c;
  margin-bottom: 20px;
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.message {
  font-size: 1.1rem;
  margin-bottom: 15px;
  color: #555;
}

.sub-message {
  font-size: 0.9rem;
  color: #777;
  margin-bottom: 30px;
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-back {
  background-color: #7f8c8d;
  color: white;
  border: none;
}

.btn-home {
  background-color: #3f51b5;
  color: white;
  border: none;
}

.btn:hover {
  opacity: 0.9;
}

@media (max-width: 576px) {
  .buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
