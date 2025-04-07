<template>
  <div class="profile-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Chargement du profil...</span>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserProfile" class="retry-button">Réessayer</button>
    </div>

    <div v-else class="profile-content">
      <!-- En-tête du profil -->
      <div class="profile-header">
        <div class="profile-avatar">
          <AvatarUpload
            :userId="user.id"
            :currentAvatar="user.avatar"
            :immediateUpload="true"
            @update="handleAvatarUpdate"
            @error="handleAvatarError"
          />
        </div>
        <div class="profile-info">
          <h1>{{ user.firstName }} {{ user.lastName }}</h1>
          <p class="user-email">{{ user.email }}</p>
          <p
            v-if="user.role"
            class="user-role"
            :class="getRoleClass(user.role)"
          >
            {{ formatRole(user.role) }}
          </p>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="profile-section">
        <h2>Informations personnelles</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Prénom</label>
            <p v-if="!editMode">{{ user.firstName }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.firstName"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Nom</label>
            <p v-if="!editMode">{{ user.lastName }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.lastName"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Email</label>
            <p v-if="!editMode">{{ user.email }}</p>
            <input
              v-else
              type="email"
              v-model="editedUser.email"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Nom d'utilisateur</label>
            <p v-if="!editMode">{{ user.username }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.username"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Téléphone</label>
            <p v-if="!editMode">{{ user.phone || 'Non renseigné' }}</p>
            <input
              v-else
              type="tel"
              v-model="editedUser.phone"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Date d'inscription</label>
            <p>{{ getRegistrationDate() }}</p>
          </div>
          <div class="info-item">
            <label>Nationalité</label>
            <p v-if="!editMode">{{ user.nationality || 'Non renseignée' }}</p>
            <input
              v-else
              type="text"
              v-model="editedUser.nationality"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Date de naissance</label>
            <p v-if="!editMode">
              {{
                user.birthDate ? formatDate(user.birthDate) : 'Non renseignée'
              }}
            </p>
            <input
              v-else
              type="date"
              v-model="editedUser.birthDate"
              class="edit-input"
            />
          </div>
        </div>
        <div class="edit-buttons">
          <button v-if="!editMode" @click="startEdit" class="edit-btn">
            <i class="fas fa-edit"></i> Modifier mes informations
          </button>
          <div v-else class="action-buttons">
            <button @click="saveChanges" class="save-btn" :disabled="saving">
              <i class="fas fa-save"></i>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            <button @click="cancelEdit" class="cancel-btn">
              <i class="fas fa-times"></i> Annuler
            </button>
          </div>
        </div>
      </div>

      <!-- Adresse -->
      <div class="profile-section">
        <h2>Adresse</h2>
        <div class="info-grid">
          <div class="info-item full-width">
            <label>Adresse complète</label>
            <p v-if="!editMode">
              {{ user.address || 'Non renseignée' }}
            </p>
            <textarea
              v-else
              v-model="editedUser.address"
              class="edit-input address-textarea"
              placeholder="Exemple: 7 rue charles saint, 80630, Beauval, France"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Mot de passe -->
      <div v-if="editMode" class="profile-section">
        <h2>Changer le mot de passe</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Mot de passe actuel</label>
            <input
              type="password"
              v-model="passwordData.current"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              v-model="passwordData.new"
              class="edit-input"
            />
          </div>
          <div class="info-item">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              v-model="passwordData.confirm"
              class="edit-input"
            />
          </div>
        </div>
        <div v-if="passwordError" class="password-error">
          {{ passwordError }}
        </div>
        <div class="password-info">
          <i class="fas fa-info-circle"></i>
          Laissez ces champs vides si vous ne souhaitez pas changer votre mot de
          passe
        </div>
      </div>

      <!-- Préférences -->
      <div class="profile-section">
        <h2>Préférences</h2>
        <div class="info-grid">
          <div class="info-item full-width checkbox-item">
            <input
              type="checkbox"
              id="newsletter"
              v-model="editedUser.subscribedToNewsletter"
              :disabled="!editMode"
            />
            <label for="newsletter">Recevoir la newsletter</label>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div class="profile-section">
        <h2>Statistiques</h2>
        <div v-if="loadingStats" class="loading-stats">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Chargement des statistiques...</span>
        </div>
        <div v-else-if="statsError" class="stats-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ statsError }}</p>
          <button @click="fetchUserStats" class="retry-button-small">
            Réessayer
          </button>
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <i class="fas fa-book"></i>
            <div class="stat-info">
              <span class="stat-value">{{ userStats.totalBooks || 0 }}</span>
              <span class="stat-label">Livres</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-star"></i>
            <div class="stat-info">
              <span class="stat-value">{{ userStats.totalReviews || 0 }}</span>
              <span class="stat-label">Avis</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-heart"></i>
            <div class="stat-info">
              <span class="stat-value">{{
                userStats.watchlistCount || 0
              }}</span>
              <span class="stat-label">Liste d'envies</span>
            </div>
          </div>
          <div class="stat-card" v-if="userStats.averageRating">
            <i class="fas fa-star-half-alt"></i>
            <div class="stat-info">
              <span class="stat-value">{{
                formatRating(userStats.averageRating)
              }}</span>
              <span class="stat-label">Note moyenne</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dernières commandes -->
      <div class="profile-section">
        <h2>Dernières commandes</h2>
        <div v-if="loadingOrders" class="loading-stats">
          <i class="fas fa-spinner fa-spin"></i>
          <span>Chargement des commandes...</span>
        </div>
        <div v-else-if="ordersError" class="stats-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{{ ordersError }}</p>
          <button @click="fetchUserOrders" class="retry-button-small">
            Réessayer
          </button>
        </div>
        <div v-else-if="userOrders.length === 0" class="no-orders">
          <i class="fas fa-shopping-bag"></i>
          <p>Aucune commande pour le moment</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="order in userOrders" :key="order.id" class="order-card">
            <div class="order-header">
              <div class="order-info">
                <span class="order-number">Commande #{{ order.id }}</span>
                <span class="order-date">{{
                  formatDate(order.createdAt)
                }}</span>
              </div>
              <span :class="['order-status', order.status.toLowerCase()]">
                {{ order.status }}
              </span>
            </div>
            <div class="order-items">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-item"
              >
                <div class="item-image">
                  <img
                    v-if="item.book.picture"
                    :src="item.book.picture"
                    :alt="item.book.title"
                  />
                  <div v-else class="item-placeholder">
                    <i class="fas fa-book"></i>
                  </div>
                </div>
                <div class="item-details">
                  <h3>{{ item.book.title }}</h3>
                  <p class="item-quantity">Quantité: {{ item.quantity }}</p>
                  <p class="item-price">{{ formatPrice(item.price) }}</p>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <div class="order-total">
                <span>Total:</span>
                <span>{{ formatPrice(order.total) }}</span>
              </div>
              <router-link
                :to="{ name: 'OrderDetails', params: { id: order.id } }"
                class="view-order-btn"
              >
                Voir les détails
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <div v-if="notification.show" :class="['notification', notification.type]">
      <i :class="getNotificationIcon()"></i>
      <span>{{ notification.message }}</span>
      <button @click="closeNotification" class="close-btn">&times;</button>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';
import { onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import AvatarUpload from '@/components/AvatarUpload.vue';

export default {
  name: 'ProfileView',
  components: {
    AvatarUpload,
  },

  setup() {
    const store = useStore();
    const user = ref({});
    const userStats = ref({});
    const userOrders = ref([]);
    const loading = ref(true);
    const loadingStats = ref(false);
    const loadingOrders = ref(false);
    const error = ref('');
    const statsError = ref('');
    const ordersError = ref('');
    const editMode = ref(false);
    const saving = ref(false);
    const passwordError = ref('');

    // Données pour le mode édition
    const editedUser = reactive({
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      phone: '',
      address: '',
      nationality: '',
      birthDate: '',
      subscribedToNewsletter: false,
    });

    // Données pour le changement de mot de passe
    const passwordData = reactive({
      current: '',
      new: '',
      confirm: '',
    });

    // Notifications
    const notification = reactive({
      show: false,
      message: '',
      type: 'info',
      timeout: null,
    });

    // Récupérer les informations utilisateur
    const fetchUserProfile = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await api.get('/users/me');
        user.value = response.data;
        console.log('Informations utilisateur:', user.value);

        // Adapter les noms de champs si nécessaire
        if (user.value.first_name && !user.value.firstName) {
          user.value.firstName = user.value.first_name;
        }
        if (user.value.last_name && !user.value.lastName) {
          user.value.lastName = user.value.last_name;
        }
        if (user.value.birth_date && !user.value.birthDate) {
          user.value.birthDate = user.value.birth_date;
        }
        if (user.value.user_id && !user.value.id) {
          user.value.id = user.value.user_id;
        }

        // Charger les statistiques et les commandes
        fetchUserStats();
        fetchUserOrders();
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        error.value =
          'Impossible de charger votre profil. Veuillez réessayer plus tard.';
      } finally {
        loading.value = false;
      }
    };

    // Récupérer les statistiques utilisateur
    const fetchUserStats = async () => {
      if (!user.value.id) return;

      loadingStats.value = true;
      statsError.value = '';

      try {
        const statsResponse = await api.get(`/users/${user.value.id}/stats`);
        userStats.value = statsResponse.data;
        console.log('Statistiques utilisateur:', userStats.value);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        statsError.value = 'Impossible de charger vos statistiques';

        // En cas d'erreur 404, on utilise des statistiques vides sans montrer d'erreur
        if (err.response && err.response.status === 404) {
          userStats.value = {
            totalBooks: 0,
            totalReviews: 0,
            watchlistCount: 0,
          };
          statsError.value = '';
        }
      } finally {
        loadingStats.value = false;
      }
    };

    // Récupérer les commandes de l'utilisateur
    const fetchUserOrders = async () => {
      if (!user.value.id) return;

      loadingOrders.value = true;
      ordersError.value = '';

      try {
        // On gère le cas où le service OrderService n'existe pas
        try {
          const ordersResponse = await api.get(`/orders/user/${user.value.id}`);
          userOrders.value =
            ordersResponse.data.content || ordersResponse.data || [];
        } catch (orderErr) {
          console.warn(
            'Erreur lors du chargement des commandes, possible endpoint manquant:',
            orderErr
          );
          userOrders.value = [];
        }
      } catch (err) {
        console.error('Erreur lors du chargement des commandes:', err);
        ordersError.value = 'Impossible de charger vos commandes';
      } finally {
        loadingOrders.value = false;
      }
    };

    // Commencer l'édition du profil
    const startEdit = () => {
      editedUser.firstName = user.value.firstName || '';
      editedUser.lastName = user.value.lastName || '';
      editedUser.email = user.value.email || '';
      editedUser.username = user.value.username || '';
      editedUser.phone = user.value.phone || '';
      editedUser.address = user.value.address || '';
      editedUser.nationality = user.value.nationality || '';
      editedUser.birthDate = user.value.birthDate || '';
      editedUser.subscribedToNewsletter =
        user.value.subscribedToNewsletter || false;

      passwordData.current = '';
      passwordData.new = '';
      passwordData.confirm = '';
      passwordError.value = '';

      editMode.value = true;
    };

    // Sauvegarder les modifications
    const saveChanges = async () => {
      saving.value = true;
      passwordError.value = '';

      // Validation des champs requis
      if (
        !editedUser.firstName ||
        !editedUser.lastName ||
        !editedUser.email ||
        !editedUser.username
      ) {
        showNotification(
          'Veuillez remplir tous les champs obligatoires',
          'error'
        );
        saving.value = false;
        return;
      }

      // Validation des mots de passe si fournis
      if (passwordData.new || passwordData.confirm) {
        if (!passwordData.current) {
          passwordError.value = 'Veuillez saisir votre mot de passe actuel';
          saving.value = false;
          return;
        }

        if (passwordData.new !== passwordData.confirm) {
          passwordError.value = 'Les mots de passe ne correspondent pas';
          saving.value = false;
          return;
        }

        if (passwordData.new.length < 8) {
          passwordError.value =
            'Le mot de passe doit contenir au moins 8 caractères';
          saving.value = false;
          return;
        }
      }

      try {
        // Préparation des données utilisateur pour le backend
        const userData = {
          // Champs standard
          firstName: editedUser.firstName,
          lastName: editedUser.lastName,
          email: editedUser.email,
          username: editedUser.username,
          phone: editedUser.phone || '',
          address: editedUser.address || '',

          // Pour compatibilité avec les deux formats de noms
          first_name: editedUser.firstName,
          last_name: editedUser.lastName,

          // Champs spécifiques pour nationality et birthDate
          nationality: editedUser.nationality || null,
          birthDate: editedUser.birthDate
            ? new Date(editedUser.birthDate).getTime()
            : null,
          birth_date: editedUser.birthDate
            ? new Date(editedUser.birthDate).getTime()
            : null,

          // Préférences
          subscribedToNewsletter: editedUser.subscribedToNewsletter,
          subscribed_to_newsletter: editedUser.subscribedToNewsletter,
        };

        // Ajouter le mot de passe si modifié
        if (passwordData.new) {
          userData.password = passwordData.new;
          // Pour compatibilité
          userData.currentPassword = passwordData.current;
          userData.newPassword = passwordData.new;
          userData.current_password = passwordData.current;
        }

        console.log('Données à envoyer:', userData);

        // Envoyer les modifications
        const response = await api.put(`/users/${user.value.id}`, userData);

        // Mettre à jour les données locales
        user.value = response.data;

        // Adapter les noms de champs si nécessaire après mise à jour
        if (user.value.first_name && !user.value.firstName) {
          user.value.firstName = user.value.first_name;
        }
        if (user.value.last_name && !user.value.lastName) {
          user.value.lastName = user.value.last_name;
        }
        if (user.value.birth_date && !user.value.birthDate) {
          user.value.birthDate = user.value.birth_date;
        }

        // Mettre à jour les informations dans le localStorage
        if (user.value.email && user.value.firstName) {
          localStorage.setItem('user_info', JSON.stringify(user.value));
        }

        // Mettre à jour le store Vuex si disponible
        if (store && store.commit) {
          try {
            store.commit('auth/SET_USER', user.value);
          } catch (storeErr) {
            console.warn(
              'Impossible de mettre à jour le store Vuex:',
              storeErr
            );
          }
        }

        // Quitter le mode édition
        editMode.value = false;

        // Afficher un message de succès
        showNotification(
          'Vos informations ont été mises à jour avec succès',
          'success'
        );
      } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err);

        if (err.response && err.response.status === 401) {
          passwordError.value = 'Mot de passe actuel incorrect';
        } else {
          const errorMessage =
            err.response && err.response.data && err.response.data.message
              ? err.response.data.message
              : 'Une erreur est survenue lors de la mise à jour de vos informations';

          showNotification(errorMessage, 'error');
        }
      } finally {
        saving.value = false;
      }
    };

    // Annuler l'édition
    const cancelEdit = () => {
      editMode.value = false;
      passwordError.value = '';
    };

    // Formater une date
    const formatDate = (date) => {
      if (!date) return 'Non disponible';

      try {
        return new Date(date).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch (error) {
        console.error('Erreur de formatage de date:', error);
        return 'Date invalide';
      }
    };

    // Formater un prix
    const formatPrice = (price) => {
      if (price === undefined || price === null) return '0,00 €';

      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    // Formater une note
    const formatRating = (rating) => {
      if (rating === undefined || rating === null) return '0.0';
      return rating.toFixed(1);
    };

    // Obtenir la date d'inscription
    const getRegistrationDate = () => {
      if (user.value.registrationDate) {
        return formatDate(user.value.registrationDate);
      } else if (user.value.registration_date) {
        return formatDate(user.value.registration_date);
      } else if (user.value.createdAt) {
        return formatDate(user.value.createdAt);
      } else {
        return 'Non disponible';
      }
    };

    // Formater le rôle utilisateur
    const formatRole = (role) => {
      if (!role) return 'Utilisateur';

      const roles = {
        USER: 'Utilisateur',
        ADMIN: 'Administrateur',
        MODERATOR: 'Modérateur',
        ROLE_USER: 'Utilisateur',
        ROLE_ADMIN: 'Administrateur',
        ROLE_MODERATOR: 'Modérateur',
      };

      return roles[role.toUpperCase()] || role;
    };

    // Obtenir la classe CSS selon le rôle
    const getRoleClass = (role) => {
      if (!role) return 'role-user';

      const roleClasses = {
        USER: 'role-user',
        ADMIN: 'role-admin',
        MODERATOR: 'role-moderator',
        ROLE_USER: 'role-user',
        ROLE_ADMIN: 'role-admin',
        ROLE_MODERATOR: 'role-moderator',
      };

      return roleClasses[role.toUpperCase()] || 'role-user';
    };

    // Afficher une notification
    const showNotification = (message, type = 'info') => {
      notification.message = message;
      notification.type = type;
      notification.show = true;

      // Nettoyer le timeout précédent s'il existe
      if (notification.timeout) {
        clearTimeout(notification.timeout);
      }

      // Masquer automatiquement après 5 secondes
      notification.timeout = setTimeout(() => {
        notification.show = false;
      }, 5000);
    };

    // Fermer la notification
    const closeNotification = () => {
      notification.show = false;
      if (notification.timeout) {
        clearTimeout(notification.timeout);
      }
    };

    // Obtenir l'icône de notification selon le type
    const getNotificationIcon = () => {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
      };

      return icons[notification.type] || icons.info;
    };

    // Gérer la mise à jour de l'avatar
    const handleAvatarUpdate = (updatedUser) => {
      user.value = { ...user.value, ...updatedUser };
      showNotification('Votre avatar a été mis à jour avec succès', 'success');
    };

    // Gérer les erreurs d'avatar
    const handleAvatarError = (error) => {
      showNotification(error, 'error');
    };

    // Initialiser le composant
    onMounted(fetchUserProfile);

    return {
      user,
      userStats,
      userOrders,
      loading,
      loadingStats,
      loadingOrders,
      error,
      statsError,
      ordersError,
      editMode,
      editedUser,
      saving,
      passwordData,
      passwordError,
      notification,
      fetchUserProfile,
      fetchUserStats,
      fetchUserOrders,
      formatDate,
      formatPrice,
      formatRating,
      formatRole,
      getRoleClass,
      startEdit,
      saveChanges,
      cancelEdit,
      getRegistrationDate,
      showNotification,
      closeNotification,
      getNotificationIcon,
      handleAvatarUpdate,
      handleAvatarError,
    };
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
  position: relative;
}

.loading-state,
.error-state,
.loading-stats {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-stats {
  padding: 1rem;
}

.loading-state i,
.error-state i,
.loading-stats i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.loading-stats i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.error-state {
  color: #d32f2f;
}

.retry-button,
.retry-button-small {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.retry-button:hover,
.retry-button-small:hover {
  background-color: #303f9f;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar {
  font-size: 4rem;
  color: #3f51b5;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f5f5f5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-avatar :deep(.avatar-preview) {
  width: 100%;
  height: 100%;
  margin: 0;
}

.profile-avatar :deep(.avatar-image) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar :deep(.avatar-overlay) {
  background-color: rgba(0, 0, 0, 0.6);
}

.profile-avatar :deep(.avatar-overlay span) {
  font-size: 0.8rem;
}

.profile-avatar :deep(.avatar-actions) {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.profile-info h1 {
  margin: 0;
  font-size: 2rem;
  color: #333;
}

.user-email {
  margin: 0.5rem 0 0;
  color: #666;
}

.user-role {
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-user {
  background-color: #e8f5e9;
  color: #388e3c;
}

.role-admin {
  background-color: #e3f2fd;
  color: #1976d2;
}

.role-moderator {
  background-color: #fff3e0;
  color: #f57c00;
}

.profile-section {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-section h2 {
  margin: 0 0 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item label {
  display: block;
  color: #666;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.info-item p {
  margin: 0;
  color: #333;
  font-size: 1rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checkbox-item input {
  margin: 0;
}

.checkbox-item label {
  margin-bottom: 0;
  font-size: 1rem;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 2rem;
  color: #3f51b5;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.stats-error {
  text-align: center;
  padding: 1rem;
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
}

.no-orders {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.no-orders i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
}

.order-info {
  display: flex;
  flex-direction: column;
}

.order-number {
  font-weight: bold;
  color: #333;
}

.order-date {
  font-size: 0.9rem;
  color: #666;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.order-status.pending {
  background-color: #fff3e0;
  color: #f57c00;
}

.order-status.processing {
  background-color: #e3f2fd;
  color: #1976d2;
}

.order-status.completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.order-status.cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-items {
  padding: 1rem;
}

.order-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #666;
}

.item-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: #333;
}

.item-quantity {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.item-price {
  margin: 0.5rem 0 0;
  font-weight: 500;
  color: #3f51b5;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f5f5f5;
}

.order-total {
  font-weight: bold;
  color: #333;
}

.view-order-btn {
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.view-order-btn:hover {
  background-color: #303f9f;
}

.edit-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-btn:hover {
  background-color: #303f9f;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.save-btn,
.cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.save-btn {
  background-color: #4caf50;
  color: white;
}

.save-btn:hover {
  background-color: #388e3c;
}

.save-btn:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
}

.cancel-btn:hover {
  background-color: #d32f2f;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.edit-buttons {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
}

.address-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.full-width {
  grid-column: 1 / -1;
}

.password-error {
  color: #d32f2f;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.password-info {
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.password-info i {
  color: #3f51b5;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  background-color: #e8f5e9;
  color: #388e3c;
  border-left: 4px solid #4caf50;
}

.notification.error {
  background-color: #ffebee;
  color: #d32f2f;
  border-left: 4px solid #f44336;
}

.notification.warning {
  background-color: #fff3e0;
  color: #f57c00;
  border-left: 4px solid #ff9800;
}

.notification.info {
  background-color: #e3f2fd;
  color: #1976d2;
  border-left: 4px solid #2196f3;
}

.notification i {
  font-size: 1.5rem;
}

.close-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
    padding-top: 60px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .profile-section {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .order-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .notification {
    left: 20px;
    right: 20px;
    max-width: none;
  }
}
</style>
