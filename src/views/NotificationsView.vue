<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <h1>Mes Notifications</h1>
      <div class="header-actions">
        <button class="btn-mark-all" @click="markAllAsRead" v-if="hasUnread">
          <i class="fas fa-check-double"></i>
          Tout marquer comme lu
        </button>
        <div class="filter-dropdown">
          <select v-model="filter" class="filter-select">
            <option value="all">Toutes les notifications</option>
            <option value="unread">Non lues</option>
            <option value="orders">Commandes</option>
            <option value="promotions">Promotions</option>
            <option value="system">Système</option>
          </select>
        </div>
      </div>
    </div>

    <div class="notifications-content">
      <div v-if="loading" class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        Chargement des notifications...
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>Aucune notification {{ filter !== 'all' ? 'de ce type' : '' }}</p>
      </div>

      <div v-else class="notifications-list">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          class="notification-item"
          :class="{
            unread: !notification.read,
            [notification.type]: true,
          }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h3>{{ notification.title }}</h3>
              <span class="notification-time">
                {{ formatNotificationDate(notification.date) }}
              </span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>

            <div v-if="notification.action" class="notification-action">
              <button
                class="btn-action"
                @click.stop="handleAction(notification.action)"
              >
                {{ notification.action.label }}
              </button>
            </div>

            <div v-if="notification.type === 'order'" class="order-preview">
              <div class="order-info">
                <span class="order-number">
                  Commande #{{ notification.data.orderNumber }}
                </span>
                <span class="order-status" :class="notification.data.status">
                  {{ getOrderStatus(notification.data.status) }}
                </span>
              </div>
              <div v-if="notification.data.items" class="order-items">
                <img
                  v-for="item in notification.data.items.slice(0, 3)"
                  :key="item.id"
                  :src="item.coverImage"
                  :alt="item.title"
                  class="item-thumbnail"
                />
                <span
                  v-if="notification.data.items.length > 3"
                  class="more-items"
                >
                  +{{ notification.data.items.length - 3 }}
                </span>
              </div>
            </div>

            <div v-if="notification.type === 'promotion'" class="promo-preview">
              <div class="promo-banner">
                <img
                  :src="notification.data.image"
                  :alt="notification.data.title"
                  class="promo-image"
                />
                <div class="promo-info">
                  <span class="promo-discount">
                    -{{ notification.data.discount }}%
                  </span>
                  <span class="promo-expiry">
                    Expire le {{ formatDate(notification.data.expiryDate) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="notification-actions">
            <button
              class="btn-mark"
              @click.stop="toggleRead(notification)"
              :title="
                notification.read ? 'Marquer comme non lu' : 'Marquer comme lu'
              "
            >
              <i
                :class="
                  notification.read ? 'far fa-envelope-open' : 'far fa-envelope'
                "
              ></i>
            </button>
            <button
              class="btn-delete"
              @click.stop="deleteNotification(notification.id)"
              title="Supprimer"
            >
              <i class="far fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <button class="btn-load-more" @click="loadMore" :disabled="loadingMore">
          <span v-if="loadingMore">
            <i class="fas fa-spinner fa-spin"></i>
            Chargement...
          </span>
          <span v-else> Charger plus de notifications </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'NotificationsView',

  setup() {
    const store = useStore();
    const router = useRouter();
    const loading = ref(true);
    const loadingMore = ref(false);
    const filter = ref('all');
    const page = ref(1);
    const hasMore = ref(true);

    const notifications = computed(() => store.state.notifications.items);
    const hasUnread = computed(() =>
      notifications.value.some((notification) => !notification.read)
    );

    const filteredNotifications = computed(() => {
      let filtered = [...notifications.value];

      switch (filter.value) {
        case 'unread':
          filtered = filtered.filter((n) => !n.read);
          break;
        case 'orders':
          filtered = filtered.filter((n) => n.type === 'order');
          break;
        case 'promotions':
          filtered = filtered.filter((n) => n.type === 'promotion');
          break;
        case 'system':
          filtered = filtered.filter((n) => n.type === 'system');
          break;
      }

      return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const getNotificationIcon = (type) => {
      const icons = {
        order: 'fas fa-shopping-bag',
        promotion: 'fas fa-tag',
        system: 'fas fa-cog',
        alert: 'fas fa-exclamation-circle',
      };
      return icons[type] || 'fas fa-bell';
    };

    const getOrderStatus = (status) => {
      const statuses = {
        PENDING: 'En attente',
        PROCESSING: 'En traitement',
        SHIPPED: 'Expédié',
        DELIVERED: 'Livré',
        CANCELLED: 'Annulé',
      };
      return statuses[status] || status;
    };

    const formatNotificationDate = (date) => {
      const now = new Date();
      const notifDate = new Date(date);
      const diff = now - notifDate;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(diff / (1000 * 60));

      if (minutes < 60) {
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else if (hours < 24) {
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      } else if (days < 7) {
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
      } else {
        return notifDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    const handleNotificationClick = (notification) => {
      if (!notification.read) {
        toggleRead(notification);
      }

      if (notification.action?.route) {
        router.push(notification.action.route);
      }
    };

    const toggleRead = async (notification) => {
      try {
        await store.dispatch('notifications/toggleRead', notification.id);
      } catch (error) {
        console.error('Erreur lors du marquage de la notification:', error);
      }
    };

    const markAllAsRead = async () => {
      try {
        await store.dispatch('notifications/markAllAsRead');
      } catch (error) {
        console.error('Erreur lors du marquage des notifications:', error);
      }
    };

    const deleteNotification = async (id) => {
      if (!confirm('Voulez-vous vraiment supprimer cette notification ?'))
        return;

      try {
        await store.dispatch('notifications/deleteNotification', id);
      } catch (error) {
        console.error(
          'Erreur lors de la suppression de la notification:',
          error
        );
      }
    };

    const handleAction = (action) => {
      if (action.route) {
        router.push(action.route);
      } else if (action.callback) {
        action.callback();
      }
    };

    const loadMore = async () => {
      if (loadingMore.value) return;

      loadingMore.value = true;
      try {
        const newNotifications = await store.dispatch(
          'notifications/fetchNotifications',
          { page: page.value + 1 }
        );
        if (newNotifications.length < 20) {
          hasMore.value = false;
        }
        page.value++;
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        loadingMore.value = false;
      }
    };

    onMounted(async () => {
      try {
        await store.dispatch('notifications/fetchNotifications', { page: 1 });
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      loading,
      loadingMore,
      filter,
      hasMore,
      notifications,
      filteredNotifications,
      hasUnread,
      getNotificationIcon,
      getOrderStatus,
      formatNotificationDate,
      formatDate,
      handleNotificationClick,
      toggleRead,
      markAllAsRead,
      deleteNotification,
      handleAction,
      loadMore,
    };
  },
};
</script>

<style scoped>
.notifications-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.notifications-header h1 {
  font-size: 2rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-mark-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-mark-all:hover {
  background-color: #e0e0e0;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-state i,
.empty-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #9fa8da;
}

.notification-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  cursor: pointer;
}

.notification-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.notification-item.unread {
  background-color: #f5f7ff;
  border-left: 4px solid #3f51b5;
}

.notification-icon {
  width: 40px;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.notification-item.order .notification-icon {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.notification-item.promotion .notification-icon {
  background-color: #fff3e0;
  color: #e65100;
}

.notification-item.system .notification-icon {
  background-color: #e3f2fd;
  color: #1976d2;
}

.notification-item.alert .notification-icon {
  background-color: #ffebee;
  color: #d32f2f;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-header h3 {
  font-size: 1.1rem;
  color: #333;
  margin: 0;
}

.notification-time {
  font-size: 0.85rem;
  color: #666;
}

.notification-message {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.notification-action {
  margin-top: 1rem;
}

.btn-action {
  padding: 0.5rem 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-action:hover {
  background-color: #303f9f;
}

.order-preview {
  background-color: #f5f5f5;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.order-number {
  font-weight: 500;
  color: #333;
}

.order-status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

.order-status.PENDING {
  background-color: #fff3e0;
  color: #e65100;
}

.order-status.PROCESSING {
  background-color: #e3f2fd;
  color: #1976d2;
}

.order-status.SHIPPED {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.order-status.DELIVERED {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.order-status.CANCELLED {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-items {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.item-thumbnail {
  width: 40px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.more-items {
  background-color: #eee;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #666;
}

.promo-preview {
  margin-top: 1rem;
}

.promo-banner {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.promo-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.promo-info {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-bottom-left-radius: 4px;
}

.promo-discount {
  font-size: 1.2rem;
  font-weight: 600;
  display: block;
}

.promo-expiry {
  font-size: 0.85rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-mark,
.btn-delete {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-mark:hover {
  background-color: #e3f2fd;
  color: #1976d2;
}

.btn-delete:hover {
  background-color: #ffebee;
  color: #d32f2f;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}

.btn-load-more {
  padding: 0.75rem 1.5rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-load-more:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.btn-load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 576px) {
  .notifications-container {
    padding: 1rem;
  }

  .notifications-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .notification-item {
    grid-template-columns: 1fr;
  }

  .notification-icon {
    display: none;
  }

  .notification-actions {
    justify-content: flex-end;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
}
</style>
