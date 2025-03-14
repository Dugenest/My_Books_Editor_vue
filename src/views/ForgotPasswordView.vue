<template>
  <div class="forgot-password-container">
    <div class="forgot-password-card">
      <h1 class="forgot-password-title">Mot de passe oublié</h1>

      <div v-if="success" class="alert alert-success">
        {{ success }}
      </div>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="forgot-password-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="form-control"
            placeholder="Votre adresse email"
            :disabled="loading"
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin"></i> Envoi en cours...
          </span>
          <span v-else>Réinitialiser le mot de passe</span>
        </button>
      </form>

      <div class="form-footer">
        <router-link to="/login" class="back-to-login">
          Retour à la connexion
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import AuthService from '@/services/AuthService';

export default {
  name: 'ForgotPasswordView',

  setup() {
    const email = ref('');
    const loading = ref(false);
    const error = ref('');
    const success = ref('');

    const handleSubmit = async () => {
      if (!email.value) return;

      loading.value = true;
      error.value = '';
      success.value = '';

      try {
        await AuthService.requestPasswordReset(email.value);
        success.value =
          'Un email de réinitialisation a été envoyé à votre adresse.';
        email.value = '';
      } catch (err) {
        console.error('Erreur lors de la demande de réinitialisation:', err);
        error.value = 'Une erreur est survenue. Veuillez réessayer.';
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      loading,
      error,
      success,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.forgot-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  background-color: #f5f5f5;
}

.forgot-password-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.forgot-password-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 1.8rem;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.alert-success {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.alert-danger {
  background-color: #ffebee;
  color: #d32f2f;
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

.btn-submit {
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

.btn-submit:hover {
  background-color: #303f9f;
}

.btn-submit:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.back-to-login {
  color: #3f51b5;
  text-decoration: none;
  font-size: 0.9rem;
}

.back-to-login:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .forgot-password-card {
    padding: 30px 20px;
  }
}
</style>
