<template>
  <div class="order-details-container">
    <div class="order-details-header">
      <router-link to="/dashboard" class="back-link">
        <i class="fas fa-arrow-left"></i>
        Retour au tableau de bord
      </router-link>
      <h1>Détails de la commande #{{ order.number }}</h1>
    </div>

    <div class="order-details-content" v-if="order">
      <div class="order-info-grid">
        <div class="info-card">
          <h2>Statut de la commande</h2>
          <div class="status-badge" :class="order.status.toLowerCase()">
            {{ order.status }}
          </div>
          <div class="order-dates">
            <p>
              <strong>Date de commande :</strong>
              {{ formatDate(order.orderDate) }}
            </p>
            <p v-if="order.deliveryDate">
              <strong>Date de livraison estimée :</strong>
              {{ formatDate(order.deliveryDate) }}
            </p>
          </div>
        </div>

        <div class="info-card">
          <h2>Adresse de livraison</h2>
          <div class="address-details">
            <p>
              {{ order.shippingAddress.firstName }}
              {{ order.shippingAddress.lastName }}
            </p>
            <p>{{ order.shippingAddress.address }}</p>
            <p>
              {{ order.shippingAddress.postalCode }}
              {{ order.shippingAddress.city }}
            </p>
            <p>{{ order.shippingAddress.phone }}</p>
          </div>
        </div>

        <div class="info-card">
          <h2>Mode de livraison</h2>
          <div class="shipping-details">
            <p class="shipping-method">{{ order.shippingMethod.name }}</p>
            <p class="shipping-price">
              {{
                order.shippingMethod.price > 0
                  ? `${formatPrice(order.shippingMethod.price)} €`
                  : 'Gratuit'
              }}
            </p>
            <p class="delivery-time">{{ order.shippingMethod.deliveryTime }}</p>
          </div>
        </div>

        <div class="info-card">
          <h2>Paiement</h2>
          <div class="payment-details">
            <p class="payment-method">
              <i :class="getPaymentIcon(order.paymentMethod)"></i>
              {{ getPaymentLabel(order.paymentMethod) }}
            </p>
            <p
              class="payment-status"
              :class="order.paymentStatus.toLowerCase()"
            >
              {{ getPaymentStatusLabel(order.paymentStatus) }}
            </p>
          </div>
        </div>
      </div>

      <div class="order-items-section">
        <h2>Articles commandés</h2>
        <div class="order-items-list">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-item-card"
          >
            <img :src="item.coverImage" :alt="item.title" class="item-image" />
            <div class="item-details">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-author">{{ item.author }}</p>
              <div class="item-meta">
                <span class="item-quantity"
                  >Quantité : {{ item.quantity }}</span
                >
                <span class="item-price">{{ formatPrice(item.price) }} €</span>
              </div>
            </div>
            <div class="item-total">
              {{ formatPrice(item.price * item.quantity) }} €
            </div>
          </div>
        </div>

        <div class="order-summary">
          <div class="summary-line">
            <span>Sous-total</span>
            <span>{{ formatPrice(order.subtotal) }} €</span>
          </div>
          <div class="summary-line">
            <span>TVA (20%)</span>
            <span>{{ formatPrice(order.tax) }} €</span>
          </div>
          <div class="summary-line">
            <span>Frais de livraison</span>
            <span>{{ formatPrice(order.shippingCost) }} €</span>
          </div>
          <div v-if="order.discount" class="summary-line discount">
            <span>Réduction</span>
            <span>-{{ formatPrice(order.discount) }} €</span>
          </div>
          <div class="summary-line total">
            <span>Total</span>
            <span>{{ formatPrice(order.total) }} €</span>
          </div>
        </div>
      </div>

      <div class="tracking-section" v-if="order.tracking">
        <h2>Suivi de commande</h2>
        <div class="tracking-timeline">
          <div
            v-for="(step, index) in order.tracking.steps"
            :key="index"
            class="tracking-step"
            :class="{
              completed: step.completed,
              current: step.current,
            }"
          >
            <div class="step-icon">
              <i :class="step.icon"></i>
            </div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
              <span class="step-date">{{ formatDate(step.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="actions-section">
        <button
          v-if="canCancelOrder"
          @click="cancelOrder"
          class="btn-cancel"
          :disabled="loading"
        >
          <i class="fas fa-times"></i>
          Annuler la commande
        </button>
        <button class="btn-invoice">
          <i class="fas fa-file-pdf"></i>
          Télécharger la facture
        </button>
        <button class="btn-support">
          <i class="fas fa-headset"></i>
          Contacter le support
        </button>
      </div>
    </div>

    <div v-else-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      Chargement des détails de la commande...
    </div>

    <div v-else class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>Impossible de charger les détails de la commande.</p>
      <button @click="fetchOrderDetails" class="btn-retry">Réessayer</button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

export default {
  name: 'OrderDetailsView',

  setup() {
    const store = useStore();
    const route = useRoute();
    const loading = ref(false);
    const order = ref(null);

    const canCancelOrder = computed(() => {
      if (!order.value) return false;
      return (
        order.value.status === 'PENDING' &&
        !order.value.tracking?.steps.some((step) => step.completed)
      );
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const getPaymentIcon = (method) => {
      const icons = {
        card: 'fas fa-credit-card',
        paypal: 'fab fa-paypal',
      };
      return icons[method] || 'fas fa-money-bill';
    };

    const getPaymentLabel = (method) => {
      const labels = {
        card: 'Carte bancaire',
        paypal: 'PayPal',
      };
      return labels[method] || method;
    };

    const getPaymentStatusLabel = (status) => {
      const labels = {
        PENDING: 'En attente',
        COMPLETED: 'Payé',
        FAILED: 'Échec',
        REFUNDED: 'Remboursé',
      };
      return labels[status] || status;
    };

    const fetchOrderDetails = async () => {
      loading.value = true;
      try {
        const orderId = route.params.id;
        const orderData = await store.dispatch(
          'orders/getOrderDetails',
          orderId
        );
        order.value = orderData;
      } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
      } finally {
        loading.value = false;
      }
    };

    const cancelOrder = async () => {
      if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

      loading.value = true;
      try {
        await store.dispatch('orders/cancelOrder', order.value.id);
        await fetchOrderDetails();
      } catch (error) {
        console.error("Erreur lors de l'annulation de la commande:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchOrderDetails);

    return {
      order,
      loading,
      canCancelOrder,
      formatPrice,
      formatDate,
      getPaymentIcon,
      getPaymentLabel,
      getPaymentStatusLabel,
      cancelOrder,
      fetchOrderDetails,
    };
  },
};
</script>

<style scoped>
.order-details-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.order-details-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  text-decoration: none;
  margin-bottom: 1rem;
  transition: color 0.3s;
}

.back-link:hover {
  color: #3f51b5;
}

.order-details-header h1 {
  color: #333;
  font-size: 2rem;
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.info-card h2 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 1rem;
}

.status-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 16px;
  font-weight: 500;
  margin-bottom: 1rem;
}

.status-badge.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-badge.cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-dates p {
  color: #666;
  margin-bottom: 0.5rem;
}

.address-details p {
  color: #666;
  margin-bottom: 0.5rem;
}

.shipping-details {
  color: #666;
}

.shipping-method {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
}

.shipping-price {
  color: #3f51b5;
  margin-bottom: 0.5rem;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.payment-status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: inline-block;
}

.payment-status.completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.payment-status.pending {
  background-color: #fff3e0;
  color: #e65100;
}

.payment-status.failed {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-items-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.order-items-section h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item-card {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1.5rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.item-image {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.item-author {
  color: #666;
  margin-bottom: 0.5rem;
}

.item-meta {
  display: flex;
  gap: 1rem;
  color: #666;
}

.item-total {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.order-summary {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #666;
}

.summary-line.discount {
  color: #4caf50;
}

.summary-line.total {
  color: #333;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #eee;
}

.tracking-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
}

.tracking-section h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.tracking-timeline {
  position: relative;
  padding-left: 2rem;
}

.tracking-timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: #e0e0e0;
}

.tracking-step {
  position: relative;
  padding-bottom: 2rem;
}

.tracking-step:last-child {
  padding-bottom: 0;
}

.step-icon {
  position: absolute;
  left: -2.5rem;
  width: 32px;
  height: 32px;
  background-color: white;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.tracking-step.completed .step-icon {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

.tracking-step.current .step-icon {
  background-color: #3f51b5;
  border-color: #3f51b5;
  color: white;
}

.step-content {
  padding-left: 1rem;
}

.step-content h3 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 0.25rem;
}

.step-content p {
  color: #666;
  margin-bottom: 0.25rem;
}

.step-date {
  font-size: 0.85rem;
  color: #666;
}

.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-invoice,
.btn-support {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background-color: #ffebee;
  color: #d32f2f;
  border: none;
}

.btn-cancel:hover:not(:disabled) {
  background-color: #ffcdd2;
}

.btn-cancel:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-invoice {
  background-color: #3f51b5;
  color: white;
  border: none;
}

.btn-invoice:hover {
  background-color: #303f9f;
}

.btn-support {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-support:hover {
  background-color: #f5f5f5;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem;
  color: #666;
}

.loading-state i,
.error-state i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #3f51b5;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-retry:hover {
  background-color: #303f9f;
}

@media (max-width: 768px) {
  .order-item-card {
    grid-template-columns: 80px 1fr;
  }

  .item-total {
    grid-column: 1 / -1;
    text-align: right;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-invoice,
  .btn-support {
    width: 100%;
    justify-content: center;
  }
}
</style>
