<template>
  <div class="user-list">
    <h1>Liste des utilisateurs</h1>
    <div v-if="loading">Chargement en cours...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <router-link
                :to="{ name: 'UserDetails', params: { id: user.id } }"
              >
                Détails
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'UserList',
  computed: {
    ...mapState('user', ['users', 'loading', 'error']),
  },
  methods: {
    ...mapActions('user', ['fetchUsers']),
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>
