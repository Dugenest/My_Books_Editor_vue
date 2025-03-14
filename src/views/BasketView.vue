<template>
  <div class="basket-container">
    <h1 class="page-title">Mon Panier</h1>

    <div v-if="!items.length" class="empty-basket">
      <i class="fas fa-shopping-cart"></i>
      <p>Votre panier est vide</p>
      <router-link to="/" class="continue-shopping">
        Continuer mes achats
      </router-link>
    </div>

    <div v-else class="basket-content">
      <div class="basket-items">
        <div v-for="item in items" :key="item.id" class="basket-item">
          <div class="item-image">
            <router-link :to="{ name: 'BookDetails', params: { id: item.id } }">
              <img :src="item.coverImage" :alt="item.title" />
            </router-link>
          </div>

          <div class="item-details">
            <div class="item-info">
              <router-link
                :to="{ name: 'BookDetails', params: { id: item.id } }"
                class="item-title"
              >
                {{ item.title }}
              </router-link>
              <p class="item-author">{{ item.author }}</p>
              <p class="item-price">{{ formatPrice(item.price) }} €</p>
            </div>

            <div class="item-actions">
              <div class="quantity-controls">
                <button
                  @click="decrementQuantity(item)"
                  :disabled="item.quantity <= 1"
                  class="quantity-btn"
                >
                  <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="incrementQuantity(item)" class="quantity-btn">
                  <i class="fas fa-plus"></i>
                </button>
              </div>

              <button @click="removeItem(item.id)" class="remove-btn">
                <i class="fas fa-trash"></i>
                Supprimer
              </button>
            </div>

            <div class="item-subtotal">
              <span>Sous-total:</span>
              <span class="subtotal-amount">
                {{ formatPrice(item.price * item.quantity) }} €
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="basket-summary">
        <h2>Récapitulatif</h2>

        <div class="summary-details">
          <div class="summary-line">
            <span>Sous-total</span>
            <span>{{ formatPrice(subtotal) }} €</span>
          </div>
          <div class="summary-line">
            <span>TVA (20%)</span>
            <span>{{ formatPrice(tax) }} €</span>
          </div>
          <div class="summary-line shipping">
            <span>Frais de livraison</span>
            <span>{{
              shipping > 0 ? formatPrice(shipping) + ' €' : 'Gratuit'
            }}</span>
          </div>
          <div class="summary-line total">
            <span>Total</span>
            <span>{{ formatPrice(total) }} €</span>
          </div>
        </div>

        <div class="promo-code">
          <input
            type="text"
            v-model="promoCode"
            placeholder="Code promo"
            :disabled="loading"
          />
          <button
            @click="applyPromoCode"
            :disabled="loading || !promoCode"
            class="apply-promo"
          >
            <span v-if="loading">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            <span v-else>Appliquer</span>
          </button>
        </div>

        <div v-if="promoError" class="promo-error">
          {{ promoError }}
        </div>

        <div v-if="activePromo" class="active-promo">
          <div class="promo-info">
            <span>{{ activePromo.code }}</span>
            <span>-{{ activePromo.discount }}%</span>
          </div>
          <button @click="removePromo" class="remove-promo">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <button
          @click="proceedToCheckout"
          class="checkout-btn"
          :disabled="loading"
        >
          Procéder au paiement
        </button>

        <router-link to="/" class="continue-shopping-link">
          <i class="fas fa-arrow-left"></i>
          Continuer mes achats
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

