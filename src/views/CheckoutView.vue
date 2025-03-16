<template>
  <div class="checkout-container">
    <h1 class="page-title">Finalisation de la commande</h1>

    <div class="checkout-content">
      <div class="checkout-form">
        <div class="steps-progress">
          <div
            v-for="(step, index) in steps"
            :key="step.id"
            class="step"
            :class="{
              active: currentStep === index,
              completed: index < currentStep,
            }"
          >
            <div class="step-number">
              <i v-if="index < currentStep" class="fas fa-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>

        <!-- Étape 1: Adresse de livraison -->
        <div v-if="currentStep === 0" class="step-content">
          <h2>Adresse de livraison</h2>
          <form @submit.prevent="nextStep" class="address-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  v-model="shippingAddress.firstName"
                  required
                />
              </div>
              <div class="form-group">
                <label for="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  v-model="shippingAddress.lastName"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="address">Adresse</label>
              <input
                type="text"
                id="address"
                v-model="shippingAddress.address"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="postalCode">Code postal</label>
                <input
                  type="text"
                  id="postalCode"
                  v-model="shippingAddress.postalCode"
                  required
                  pattern="[0-9]{5}"
                />
              </div>
              <div class="form-group">
                <label for="city">Ville</label>
                <input
                  type="text"
                  id="city"
                  v-model="shippingAddress.city"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                v-model="shippingAddress.phone"
                required
              />
            </div>

            <div class="form-actions">
              <router-link to="/basket" class="btn-secondary">
                Retour au panier
              </router-link>
              <button type="submit" class="btn-primary">Continuer</button>
            </div>
          </form>
        </div>

        <!-- Étape 2: Mode de livraison -->
        <div v-if="currentStep === 1" class="step-content">
          <h2>Mode de livraison</h2>
          <div class="shipping-options">
            <div
              v-for="option in shippingOptions"
              :key="option.id"
              class="shipping-option"
              :class="{ selected: selectedShipping === option.id }"
              @click="selectShipping(option)"
            >
              <div class="option-content">
                <div class="option-header">
                  <h3>{{ option.name }}</h3>
                  <span class="option-price">
                    {{
                      option.price > 0
                        ? formatPrice(option.price) + ' €'
                        : 'Gratuit'
                    }}
                  </span>
                </div>
                <p class="option-description">{{ option.description }}</p>
                <p class="delivery-time">
                  <i class="fas fa-clock"></i>
                  {{ option.deliveryTime }}
                </p>
              </div>
              <div class="option-select">
                <div class="radio-button">
                  <div class="radio-inner"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button @click="previousStep" class="btn-secondary">Retour</button>
            <button
              @click="nextStep"
              class="btn-primary"
              :disabled="!selectedShipping"
            >
              Continuer
            </button>
          </div>
        </div>

        <!-- Étape 3: Paiement -->
        <div v-if="currentStep === 2" class="step-content">
          <h2>Paiement</h2>
          <div class="payment-methods">
            <div
              v-for="method in paymentMethods"
              :key="method.id"
              class="payment-method"
              :class="{ selected: selectedPayment === method.id }"
              @click="selectPayment(method)"
            >
              <div class="method-content">
                <img
                  :src="method.icon"
                  :alt="method.name"
                  class="method-icon"
                />
                <span class="method-name">{{ method.name }}</span>
              </div>
              <div class="method-select">
                <div class="radio-button">
                  <div class="radio-inner"></div>
                </div>
              </div>
            </div>
          </div>

          <form
            v-if="selectedPayment === 'card'"
            @submit.prevent="processPayment"
            class="card-form"
          >
            <div class="form-row">
              <div class="form-group">
                <label for="cardNumber">Numéro de carte</label>
                <input
                  type="text"
                  id="cardNumber"
                  v-model="paymentDetails.cardNumber"
                  required
                  pattern="[0-9]{16}"
                  maxlength="16"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="expiryDate">Date d'expiration</label>
                <input
                  type="text"
                  id="expiryDate"
                  v-model="paymentDetails.expiryDate"
                  required
                  pattern="(0[1-9]|1[0-2])\/[0-9]{2}"
                  placeholder="MM/YY"
                />
              </div>
              <div class="form-group">
                <label for="cvv">CVV</label>
                <input
                  type="text"
                  id="cvv"
                  v-model="paymentDetails.cvv"
                  required
                  pattern="[0-9]{3,4}"
                  maxlength="4"
                />
              </div>
            </div>
          </form>

          <div class="form-actions">
            <button @click="previousStep" class="btn-secondary">Retour</button>
            <button
              @click="processPayment"
              class="btn-primary"
              :disabled="!selectedPayment || loading"
            >
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin"></i> Traitement...
              </span>
              <span v-else> Payer {{ formatPrice(total) }} € </span>
            </button>
          </div>
        </div>
      </div>

      <div class="order-summary">
        <h2>Récapitulatif</h2>

        <div class="summary-items">
          <div v-for="item in items" :key="item.id" class="summary-item">
            <img
              :src="item.coverImage"
              :alt="item.title"
              class="item-thumbnail"
            />
            <div class="item-info">
              <span class="item-title">{{ item.title }}</span>
              <span class="item-quantity">Quantité: {{ item.quantity }}</span>
            </div>
            <span class="item-price"
              >{{ formatPrice(item.price * item.quantity) }} €</span
            >
          </div>
        </div>

        <div class="summary-details">
          <div class="summary-line">
            <span>Sous-total</span>
            <span>{{ formatPrice(subtotal) }} €</span>
          </div>
          <div class="summary-line">
            <span>TVA (20%)</span>
            <span>{{ formatPrice(tax) }} €</span>
          </div>
          <div class="summary-line">
            <span>Livraison</span>
            <span>{{ formatPrice(shippingCost) }} €</span>
          </div>
          <div v-if="discount" class="summary-line discount">
            <span>Réduction</span>
            <span>-{{ formatPrice(discount) }} €</span>
          </div>
          <div class="summary-line total">
            <span>Total</span>
            <span>{{ formatPrice(total) }} €</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'CheckoutView',

  setup() {
    const store = useStore();
    const router = useRouter();
    const currentStep = ref(0);
    const loading = ref(false);

    const steps = [
      { id: 'shipping', label: 'Livraison' },
      { id: 'delivery', label: 'Mode de livraison' },
      { id: 'payment', label: 'Paiement' },
    ];

    const shippingAddress = ref({
      firstName: '',
      lastName: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
    });

    const shippingOptions = [
      {
        id: 'standard',
        name: 'Livraison standard',
        price: 4.99,
        description: 'Livraison à domicile',
        deliveryTime: '3-5 jours ouvrés',
      },
      {
        id: 'express',
        name: 'Livraison express',
        price: 9.99,
        description: 'Livraison à domicile',
        deliveryTime: '1-2 jours ouvrés',
      },
      {
        id: 'pickup',
        name: 'Point relais',
        price: 0,
        description: 'Retrait en point relais',
        deliveryTime: '3-5 jours ouvrés',
      },
    ];

    const selectedShipping = ref('');

    const paymentMethods = [
      {
        id: 'card',
        name: 'Carte bancaire',
        icon: '/images/payment/card.png',
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: '/images/payment/paypal.png',
      },
    ];

    const selectedPayment = ref('');
    const paymentDetails = ref({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });

    const items = computed(() => store.state.cart.items);
    const subtotal = computed(() => {
      return items.value.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    });

    const tax = computed(() => subtotal.value * 0.2);
    const shippingCost = computed(() => {
      const option = shippingOptions.find(
        (opt) => opt.id === selectedShipping.value
      );
      return option ? option.price : 0;
    });

    const discount = computed(() => {
      const promo = store.state.cart.activePromo;
      return promo ? (subtotal.value * promo.discount) / 100 : 0;
    });

    const total = computed(() => {
      return subtotal.value + tax.value + shippingCost.value - discount.value;
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };

    const nextStep = () => {
      if (currentStep.value < steps.length - 1) {
        currentStep.value++;
      }
    };

    const previousStep = () => {
      if (currentStep.value > 0) {
        currentStep.value--;
      }
    };

    const selectShipping = (option) => {
      selectedShipping.value = option.id;
    };

    const selectPayment = (method) => {
      selectedPayment.value = method.id;
    };

    const processPayment = async () => {
      loading.value = true;

      try {
        await store.dispatch('orders/createOrder', {
          items: items.value,
          shippingAddress: shippingAddress.value,
          shippingMethod: selectedShipping.value,
          paymentMethod: selectedPayment.value,
          paymentDetails: paymentDetails.value,
          total: total.value,
        });

        // Vider le panier après la commande
        await store.dispatch('cart/clearCart');

        // Rediriger vers la page de confirmation
        router.push({
          name: 'OrderConfirmation',
          params: { success: true },
        });
      } catch (error) {
        console.error('Erreur lors du paiement:', error);
        router.push({
          name: 'OrderConfirmation',
          params: { success: false },
        });
      } finally {
        loading.value = false;
      }
    };

    return {
      currentStep,
      steps,
      shippingAddress,
      shippingOptions,
      selectedShipping,
      paymentMethods,
      selectedPayment,
      paymentDetails,
      items,
      subtotal,
      tax,
      shippingCost,
      discount,
      total,
      loading,
      formatPrice,
      nextStep,
      previousStep,
      selectShipping,
      selectPayment,
      processPayment,
    };
  },
};
</script>

