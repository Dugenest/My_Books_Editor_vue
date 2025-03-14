<template>
  <div class="user-details">
    <h1>Détails de l'utilisateur</h1>
    <div v-if="loading">Chargement en cours...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else-if="currentUser">
      <div><strong>ID:</strong> {{ currentUser.id }}</div>
      <div><strong>Nom:</strong> {{ currentUser.name }}</div>
      <div><strong>Email:</strong> {{ currentUser.email }}</div>
      <!-- Autres détails -->
      <router-link :to="{ name: 'UserList' }"> Retour à la liste </router-link>
    </div>
    <div v-else>Utilisateur non trouvé</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'UserDetails',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    ...mapState('user', ['currentUser', 'loading', 'error']),
  },
  methods: {
    ...mapActions('user', ['fetchUser']),
  },
  mounted() {
    this.fetchUser(this.id);
  },
};
</script>
