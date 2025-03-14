// store/modules/basket.js
// Module Vuex pour la gestion du panier

const state = {
  items: [],
  initialized: false,
};

const getters = {
  /**
   * Nombre total d'articles dans le panier
   */
  itemCount: (state) => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  },

  /**
   * Prix total du panier
   */
  totalPrice: (state) => {
    return state.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  },

  /**
   * Vérifie si un livre est déjà dans le panier
   */
  isInBasket: (state) => (bookId) => {
    return state.items.some((item) => item.id === bookId);
  },

  /**
   * Récupère la quantité d'un livre dans le panier
   */
  getQuantity: (state) => (bookId) => {
    const item = state.items.find((item) => item.id === bookId);
    return item ? item.quantity : 0;
  },
};

const mutations = {
  /**
   * Initialise le panier depuis le localStorage
   */
  INITIALIZE_BASKET(state) {
    const savedBasket = localStorage.getItem('basket');
    if (savedBasket) {
      state.items = JSON.parse(savedBasket);
    }
    state.initialized = true;
  },

  /**
   * Ajoute un livre au panier
   */
  ADD_ITEM(state, item) {
    const existingItem = state.items.find((i) => i.id === item.id);

    if (existingItem) {
      // Si le livre existe déjà, augmenter la quantité
      existingItem.quantity += item.quantity || 1;

      // S'assurer que la quantité ne dépasse pas le stock disponible
      if (
        existingItem.stockQuantity &&
        existingItem.quantity > existingItem.stockQuantity
      ) {
        existingItem.quantity = existingItem.stockQuantity;
      }
    } else {
      // Sinon, ajouter le nouvel article
      state.items.push({
        ...item,
        quantity: item.quantity || 1,
      });
    }

    // Mettre à jour le localStorage
    localStorage.setItem('basket', JSON.stringify(state.items));
  },

  /**
   * Supprime un livre du panier
   */
  REMOVE_ITEM(state, itemId) {
    state.items = state.items.filter((item) => item.id !== itemId);
    localStorage.setItem('basket', JSON.stringify(state.items));
  },

  /**
   * Met à jour la quantité d'un livre dans le panier
   */
  UPDATE_QUANTITY(state, { id, quantity }) {
    const item = state.items.find((item) => item.id === id);

    if (item) {
      item.quantity = quantity;

      // S'assurer que la quantité ne dépasse pas le stock disponible
      if (item.stockQuantity && item.quantity > item.stockQuantity) {
        item.quantity = item.stockQuantity;
      }

      localStorage.setItem('basket', JSON.stringify(state.items));
    }
  },

  /**
   * Vide le panier
   */
  CLEAR_BASKET(state) {
    state.items = [];
    localStorage.removeItem('basket');
  },

  /**
   * Met à jour les stocks après vérification de disponibilité
   */
  UPDATE_STOCK(state, stockUpdates) {
    let hasChanges = false;

    // Pour chaque mise à jour de stock
    stockUpdates.forEach((update) => {
      const item = state.items.find((item) => item.id === update.id);

      if (item) {
        // Mettre à jour le stock disponible
        item.stockQuantity = update.stockQuantity;

        // Ajuster la quantité si nécessaire
        if (item.quantity > item.stockQuantity) {
          item.quantity = item.stockQuantity;
          hasChanges = true;
        }

        // Supprimer l'article si le stock est à 0
        if (item.stockQuantity === 0) {
          state.items = state.items.filter((i) => i.id !== update.id);
          hasChanges = true;
        }
      }
    });

    // Si des changements ont été effectués, mettre à jour le localStorage
    if (hasChanges) {
      localStorage.setItem('basket', JSON.stringify(state.items));
    }
  },

  /**
   * Synchronise le panier avec le panier sauvegardé en base de données (pour les utilisateurs connectés)
   */
  SYNC_BASKET(state, savedBasket) {
    if (savedBasket && savedBasket.length > 0) {
      // Fusionner le panier local avec le panier sauvegardé
      const mergedItems = [...state.items];

      savedBasket.forEach((savedItem) => {
        const existingItemIndex = mergedItems.findIndex(
          (item) => item.id === savedItem.id
        );

        if (existingItemIndex >= 0) {
          // Si l'article existe déjà, prendre la quantité la plus élevée
          mergedItems[existingItemIndex].quantity = Math.max(
            mergedItems[existingItemIndex].quantity,
            savedItem.quantity
          );

          // S'assurer que la quantité ne dépasse pas le stock disponible
          if (
            savedItem.stockQuantity &&
            mergedItems[existingItemIndex].quantity > savedItem.stockQuantity
          ) {
            mergedItems[existingItemIndex].quantity = savedItem.stockQuantity;
          }
        } else {
          // Sinon, ajouter l'article au panier
          mergedItems.push(savedItem);
        }
      });

      state.items = mergedItems;
      localStorage.setItem('basket', JSON.stringify(state.items));
    }
  },
};

