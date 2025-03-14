<template>
  <div class="register-success-container">
    <div class="success-card">
      <div class="success-icon">
        <i class="fas fa-check-circle"></i>
      </div>

      <h1 class="success-title">Inscription réussie!</h1>

      <p class="success-message">
        Merci de vous être inscrit sur MyBooks. Un email de confirmation a été
        envoyé à l'adresse <strong>{{ email }}</strong
        >.
      </p>

      <p class="instructions">
        Veuillez cliquer sur le lien dans cet email pour activer votre compte.
        Si vous ne recevez pas l'email dans les prochaines minutes, vérifiez
        votre dossier de spam.
      </p>

      <div class="action-buttons">
        <router-link to="/" class="btn-home"> Retour à l'accueil </router-link>

        <button
          @click="resendConfirmation"
          class="btn-resend"
          :disabled="resending"
        >
          <span v-if="resending">
            <i class="fas fa-spinner fa-spin"></i> Envoi en cours...
          </span>
          <span v-else>Renvoyer l'email</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'RegisterSuccessView',

  setup() {
    const store = useStore();
    const router = useRouter();

    const email = ref(store.state.auth.pendingRegistrationEmail || '');
    const resending = ref(false);

    // Si pas d'email en attente, rediriger vers la page d'accueil
    if (!email.value) {
      router.push('/');
    }

    const resendConfirmation = async () => {
      if (!email.value) return;

      resending.value = true;

      try {
        await store.dispatch('auth/resendConfirmation', email.value);
        alert('Un nouvel email de confirmation a été envoyé.');
      } catch (error) {
        console.error("Erreur lors du renvoi de l'email:", error);
        alert('Une erreur est survenue. Veuillez réessayer plus tard.');
      } finally {
        resending.value = false;
      }
    };

    return {
      email,
      resending,
      resendConfirmation,
    };
  },
};
</script>

<style scoped>
.register-success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  background-color: #f5f5f5;
}

.success-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
  padding: 40px;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  color: #4caf50;
  margin-bottom: 20px;
}

.success-title {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.8rem;
}

.success-message {
  margin-bottom: 15px;
  font-size: 1.1rem;
  color: #555;
}

.instructions {
  margin-bottom: 30px;
  color: #666;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.btn-home,
.btn-resend {
  padding: 12px 20px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-home {
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border: none;
}

.btn-home:hover {
  background-color: #303f9f;
}

.btn-resend {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-resend:hover {
  background-color: #e0e0e0;
}

.btn-resend:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .success-card {
    padding: 30px 20px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .btn-home,
  .btn-resend {
    width: 100%;
  }
}
</style>
