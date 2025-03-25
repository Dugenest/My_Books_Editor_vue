<template>
  <div class="profile-container">
    <!-- Message de chargement ou d'erreur -->
    <div v-if="loading" class="loading">Chargement de votre profil...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="!loading && !error" class="profile-content">
      <div class="profile-header">
        <h1>
          Profil de {{ profileData.firstName }} {{ profileData.lastName }}
        </h1>
      </div>

      <!-- Tabs de navigation -->
      <div class="profile-tabs">
        <button
          @click="activeTab = 'info'"
          :class="{ active: activeTab === 'info' }"
          class="tab-button"
        >
          Informations personnelles
        </button>
        <button
          @click="activeTab = 'orders'"
          :class="{ active: activeTab === 'orders' }"
          class="tab-button"
        >
          Mes commandes
        </button>
        <button
          @click="activeTab = 'security'"
          :class="{ active: activeTab === 'security' }"
          class="tab-button"
        >
          Sécurité
        </button>
      </div>

      <!-- Contenu des tabs -->
      <div class="tab-content">
        <!-- Tab Informations Personnelles -->
        <div v-if="activeTab === 'info'" class="profile-info">
          <div class="info-section">
            <div class="section-header">
              <h3>Coordonnées</h3>
              <button
                v-if="!editMode"
                @click="editMode = true"
                class="btn-edit"
              >
                <i class="fas fa-edit"></i> Modifier les informations
              </button>
            </div>

            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="form-section">
                <div class="form-group">
                  <label for="username">Nom d'utilisateur</label>
                  <input
                    type="text"
                    id="username"
                    v-model="profileData.username"
                    :disabled="!editMode"
                    required
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName">Prénom</label>
                    <input
                      type="text"
                      id="firstName"
                      v-model="profileData.firstName"
                      :disabled="!editMode"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label for="lastName">Nom</label>
                    <input
                      type="text"
                      id="lastName"
                      v-model="profileData.lastName"
                      :disabled="!editMode"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    v-model="profileData.email"
                    :disabled="!editMode"
                    required
                  />
                </div>

                <div class="form-group">
                  <label for="phone">Téléphone</label>
                  <input
                    type="tel"
                    id="phone"
                    v-model="profileData.phone"
                    :disabled="!editMode"
                  />
                </div>
              </div>

              <div class="form-section">
                <div class="section-header">
                  <h3>Adresse</h3>
                </div>
                <div class="form-group">
                  <label for="street">Rue</label>
                  <input
                    type="text"
                    id="street"
                    v-model="profileData.address.street"
                    :disabled="!editMode"
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city">Ville</label>
                    <input
                      type="text"
                      id="city"
                      v-model="profileData.address.city"
                      :disabled="!editMode"
                    />
                  </div>

                  <div class="form-group">
                    <label for="postalCode">Code postal</label>
                    <input
                      type="text"
                      id="postalCode"
                      v-model="profileData.address.postalCode"
                      :disabled="!editMode"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label for="country">Pays</label>
                  <input
                    type="text"
                    id="country"
                    v-model="profileData.address.country"
                    :disabled="!editMode"
                  />
                </div>
              </div>

              <div class="form-actions" v-if="editMode">
                <button type="submit" class="btn-save" :disabled="submitting">
                  {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
                <button
                  type="button"
                  @click="cancelEdit"
                  class="btn-cancel"
                  :disabled="submitting"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tab Commandes -->
        <div v-if="activeTab === 'orders'" class="profile-orders">
          <div class="orders-section">
            <h2>Historique des commandes</h2>

            <div v-if="loadingOrders" class="loading">
              Chargement de vos commandes...
            </div>
            <div v-else-if="orderError" class="error-message">
              {{ orderError }}
            </div>
            <div v-else-if="orders.length === 0" class="no-orders">
              <p>Vous n'avez pas encore passé de commande.</p>
              <router-link to="/" class="btn-shop"
                >Parcourir le catalogue</router-link
              >
            </div>
            <div v-else class="orders-list">
              <div v-for="order in orders" :key="order.id" class="order-card">
                <div class="order-header">
                  <div class="order-id">
                    <span>Commande #{{ order.orderNumber }}</span>
                  </div>
                  <div class="order-date">
                    {{ formatDate(order.orderDate) }}
                  </div>
                  <div
                    class="order-status"
                    :class="getStatusClass(order.status)"
                  >
                    {{ getStatusLabel(order.status) }}
                  </div>
                </div>

                <div class="order-items">
                  <div
                    v-for="item in order.orderDetails"
                    :key="item.id"
                    class="order-item"
                  >
                    <div class="item-image">
                      <img
                        v-if="item.book.coverImage"
                        :src="item.book.coverImage"
                        :alt="item.book.title"
                      />
                      <div v-else class="book-placeholder">
                        <i class="fas fa-book"></i>
                        <span class="book-title-small">{{
                          item.book.title
                        }}</span>
                      </div>
                    </div>
                    <div class="item-details">
                      <h4>{{ item.book.title }}</h4>
                      <p>
                        {{ item.book.author.firstName }}
                        {{ item.book.author.lastName }}
                      </p>
                      <div class="item-meta">
                        <span class="item-quantity"
                          >Qté: {{ item.quantity }}</span
                        >
                        <span class="item-price">{{
                          formatPrice(item.unitPrice)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="order-summary">
                  <div class="summary-item">
                    <span>Total</span>
                    <span class="total-price">{{
                      formatPrice(order.totalAmount)
                    }}</span>
                  </div>
                </div>

                <div class="order-actions">
                  <button
                    @click="viewOrderDetails(order.id)"
                    class="btn-details"
                  >
                    Voir les détails
                  </button>
                  <button
                    v-if="order.status === 'DELIVERED'"
                    @click="reorder(order.id)"
                    class="btn-reorder"
                  >
                    Commander à nouveau
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Sécurité -->
        <div v-if="activeTab === 'security'" class="profile-security">
          <div class="security-section">
            <h2>Sécurité du compte</h2>

            <form @submit.prevent="changePassword" class="password-form">
              <h3>Modification du mot de passe</h3>

              <div class="form-group">
                <label for="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  v-model="passwordData.currentPassword"
                  required
                />
              </div>

              <div class="form-group">
                <label for="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  v-model="passwordData.newPassword"
                  required
                />
                <div class="password-strength" :class="passwordStrengthClass">
                  Force du mot de passe: {{ passwordStrength }}
                </div>
                <div class="password-tips">
                  <p>Votre mot de passe doit contenir:</p>
                  <ul>
                    <li :class="{ valid: hasMinLength }">
                      Au moins 8 caractères
                    </li>
                    <li :class="{ valid: hasUpperCase }">
                      Au moins une majuscule
                    </li>
                    <li :class="{ valid: hasLowerCase }">
                      Au moins une minuscule
                    </li>
                    <li :class="{ valid: hasNumber }">Au moins un chiffre</li>
                    <li :class="{ valid: hasSpecialChar }">
                      Au moins un caractère spécial
                    </li>
                  </ul>
                </div>
              </div>

              <div class="form-group">
                <label for="confirmPassword"
                  >Confirmer le nouveau mot de passe</label
                >
                <input
                  type="password"
                  id="confirmPassword"
                  v-model="passwordData.confirmPassword"
                  required
                />
                <div v-if="passwordMismatch" class="password-mismatch">
                  Les mots de passe ne correspondent pas
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn-change-password"
                  :disabled="
                    isPasswordSubmitting ||
                    passwordMismatch ||
                    passwordStrengthClass === 'weak'
                  "
                >
                  {{
                    isPasswordSubmitting
                      ? 'Modification...'
                      : 'Modifier le mot de passe'
                  }}
                </button>
              </div>
            </form>

            <div class="account-deletion">
              <h3>Suppression du compte</h3>
              <p>
                La suppression de votre compte est définitive et entraînera la
                perte de toutes vos données.
              </p>
              <button
                @click="showDeleteConfirmation = true"
                class="btn-delete-account"
              >
                Supprimer mon compte
              </button>

              <!-- Modal de confirmation -->
              <div
                v-if="showDeleteConfirmation"
                class="delete-confirmation-modal"
              >
                <div class="modal-content">
                  <h3>Confirmation de suppression</h3>
                  <p>
                    Êtes-vous sûr de vouloir supprimer définitivement votre
                    compte ?
                  </p>
                  <p>
                    Cette action est irréversible et toutes vos données, y
                    compris votre historique de commandes, seront définitivement
                    perdues.
                  </p>

                  <div class="confirmation-input">
                    <label for="confirmDelete"
                      >Pour confirmer, veuillez saisir "SUPPRIMER"</label
                    >
                    <input
                      type="text"
                      id="confirmDelete"
                      v-model="deleteConfirmation"
                      placeholder="SUPPRIMER"
                    />
                  </div>

                  <div class="modal-actions">
                    <button
                      @click="deleteAccount"
                      class="btn-confirm-delete"
                      :disabled="
                        deleteConfirmation !== 'SUPPRIMER' || isDeleting
                      "
                    >
                      {{
                        isDeleting
                          ? 'Suppression...'
                          : 'Confirmer la suppression'
                      }}
                    </button>
                    <button
                      @click="showDeleteConfirmation = false"
                      class="btn-cancel-delete"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import UserService from '@/services/UserService';
import OrderService from '@/services/OrderService';

export default {
  name: 'UserProfile',

  setup() {
    const router = useRouter();
    const store = useStore();

    // États
    const loading = ref(true);
    const error = ref(null);
    const activeTab = ref('info');
    const editMode = ref(false);
    const submitting = ref(false);
    const loadingOrders = ref(false);
    const orderError = ref(null);
    const orders = ref([]);
    const showDeleteConfirmation = ref(false);
    const deleteConfirmation = ref('');
    const isDeleting = ref(false);
    const isPasswordSubmitting = ref(false);

    // Données du profil
    const profileData = reactive({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
    });

    // Sauvegarde des données originales pour pouvoir annuler les modifications
    const originalProfile = ref(null);

    // Données pour le changement de mot de passe
    const passwordData = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    // Propriétés calculées pour la validation du mot de passe
    const hasMinLength = computed(() => passwordData.newPassword.length >= 8);
    const hasUpperCase = computed(() => /[A-Z]/.test(passwordData.newPassword));
    const hasLowerCase = computed(() => /[a-z]/.test(passwordData.newPassword));
    const hasNumber = computed(() => /[0-9]/.test(passwordData.newPassword));
    const hasSpecialChar = computed(() =>
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordData.newPassword)
    );

    const passwordStrength = computed(() => {
      const strength = [
        hasMinLength.value,
        hasUpperCase.value,
        hasLowerCase.value,
        hasNumber.value,
        hasSpecialChar.value,
      ].filter(Boolean).length;

      if (strength <= 2) return 'Faible';
      if (strength <= 4) return 'Moyen';
      return 'Fort';
    });

    const passwordStrengthClass = computed(() => {
      if (passwordStrength.value === 'Fort') return 'strong';
      if (passwordStrength.value === 'Moyen') return 'medium';
      return 'weak';
    });

    const passwordMismatch = computed(() => {
      return (
        passwordData.newPassword &&
        passwordData.confirmPassword &&
        passwordData.newPassword !== passwordData.confirmPassword
      );
    });

    // Méthodes
    const fetchUserProfile = async () => {
      loading.value = true;
      error.value = null;

      try {
        const response = await UserService.getUserProfile();
        const userData = response.data;

        // Mise à jour des données du profil
        profileData.username = userData.username;
        profileData.firstName = userData.firstName;
        profileData.lastName = userData.lastName;
        profileData.email = userData.email;
        profileData.phone = userData.phone || '';

        // Mise à jour de l'adresse
        if (userData.address) {
          profileData.address.street = userData.address.street || '';
          profileData.address.city = userData.address.city || '';
          profileData.address.postalCode = userData.address.postalCode || '';
          profileData.address.country = userData.address.country || '';
        }

        // Sauvegarde des données originales
        originalProfile.value = JSON.parse(JSON.stringify(profileData));
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        error.value =
          'Impossible de charger les informations du profil. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    const fetchOrders = async () => {
      loadingOrders.value = true;
      orderError.value = null;

      try {
        const response = await OrderService.getUserOrders();
        orders.value = response.data;
      } catch (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        orderError.value =
          "Impossible de charger l'historique des commandes. Veuillez réessayer plus tard.";
      } finally {
        loadingOrders.value = false;
      }
    };

    const updateProfile = async () => {
      submitting.value = true;

      try {
        await UserService.updateUserProfile(profileData);

        // Mise à jour des données originales
        originalProfile.value = JSON.parse(JSON.stringify(profileData));

        // Sortie du mode édition
        editMode.value = false;

        // Notification
        alert('Profil mis à jour avec succès!');
      } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);
        alert(
          'Une erreur est survenue lors de la mise à jour du profil. Veuillez réessayer.'
        );
      } finally {
        submitting.value = false;
      }
    };

    const cancelEdit = () => {
      // Restauration des données originales
      if (originalProfile.value) {
        Object.assign(
          profileData,
          JSON.parse(JSON.stringify(originalProfile.value))
        );
      }

      // Sortie du mode édition
      editMode.value = false;
    };

    const changePassword = async () => {
      if (passwordMismatch.value) return;

      isPasswordSubmitting.value = true;

      try {
        await UserService.changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });

        // Réinitialisation du formulaire
        passwordData.currentPassword = '';
        passwordData.newPassword = '';
        passwordData.confirmPassword = '';

        // Notification
        alert('Mot de passe modifié avec succès!');
      } catch (err) {
        console.error('Erreur lors du changement de mot de passe:', err);

        if (err.response && err.response.status === 401) {
          alert('Le mot de passe actuel est incorrect.');
        } else {
          alert(
            'Une erreur est survenue lors du changement de mot de passe. Veuillez réessayer.'
          );
        }
      } finally {
        isPasswordSubmitting.value = false;
      }
    };

    const deleteAccount = async () => {
      if (deleteConfirmation.value !== 'SUPPRIMER') return;

      isDeleting.value = true;

      try {
        await UserService.deleteAccount();

        // Déconnexion
        store.dispatch('auth/logout');

        // Redirection vers la page d'accueil
        router.push('/');

        // Notification
        alert('Votre compte a été supprimé avec succès.');
      } catch (err) {
        console.error('Erreur lors de la suppression du compte:', err);
        alert(
          'Une erreur est survenue lors de la suppression du compte. Veuillez réessayer.'
        );
      } finally {
        isDeleting.value = false;
        showDeleteConfirmation.value = false;
      }
    };

    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    const formatPrice = (price) => {
      return `${price.toFixed(2)} €`;
    };

    const getStatusLabel = (status) => {
      const statusMap = {
        PENDING: 'En attente',
        PROCESSING: 'En traitement',
        SHIPPED: 'Expédiée',
        DELIVERED: 'Livrée',
        CANCELLED: 'Annulée',
      };

      return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
      return status.toLowerCase();
    };

    const viewOrderDetails = (orderId) => {
      router.push({ name: 'OrderDetails', params: { id: orderId } });
    };

    const reorder = async (orderId) => {
      try {
        await OrderService.reorder(orderId);
        router.push('/basket');
      } catch (err) {
        console.error('Erreur lors de la commande:', err);
        alert(
          'Une erreur est survenue lors de la commande. Veuillez réessayer.'
        );
      }
    };

    // Cycle de vie
    onMounted(() => {
      fetchUserProfile();

      // Chargement des commandes uniquement lorsqu'on clique sur l'onglet correspondant
      activeTab.value === 'orders' && fetchOrders();
    });

    // Observateur pour charger les commandes lorsqu'on active l'onglet
    const watchActiveTab = (newTab) => {
      if (newTab === 'orders' && orders.value.length === 0) {
        fetchOrders();
      }
    };

    return {
      loading,
      error,
      activeTab,
      editMode,
      submitting,
      profileData,
      orders,
      loadingOrders,
      orderError,
      passwordData,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      passwordStrength,
      passwordStrengthClass,
      passwordMismatch,
      isPasswordSubmitting,
      showDeleteConfirmation,
      deleteConfirmation,
      isDeleting,
      updateProfile,
      cancelEdit,
      changePassword,
      deleteAccount,
      formatDate,
      formatPrice,
      getStatusLabel,
      getStatusClass,
      viewOrderDetails,
      reorder,
      watchActiveTab,
    };
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  z-index: 1;
  margin-top: 80px;
}

