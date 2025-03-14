<template>
  <div class="confirmation-container">
    <div class="confirmation-card" :class="{ error: !success }">
      <div class="confirmation-icon">
        <i :class="success ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
      </div>

      <h1 class="confirmation-title">
        {{ success ? 'Commande confirmée !' : 'Échec de la commande' }}
      </h1>

      <div v-if="success" class="confirmation-content">
        <p class="confirmation-message">
          Merci pour votre commande. Un email de confirmation a été envoyé à
          <strong>{{ user.email }}</strong
          >.
        </p>

        <div class="order-info">
          <div class="info-row">
            <span>Numéro de commande :</span>
            <strong>{{ orderNumber }}</strong>
          </div>
          <div class="info-row">
            <span>Date de commande :</span>
            <strong>{{ formatDate(orderDate) }}</strong>
          </div>
          <div class="info-row">
            <span>Total :</span>
            <strong>{{ formatPrice(orderTotal) }} €</strong>
          </div>
        </div>

        <div class="delivery-info">
          <h2>Livraison prévue</h2>
          <div class="delivery-estimate">
            <i class="fas fa-truck"></i>
            <span>{{ deliveryEstimate }}</span>
          </div>
          <p class="delivery-address">
            {{ shippingAddress.firstName }} {{ shippingAddress.lastName }}<br />
            {{ shippingAddress.address }}<br />
            {{ shippingAddress.postalCode }} {{ shippingAddress.city }}
          </p>
        </div>

        <div class="next-steps">
          <h2>Prochaines étapes</h2>
          <ul class="steps-list">
            <li>
              <i class="fas fa-envelope"></i>
              Vérifiez votre boîte mail pour le récapitulatif
            </li>
            <li>
              <i class="fas fa-truck"></i>
              Suivez votre commande dans votre tableau de bord
            </li>
            <li>
              <i class="fas fa-download"></i>
              Téléchargez votre facture
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="error-content">
        <p class="error-message">
          {{
            errorMessage || 'Une erreur est survenue lors de votre commande.'
          }}
        </p>
        <p class="error-details">
          Pas d'inquiétude, aucun montant n'a été débité de votre compte.
          Veuillez réessayer ou contacter notre service client si le problème
          persiste.
        </p>
      </div>

      <div class="confirmation-actions">
        <button v-if="success" class="btn-primary" @click="goToOrderDetails">
          <i class="fas fa-eye"></i>
          Voir les détails de la commande
        </button>
        <button v-else class="btn-primary" @click="retryOrder">
          <i class="fas fa-redo"></i>
          Réessayer
        </button>
        <button class="btn-secondary" @click="continueShopping">
          <i class="fas fa-shopping-bag"></i>
          Continuer mes achats
        </button>
      </div>

      <div v-if="success" class="support-section">
        <p>
          Une question ? Notre service client est disponible 7j/7 de 9h à 20h
        </p>
        <button class="btn-support">
          <i class="fas fa-headset"></i>
          Contacter le support
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'OrderConfirmationView',

  setup() {
    const store = useStore();
    const route = useRoute();
    const router = useRouter();

    const success = computed(() => route.params.success === 'true');
    const user = computed(() => store.state.auth.user);
    const orderNumber = ref('');
    const orderDate = ref(new Date());
    const orderTotal = ref(0);
    const errorMessage = ref('');
    const shippingAddress = ref({});
    const deliveryEstimate = ref('');

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
      });
    };

    const goToOrderDetails = () => {
      router.push({
        name: 'OrderDetails',
        params: { id: route.params.orderId },
      });
    };

    const continueShopping = () => {
      router.push({ name: 'Home' });
    };

    const retryOrder = () => {
      router.push({ name: 'Checkout' });
    };

    onMounted(async () => {
      if (success.value && route.params.orderId) {
        try {
          const orderData = await store.dispatch(
            'orders/getOrderDetails',
            route.params.orderId
          );
          orderNumber.value = orderData.number;
          orderDate.value = orderData.orderDate;
          orderTotal.value = orderData.total;
          shippingAddress.value = orderData.shippingAddress;
          deliveryEstimate.value = orderData.shippingMethod.deliveryTime;
        } catch (error) {
          console.error('Erreur lors du chargement des détails:', error);
        }
      }
    });

    return {
      success,
      user,
      orderNumber,
      orderDate,
      orderTotal,
      errorMessage,
      shippingAddress,
      deliveryEstimate,
      formatPrice,
      formatDate,
      goToOrderDetails,
      continueShopping,
      retryOrder,
    };
  },
};
</script>

<style scoped>
.confirmation-container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.confirmation-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.confirmation-card.error {
  border-top: 4px solid #d32f2f;
}

.confirmation-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.confirmation-icon i {
  color: #4caf50;
}

.error .confirmation-icon i {
  color: #d32f2f;
}

.confirmation-title {
  font-size: 2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.confirmation-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.order-info {
  background-color: #f5f7ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row strong {
  color: #333;
}

.delivery-info {
  margin-bottom: 2rem;
  text-align: left;
}

.delivery-info h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
}

.delivery-estimate {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4caf50;
  font-weight: 500;
  margin-bottom: 1rem;
}

.delivery-address {
  color: #666;
  line-height: 1.5;
}

.next-steps {
  text-align: left;
  margin-bottom: 2rem;
}

.next-steps h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1rem;
}

.steps-list {
  list-style: none;
  padding: 0;
}

.steps-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.steps-list li i {
  color: #3f51b5;
}

.error-content {
  margin-bottom: 2rem;
}

.error-message {
  font-size: 1.1rem;
  color: #d32f2f;
  margin-bottom: 1rem;
}

.error-details {
  color: #666;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #3f51b5;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #303f9f;
}

.btn-secondary {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.support-section {
  border-top: 1px solid #eee;
  padding-top: 2rem;
  color: #666;
}

.btn-support {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  background-color: white;
  color: #3f51b5;
  border: 1px solid #3f51b5;
  margin: 1rem auto 0;
  transition: all 0.3s;
}

.btn-support:hover {
  background-color: #f5f7ff;
}

@media (max-width: 576px) {
  .confirmation-container {
    padding: 1rem;
  }

  .confirmation-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
