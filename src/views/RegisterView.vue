<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="register-title">Créer un compte</h1>

      <div v-if="error" class="alert alert-danger">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input
              type="text"
              id="firstName"
              v-model="firstName"
              required
              class="form-control"
              placeholder="Votre prénom"
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nom</label>
            <input
              type="text"
              id="lastName"
              v-model="lastName"
              required
              class="form-control"
              placeholder="Votre nom"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="form-control"
            placeholder="Choisissez un nom d'utilisateur"
          />
        </div>

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
          <label for="phone">Téléphone</label>
          <input
            type="tel"
            id="phone"
            v-model="phone"
            class="form-control"
            placeholder="Votre numéro de téléphone"
          />
        </div>

        <div class="form-group">
          <label for="address">Adresse</label>
          <textarea
            id="address"
            v-model="address"
            class="form-control"
            rows="3"
            placeholder="Votre adresse complète"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="role">Rôle</label>
            <select id="role" v-model="role" class="form-control">
              <option value="USER">Utilisateur</option>
              <option value="AUTHOR">Auteur</option>
              <option value="EDITOR">Éditeur</option>
            </select>
          </div>

          <div class="form-group">
            <label for="user_type">Type d'utilisateur</label>
            <select id="user_type" v-model="user_type" class="form-control">
              <option value="CUSTOMER">Client</option>
              <option value="PARTNER">Partenaire</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
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
              placeholder="Choisissez un mot de passe"
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
              placeholder="Confirmez votre mot de passe"
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

        <div class="form-group terms">
          <input type="checkbox" id="terms" v-model="acceptTerms" required />
          <label for="terms">
            J'accepte les
            <a href="/terms" target="_blank">conditions d'utilisation</a> et la
            <a href="/privacy" target="_blank">politique de confidentialité</a>
          </label>
        </div>

        <div class="form-group newsletter">
          <input
            type="checkbox"
            id="newsletter"
            v-model="subscribeNewsletter"
          />
          <label for="newsletter">
            Je souhaite recevoir la newsletter et les offres promotionnelles
          </label>
        </div>

        <button
          type="submit"
          class="btn-register"
          :disabled="loading || !isFormValid"
        >
          <span v-if="loading">
            <i class="fas fa-spinner fa-spin"></i> Inscription en cours...
          </span>
          <span v-else>Créer mon compte</span>
        </button>
      </form>

      <div class="register-footer">
        <p>Vous avez déjà un compte?</p>
        <router-link to="/login" class="btn-login"> Se connecter </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex'; // Assurez-vous que cette ligne est décommentée
import axios from 'axios';

export default {
  name: 'RegisterView',

  setup() {
    const store = useStore(); // Assurez-vous que cette ligne est décommentée
    const router = useRouter();

    // États
    const firstName = ref('');
    const lastName = ref('');
    const username = ref('');
    const email = ref('');
    const phone = ref('');
    const address = ref('');
    const role = ref('USER');
    const user_type = ref('CUSTOMER');
    const password = ref('');
    const confirmPassword = ref('');
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const acceptTerms = ref(false);
    const subscribeNewsletter = ref(false);
    const loading = ref(false);
    const error = ref('');

    // Calcul de la force du mot de passe
    const passwordStrength = computed(() => {
      if (!password.value) return 0;

      let strength = 0;

      // Longueur
      if (password.value.length >= 8) strength += 25;

      // Contient des chiffres
      if (/\d/.test(password.value)) strength += 25;

      // Contient des lettres minuscules et majuscules
      if (/[a-z]/.test(password.value) && /[A-Z]/.test(password.value))
        strength += 25;

      // Contient des caractères spéciaux
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

    // Validation du formulaire
    const isFormValid = computed(() => {
      return (
        firstName.value.trim() !== '' &&
        lastName.value.trim() !== '' &&
        username.value.trim() !== '' &&
        email.value.trim() !== '' &&
        password.value.length >= 8 &&
        password.value === confirmPassword.value &&
        acceptTerms.value
      );
    });

    // Méthodes
    const handleRegister = async () => {
      if (!isFormValid.value) return;

      loading.value = true;
      error.value = '';

      try {
        // Si vous avez un store Vuex configuré
        if (store && store.dispatch) {
          await store.dispatch('auth/register', {
            firstName: firstName.value,
            lastName: lastName.value,
            username: username.value,
            email: email.value,
            phone: phone.value,
            address: address.value,
            role: role.value,
            user_type: user_type.value,
            password: password.value,
            subscribeNewsletter: subscribeNewsletter.value,
            active: true,
          });
        } else {
          // Sinon, utilisez directement axios
          await axios.post('http://localhost:8111/api/auth/register', {
            firstName: firstName.value,
            lastName: lastName.value,
            username: username.value,
            email: email.value,
            phone: phone.value,
            address: address.value,
            role: role.value,
            user_type: user_type.value,
            password: password.value,
            subscribeNewsletter: subscribeNewsletter.value,
            active: true,
          });
        }

        // Stockage temporaire de l'email pour la page de succès
        localStorage.setItem('pendingRegistrationEmail', email.value);

        // Redirection vers la page de succès
        router.push('/register-success');
      } catch (err) {
        console.error("Erreur d'inscription:", err);
        if (err.response && err.response.status === 409) {
          error.value = 'Cette adresse email est déjà utilisée.';
        } else {
          error.value =
            "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
        }
      } finally {
        loading.value = false;
      }
    };

    // Réinitialiser l'erreur quand l'utilisateur modifie les champs
    watch([email, password], () => {
      error.value = '';
    });

    return {
      firstName,
      lastName,
      username,
      email,
      phone,
      address,
      role,
      user_type,
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      acceptTerms,
      subscribeNewsletter,
      loading,
      error,
      passwordStrength,
      passwordStrengthColor,
      passwordStrengthText,
      isFormValid,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
  padding: 40px 20px;
  background-color: #f5f5f5;
}

.register-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 550px;
  padding: 40px;
}

.register-title {
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

.form-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.form-row .form-group {
  flex: 1;
  margin-bottom: 0;
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

.form-control.is-invalid {
  border-color: #f44336;
}

.invalid-feedback {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 5px;
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

.terms,
.newsletter {
  display: flex;
  align-items: flex-start;
}

.terms input,
.newsletter input {
  margin-right: 10px;
  margin-top: 3px;
}

.terms a {
  color: #3f51b5;
  text-decoration: none;
}

.terms a:hover {
  text-decoration: underline;
}

.btn-register {
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
  margin-top: 10px;
}

.btn-register:hover {
  background-color: #303f9f;
}

.btn-register:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.register-footer {
  margin-top: 30px;
  text-align: center;
}

.register-footer p {
  margin-bottom: 10px;
  color: #666;
}

.btn-login {
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

.btn-login:hover {
  background-color: #e0e0e0;
}

@media (max-width: 576px) {
  .register-card {
    padding: 30px 20px;
  }

  .form-row {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
