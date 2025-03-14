<!-- src/views/NotFound.vue -->
<template>
  <div class="not-found">
    <h1>404 - Page non trouvée</h1>
    <p>La page que vous recherchez n'existe pas.</p>
    <router-link to="/" class="btn-home">Retour à l'accueil</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px 20px;
}

h1 {
  font-size: 2rem;
  margin-bottom: 20px;
}

p {
  margin-bottom: 30px;
}

.btn-home {
  display: inline-block;
  padding: 10px 20px;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}
</style>
