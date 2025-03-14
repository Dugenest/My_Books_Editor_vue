<template>
  <div class="reset-password-container">
    <div class="reset-password-card">
      <h1 class="reset-password-title">Réinitialisation du mot de passe</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form
        v-if="!invalidToken"
        @submit.prevent="handleSubmit"
        class="reset-password-form"
      >
        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="form-control"
              placeholder="Entrez votre nouveau mot de passe"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <div class="password-strength" v-if="password">
            <div class="strength-meter">
              <div
                class="strength-value"
                :style="{
                  width: passwordStrength + '%',
                  backgroundColor: passwordStrengthColor,
                }"
              ></div>
            </div>
            <span
              class="strength-text"
              :style="{ color: passwordStrengthColor }"
            >
              {{ passwordStrengthText }}
            </span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <div class="password-input">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              required
              class="form-control"
              placeholder="Confirmez votre nouveau mot de passe"
              :class="{
                'is-invalid':
                  password && confirmPassword && password !== confirmPassword,
              }"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i
                :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              ></i>
            </button>
          </div>
          <div
            class="invalid-feedback"
            v-if="password && confirmPassword && password !== confirmPassword"
          >
            Les mots de passe ne correspondent pas.
          </div>
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin"></i> Réinitialisation en cours...
          </span>
          <span v-else>Réinitialiser le mot de passe</span>
        </button>
      </form>

      <div v-else class="invalid-token">
        <i class="fas fa-exclamation-circle"></i>
        <p>Le lien de réinitialisation est invalide ou a expiré.</p>
        <router-link to="/forgot-password" class="btn-request-new">
          Demander un nouveau lien
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthService from '@/services/AuthService';

export default {
  name: 'ResetPasswordView',

  setup() {
    const route = useRoute();
    const router = useRouter();
    const token = route.params.token;

    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const loading = ref(false);
    const error = ref('');
    const invalidToken = ref(false);

    // Validation du token
    onMounted(async () => {
      try {
        await AuthService.validateResetToken(token);
      } catch (err) {
        invalidToken.value = true;
      }
    });

    // Force du mot de passe
    const passwordStrength = computed(() => {
      if (!password.value) return 0;

      let strength = 0;
      if (password.value.length >= 8) strength += 25;
      if (/\d/.test(password.value)) strength += 25;
      if (/[a-z]/.test(password.value) && /[A-Z]/.test(password.value))
        strength += 25;
      if (/[^a-zA-Z0-9]/.test(password.value)) strength += 25;

      return strength;
    });

    const passwordStrengthColor = computed(() => {
      if (passwordStrength.value < 50) return '#f44336';
      if (passwordStrength.value < 75) return '#ff9800';
      return '#4caf50';
    });

    const passwordStrengthText = computed(() => {
      if (passwordStrength.value < 50) return 'Faible';
      if (passwordStrength.value < 75) return 'Moyen';
      return 'Fort';
    });

    const isFormValid = computed(() => {
      return (
        password.value.length >= 8 && password.value === confirmPassword.value
      );
    });

    const handleSubmit = async () => {
      if (!isFormValid.value) return;

      loading.value = true;
      error.value = '';

      try {
        await AuthService.resetPassword({
          token,
          password: password.value,
        });

        // Redirection vers la page de connexion avec un message de succès
        router.push({
          name: 'Login',
          query: {
            message: 'Votre mot de passe a été réinitialisé avec succès.',
          },
        });
      } catch (err) {
        console.error('Erreur lors de la réinitialisation:', err);
        error.value = 'Une erreur est survenue. Veuillez réessayer.';
      } finally {
        loading.value = false;
      }
    };

    return {
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loading,
      error,
      invalidToken,
      passwordStrength,
      passwordStrengthColor,
      passwordStrengthText,
      isFormValid,
      handleSubmit,
    };
  },
};
</script>

<style scoped>
.reset-password-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  background-color: #f5f5f5;
}

.reset-password-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  padding: 40px;
}

.reset-password-title {
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

.password-input {
  position: relative;
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

.form-control.is-invalid {
  border-color: #f44336;
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

.invalid-feedback {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 5px;
}

.password-strength {
  margin-top: 10px;
}

.strength-meter {
  height: 5px;
  background-color: #eee;
  border-radius: 3px;
  margin-bottom: 5px;
}

.strength-value {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s, background-color 0.3s;
}

.strength-text {
  font-size: 0.85rem;
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

.invalid-token {
  text-align: center;
  color: #d32f2f;
}

.invalid-token i {
  font-size: 3rem;
  margin-bottom: 20px;
}

.invalid-token p {
  margin-bottom: 20px;
}

.btn-request-new {
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

.btn-request-new:hover {
  background-color: #e0e0e0;
}

@media (max-width: 576px) {
  .reset-password-card {
    padding: 30px 20px;
  }
}
</style>