<style scoped>
.checkout-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.checkout-form {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.steps-progress {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.steps-progress::before {
  content: '';
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  font-weight: 500;
  transition: all 0.3s;
}

.step.active .step-number {
  background-color: #3f51b5;
  border-color: #3f51b5;
  color: white;
}

.step.completed .step-number {
  background-color: #4caf50;
  border-color: #4caf50;
  color: white;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
}

.step.active .step-label {
  color: #3f51b5;
  font-weight: 500;
}

.step-content {
  margin-top: 2rem;
}

.step-content h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #3f51b5;
  outline: none;
}

.shipping-options,
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.shipping-option,
.payment-method {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shipping-option:hover,
.payment-method:hover {
  border-color: #3f51b5;
}

.shipping-option.selected,
.payment-method.selected {
  border-color: #3f51b5;
  background-color: #f5f7ff;
}

.option-content,
.method-content {
  flex: 1;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-header h3 {
  font-size: 1rem;
  margin: 0;
}

.option-price {
  font-weight: 500;
  color: #3f51b5;
}

.option-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.delivery-time {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-button {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.selected .radio-button {
  border-color: #3f51b5;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: transparent;
  transition: all 0.3s;
}

.selected .radio-inner {
  background-color: #3f51b5;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.method-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
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

.btn-primary:hover:not(:disabled) {
  background-color: #303f9f;
}

.btn-primary:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
  text-decoration: none;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.order-summary {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
}

.order-summary h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.summary-items {
  margin-bottom: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.summary-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
}

.summary-item:last-child {
  border-bottom: none;
}

.item-thumbnail {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 500;
}

.item-quantity {
  color: #666;
  font-size: 0.85rem;
}

.item-price {
  color: #333;
  font-weight: 500;
}

.summary-details {
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #666;
  font-size: 0.9rem;
}

.summary-line.discount {
  color: #4caf50;
}

.summary-line.total {
  color: #333;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.75rem;
  border-top: 1px solid #eee;
  padding-top: 0.75rem;
}

@media (max-width: 968px) {
  .checkout-content {
    grid-template-columns: 1fr;
  }

  .order-summary {
    position: static;
  }
}

@media (max-width: 576px) {
  .checkout-container {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .steps-progress {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .steps-progress::before {
    display: none;
  }

  .step {
    flex-direction: row;
    gap: 1rem;
  }

  .step-number {
    margin-bottom: 0;
  }
}
</style>
