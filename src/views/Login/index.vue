<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Connexion</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="form-control"
            placeholder="Votre adresse email"
          />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="form-control"
              placeholder="Votre mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <div class="form-options">
          <div class="remember-me">
            <input type="checkbox" id="remember" v-model="rememberMe" />
            <label for="remember">Se souvenir de moi</label>
          </div>
          <router-link to="/forgot-password" class="forgot-password">
            Mot de passe oublié?
          </router-link>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin"></i> Connexion en cours...
          </span>
          <span v-else>Se connecter</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Vous n'avez pas de compte?</p>
        <router-link to="/register" class="btn-register">
          Créer un compte
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'LoginView',

  setup() {
    const store = useStore();
    const router = useRouter();

    // États
    const email = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const showPassword = ref(false);
    const loading = ref(false);
    const error = ref('');

    // Méthodes
    const handleLogin = async () => {
      loading.value = true;
      error.value = '';

      try {
        const result = await store.dispatch('auth/login', {
          email: email.value,
          password: password.value,
          rememberMe: rememberMe.value,
        });

        console.log('Résultat de connexion:', result);

        // Redirection après connexion réussie
        const redirectPath = router.currentRoute.value.query.redirect || '/';
        router.push(redirectPath);
      } catch (err) {
        console.error('Erreur de connexion:', err);
        error.value = 'Identifiants incorrects. Veuillez réessayer.';
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      password,
      rememberMe,
      showPassword,
      loading,
      error,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  background-color: #f5f5f5;
}

.login-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.8rem;
}

.alert-danger {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #3f51b5;
  outline: none;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 0.9rem;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 8px;
}

.forgot-password {
  color: #3f51b5;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-login:hover {
  background-color: #303f9f;
}

.btn-login:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
}

.login-footer p {
  margin-bottom: 10px;
  color: #666;
}

.btn-register {
  display: inline-block;
  padding: 10px 20px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-register:hover {
  background-color: #e0e0e0;
}

@media (max-width: 480px) {
  .login-card {
    padding: 20px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