export default {
  name: 'BasketView',

  setup() {
    const store = useStore();
    const router = useRouter();
    const promoCode = ref('');
    const loading = ref(false);
    const promoError = ref('');
    const activePromo = ref(null);

    const items = computed(() => store.state.cart.items);

    const subtotal = computed(() => {
      return items.value.reduce((total, item) => {
        return total + item.price * item.quantity;
      }, 0);
    });

    const tax = computed(() => {
      const taxRate = 0.2; // 20% TVA
      return subtotal.value * taxRate;
    });

    const shipping = computed(() => {
      // Livraison gratuite au-dessus de 35€
      return subtotal.value >= 35 ? 0 : 4.99;
    });

    const total = computed(() => {
      let finalTotal = subtotal.value + tax.value + shipping.value;
      if (activePromo.value) {
        const discount = (finalTotal * activePromo.value.discount) / 100;
        finalTotal -= discount;
      }
      return finalTotal;
    });

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    };

    const incrementQuantity = (item) => {
      store.dispatch('cart/updateQuantity', {
        id: item.id,
        quantity: item.quantity + 1,
      });
    };

    const decrementQuantity = (item) => {
      if (item.quantity > 1) {
        store.dispatch('cart/updateQuantity', {
          id: item.id,
          quantity: item.quantity - 1,
        });
      }
    };

    const removeItem = (itemId) => {
      store.dispatch('cart/removeItem', itemId);
    };

    const applyPromoCode = async () => {
      if (!promoCode.value) return;

      loading.value = true;
      promoError.value = '';

      try {
        const response = await store.dispatch(
          'cart/applyPromoCode',
          promoCode.value
        );
        activePromo.value = response;
        promoCode.value = '';
      } catch (error) {
        promoError.value = error.message || 'Code promo invalide';
      } finally {
        loading.value = false;
      }
    };

    const removePromo = () => {
      activePromo.value = null;
      store.dispatch('cart/removePromoCode');
    };

    const proceedToCheckout = () => {
      if (store.getters['auth/isAuthenticated']) {
        router.push({ name: 'Checkout' });
      } else {
        router.push({
          name: 'Login',
          query: { redirect: 'checkout' },
        });
      }
    };

    return {
      items,
      subtotal,
      tax,
      shipping,
      total,
      promoCode,
      loading,
      promoError,
      activePromo,
      formatPrice,
      incrementQuantity,
      decrementQuantity,
      removeItem,
      applyPromoCode,
      removePromo,
      proceedToCheckout,
    };
  },
};
</script>

<style scoped>
.basket-container {
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

.empty-basket {
  text-align: center;
  padding: 3rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-basket i {
  font-size: 4rem;
  color: #9e9e9e;
  margin-bottom: 1rem;
}

.empty-basket p {
  color: #666;
  margin-bottom: 1.5rem;
}

.basket-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.basket-items {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.basket-item {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.basket-item:last-child {
  border-bottom: none;
}

.item-image img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-title {
  color: #333;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 0.5rem;
  display: block;
}

.item-author {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.item-price {
  color: #3f51b5;
  font-weight: 500;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  min-width: 40px;
  text-align: center;
}

.remove-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #f5f5f5;
  color: #d32f2f;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.remove-btn:hover {
  background-color: #ffebee;
}

.item-subtotal {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.subtotal-amount {
  font-weight: 600;
  color: #333;
}

.basket-summary {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
}

.basket-summary h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.summary-details {
  margin-bottom: 1.5rem;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #666;
}

.summary-line.shipping {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}

.summary-line.total {
  color: #333;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 0.75rem;
}

.promo-code {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.promo-code input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.apply-promo {
  padding: 0 1rem;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.apply-promo:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.promo-error {
  color: #d32f2f;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.active-promo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #e8f5e9;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.promo-info {
  display: flex;
  gap: 0.5rem;
  color: #2e7d32;
  font-weight: 500;
}

.remove-promo {
  background: none;
  border: none;
  color: #2e7d32;
  cursor: pointer;
  padding: 0.25rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 1rem;
}

.checkout-btn:hover:not(:disabled) {
  background-color: #303f9f;
}

.continue-shopping,
.continue-shopping-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #3f51b5;
  text-decoration: none;
  font-weight: 500;
}

.continue-shopping:hover,
.continue-shopping-link:hover {
  text-decoration: underline;
}

@media (max-width: 968px) {
  .basket-content {
    grid-template-columns: 1fr;
  }

  .basket-summary {
    position: static;
  }
}

@media (max-width: 576px) {
  .basket-container {
    padding: 1rem;
  }

  .basket-item {
    grid-template-columns: 1fr;
  }

  .item-image {
    width: 120px;
    margin: 0 auto;
  }

  .item-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .quantity-controls {
    width: 100%;
    justify-content: center;
  }

  .remove-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
