import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios from 'axios';

// Configuration globale d'Axios
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Initialiser l'application après avoir vérifié l'authentification
const initApp = async () => {
  // Vérifier l'authentification avant le montage de l'application
  await store.dispatch('auth/checkAuth');

  createApp(App).use(store).use(router).mount('#app');
};

// Démarrer l'application
initApp();