.profile-header {
  position: relative;
  z-index: 1;
  background-color: white;
  padding: 30px 0;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-header h1 {
  text-align: center;
  margin: 0;
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
}

.loading,
.error-message {
  text-align: center;
  padding: 40px;
}

.error-message {
  color: #f44336;
}

/* Tabs de navigation */
.profile-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 30px;
}

.tab-button {
  padding: 12px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
}

.tab-button.active {
  color: #3f51b5;
  border-bottom-color: #3f51b5;
}

/* Contenu des tabs */
.tab-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

/* Tab Informations */
.info-section h2,
.security-section h2,
.orders-section h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #333;
}

.info-section h3,
.security-section h3 {
  margin-top: 30px;
  margin-bottom: 15px;
  color: #555;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.btn-edit,
.btn-save,
.btn-cancel,
.btn-change-password,
.btn-delete-account {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: #3f51b5;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-edit:hover {
  background-color: #303f9f;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-edit i {
  font-size: 18px;
}

.section-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.4rem;
  font-weight: bold;
}

.btn-save {
  background-color: #4caf50;
  border: none;
  color: white;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.btn-change-password {
  background-color: #3f51b5;
  border: none;
  color: white;
}

.btn-change-password:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Password Strength */
.password-strength {
  margin-top: 5px;
  font-size: 0.9rem;
}

.password-strength.weak {
  color: #f44336;
}

.password-strength.medium {
  color: #ff9800;
}

.password-strength.strong {
  color: #4caf50;
}

.password-tips {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.password-tips p {
  margin-top: 0;
  margin-bottom: 5px;
}

.password-tips ul {
  margin: 0;
  padding-left: 20px;
}

.password-tips li {
  margin-bottom: 2px;
  color: #f44336;
}

.password-tips li.valid {
  color: #4caf50;
}

.password-mismatch {
  color: #f44336;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* Account Deletion */
.account-deletion {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-delete-account {
  background-color: #f44336;
  border: none;
  color: white;
  margin-top: 10px;
}

/* Delete Confirmation Modal */
.delete-confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.modal-content h3 {
  margin-top: 0;
  color: #f44336;
}

.confirmation-input {
  margin: 20px 0;
}

.confirmation-input label {
  display: block;
  margin-bottom: 10px;
  font-weight: 500;
}

.confirmation-input input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-confirm-delete {
  background-color: #f44336;
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-confirm-delete:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn-cancel-delete {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

/* Tab Commandes */
.no-orders {
  text-align: center;
  padding: 30px;
}

.btn-shop {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  background-color: #f9f9f9;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
}

.order-date {
  color: #666;
}

.order-status {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.order-status.pending {
  background-color: #ffecb3;
  color: #ff9800;
}

.order-status.processing {
  background-color: #e3f2fd;
  color: #2196f3;
}

.order-status.shipped {
  background-color: #e1f5fe;
  color: #03a9f4;
}

.order-status.delivered {
  background-color: #e8f5e9;
  color: #4caf50;
}

.order-status.cancelled {
  background-color: #ffebee;
  color: #f44336;
}

.order-items {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  display: flex;
  gap: 15px;
}

.item-image {
  width: 60px;
  height: 80px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-details h4 {
  margin: 0 0 5px;
  font-size: 1rem;
}

.item-details p {
  margin: 0 0 5px;
  color: #666;
  font-size: 0.9rem;
}

.item-meta {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
}

.order-summary {
  padding: 15px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
}

.summary-item {
  display: flex;
  justify-content: space-between;
}

.total-price {
  font-weight: bold;
  color: #e91e63;
}

.order-actions {
  padding: 15px;
  display: flex;
  gap: 10px;
}

.btn-details,
.btn-reorder {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-details {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.btn-reorder {
  background-color: #3f51b5;
  border: none;
  color: white;
}

@media (max-width: 768px) {
  .profile-tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .tab-button {
    border-bottom: 1px solid #ddd;
    text-align: left;
  }

  .tab-button.active {
    border-left: 3px solid #3f51b5;
    border-bottom-color: #ddd;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 5px;
  }
}

.book-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  color: #6c757d;
  font-size: 1.5rem;
  border-radius: 4px;
}

.book-title-small {
  font-size: 0.7rem;
  margin-top: 5px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 100%;
}

.form-section {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #555;
  font-size: 1.1rem;
}
</style>