const actions = {
  /**
   * Initialise le panier
   */
  initializeBasket({ commit, state, dispatch }) {
    if (!state.initialized) {
      commit('INITIALIZE_BASKET');
      dispatch('verifyStock');
    }
  },

  /**
   * Ajoute un livre au panier
   */
  addItem({ commit, dispatch }, item) {
    commit('ADD_ITEM', item);
    dispatch('saveBasketToServer');
  },

  /**
   * Supprime un livre du panier
   */
  removeItem({ commit, dispatch }, itemId) {
    commit('REMOVE_ITEM', itemId);
    dispatch('saveBasketToServer');
  },

  /**
   * Met à jour la quantité d'un livre dans le panier
   */
  updateItemQuantity({ commit, dispatch }, payload) {
    commit('UPDATE_QUANTITY', payload);
    dispatch('saveBasketToServer');
  },

  /**
   * Vide le panier
   */
  clearBasket({ commit, dispatch }) {
    commit('CLEAR_BASKET');
    dispatch('saveBasketToServer');
  },

  /**
   * Vérifie la disponibilité du stock pour les articles du panier
   */
  async verifyStock({ commit, state }) {
    if (state.items.length === 0) return;

    try {
      // Récupérer les IDs des articles dans le panier
      const bookIds = state.items.map((item) => item.id);

      // Appeler l'API pour vérifier le stock (cette fonction est fictive, à adapter selon votre API)
      const response = await fetch('/api/books/check-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookIds }),
      });

      if (response.ok) {
        const stockData = await response.json();
        commit('UPDATE_STOCK', stockData);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error);
    }
  },

  /**
   * Sauvegarde le panier sur le serveur pour les utilisateurs connectés
   */
  async saveBasketToServer({ state, rootGetters }) {
    // Ne sauvegarder que si l'utilisateur est connecté
    const isAuthenticated = rootGetters['auth/isAuthenticated'];

    if (isAuthenticated && state.items.length > 0) {
      try {
        // Simplifier les données à envoyer
        const basketData = state.items.map((item) => ({
          bookId: item.id,
          quantity: item.quantity,
        }));

        // Appeler l'API pour sauvegarder le panier (cette fonction est fictive, à adapter selon votre API)
        await fetch('/api/user/basket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ items: basketData }),
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du panier:', error);
      }
    }
  },

  /**
   * Récupère le panier sauvegardé sur le serveur lors de la connexion
   */
  async loadSavedBasket({ commit }) {
    try {
      const response = await fetch('/api/user/basket', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const savedBasket = await response.json();
        commit('SYNC_BASKET', savedBasket);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier sauvegardé:', error);
    }
  },

  /**
   * Applique un code promo au panier
   */
  async applyPromoCode(_, promoCode) {
    try {
      const response = await fetch(`/api/promo-codes/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode }),
      });

      if (response.ok) {
        const promoData = await response.json();
        return promoData;
      } else {
        throw new Error('Code promo invalide');
      }
    } catch (error) {
      console.error("Erreur lors de l'application du code promo:", error);
      throw error;
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
