<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Détails de la commande #{{ order.number }}</h2>
        <div class="header-actions">
          <button class="btn-icon" @click="printOrder" title="Imprimer">
            <i class="fas fa-print"></i>
          </button>
          <button class="btn-close" @click="$emit('close')">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <div class="modal-body">
        <div class="order-status-bar">
          <div
            v-for="(stage, index) in orderStages"
            :key="stage.status"
            class="status-stage"
            :class="{
              active: isStageActive(stage.status),
              completed: isStageCompleted(stage.status, index),
            }"
          >
            <div class="stage-icon">
              <i :class="stage.icon"></i>
            </div>
            <div class="stage-info">
              <div class="stage-name">{{ stage.name }}</div>
              <div
                v-if="order.statusHistory && getStatusDate(stage.status)"
                class="stage-date"
              >
                {{ formatDate(getStatusDate(stage.status)) }}
              </div>
            </div>
          </div>
        </div>

        <div class="order-grid">
          <div class="order-info">
            <h3>Informations de commande</h3>
            <div class="info-group">
              <div class="info-row">
                <div class="info-label">Date de commande</div>
                <div class="info-value">{{ formatDate(order.date) }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Statut</div>
                <div class="info-value">
                  <span
                    class="status-badge"
                    :class="order.status.toLowerCase()"
                  >
                    {{ getStatusLabel(order.status) }}
                  </span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">Mode de paiement</div>
                <div class="info-value">{{ order.paymentMethod }}</div>
              </div>
            </div>
          </div>

          <div class="customer-info">
            <h3>Informations client</h3>
            <div class="info-group">
              <div class="info-row">
                <div class="info-label">Nom</div>
                <div class="info-value">{{ order.customer.name }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Email</div>
                <div class="info-value">{{ order.customer.email }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Téléphone</div>
                <div class="info-value">
                  {{ order.customer.phone || 'Non renseigné' }}
                </div>
              </div>
            </div>
          </div>

          <div class="shipping-info">
            <h3>Adresse de livraison</h3>
            <div class="info-group">
              <div class="info-row">
                <div class="info-label">Destinataire</div>
                <div class="info-value">{{ order.shipping.name }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Adresse</div>
                <div class="info-value">{{ order.shipping.address }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Ville</div>
                <div class="info-value">
                  {{ order.shipping.postalCode }} {{ order.shipping.city }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">Pays</div>
                <div class="info-value">{{ order.shipping.country }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Mode de livraison</div>
                <div class="info-value">{{ order.shipping.method }}</div>
              </div>
            </div>
          </div>

          <div class="billing-info" v-if="order.billing">
            <h3>Adresse de facturation</h3>
            <div class="info-group">
              <div class="info-row">
                <div class="info-label">Destinataire</div>
                <div class="info-value">{{ order.billing.name }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Adresse</div>
                <div class="info-value">{{ order.billing.address }}</div>
              </div>
              <div class="info-row">
                <div class="info-label">Ville</div>
                <div class="info-value">
                  {{ order.billing.postalCode }} {{ order.billing.city }}
                </div>
              </div>
              <div class="info-row">
                <div class="info-label">Pays</div>
                <div class="info-value">{{ order.billing.country }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="order-items">
          <h3>Articles commandés</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Prix unitaire</th>
                <th>Quantité</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in order.items" :key="item.id">
                <td>
                  <div class="product-info">
                    <img
                      :src="item.coverImage"
                      :alt="item.title"
                      class="product-thumbnail"
                    />
                    <div>
                      <div class="product-title">{{ item.title }}</div>
                      <div class="product-author">{{ item.author }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ formatPrice(item.price) }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatPrice(item.price * item.quantity) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="order-summary">
          <div class="summary-row">
            <div>Sous-total</div>
            <div>{{ formatPrice(order.subtotal) }}</div>
          </div>
          <div class="summary-row">
            <div>Frais de livraison</div>
            <div>{{ formatPrice(order.shippingCost) }}</div>
          </div>
          <div class="summary-row" v-if="order.discount">
            <div>Réduction</div>
            <div>-{{ formatPrice(order.discount) }}</div>
          </div>
          <div class="summary-row" v-if="order.tax">
            <div>TVA ({{ order.taxRate }}%)</div>
            <div>{{ formatPrice(order.tax) }}</div>
          </div>
          <div class="summary-row total">
            <div>Total</div>
            <div>{{ formatPrice(order.total) }}</div>
          </div>
        </div>

        <div class="order-actions">
          <h3>Mettre à jour le statut</h3>
          <div class="status-update">
            <select v-model="currentStatus" class="status-select">
              <option value="PENDING">En attente</option>
              <option value="PROCESSING">En traitement</option>
              <option value="SHIPPED">Expédiée</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
            <button
              class="btn-primary"
              @click="updateStatus"
              :disabled="currentStatus === order.status"
            >
              Mettre à jour
            </button>
          </div>
        </div>

        <div class="order-notes" v-if="order.notes && order.notes.length">
          <h3>Notes</h3>
          <div class="notes-list">
            <div
              v-for="(note, index) in order.notes"
              :key="index"
              class="note-item"
            >
              <div class="note-header">
                <div class="note-author">{{ note.author }}</div>
                <div class="note-date">{{ formatDate(note.date) }}</div>
              </div>
              <div class="note-content">{{ note.text }}</div>
            </div>
          </div>
        </div>

        <div class="add-note">
          <h3>Ajouter une note</h3>
          <textarea
            v-model="newNote"
            rows="3"
            placeholder="Ajouter une note concernant cette commande..."
          ></textarea>
          <button
            class="btn-primary"
            @click="addNote"
            :disabled="!newNote.trim()"
          >
            Ajouter la note
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'OrderDetailsModal',

  props: {
    order: {
      type: Object,
      required: true,
    },
  },

  emits: ['close', 'status-updated', 'note-added'],

  setup(props, { emit }) {
    const currentStatus = ref('');
    const newNote = ref('');

    onMounted(() => {
      currentStatus.value = props.order.status;
    });

    const orderStages = [
      { status: 'PENDING', name: 'En attente', icon: 'fas fa-clock' },
      { status: 'PROCESSING', name: 'En traitement', icon: 'fas fa-cogs' },
      { status: 'SHIPPED', name: 'Expédiée', icon: 'fas fa-truck' },
      { status: 'DELIVERED', name: 'Livrée', icon: 'fas fa-check-circle' },
    ];

    const isStageActive = (status) => {
      return status === props.order.status;
    };

    const isStageCompleted = (status) => {
      const statusOrder = {
        PENDING: 0,
        PROCESSING: 1,
        SHIPPED: 2,
        DELIVERED: 3,
        CANCELLED: -1,
      };

      // En cas d'annulation, aucune étape n'est considérée comme complétée
      if (props.order.status === 'CANCELLED') {
        return false;
      }

      return statusOrder[props.order.status] > statusOrder[status];
    };

    const getStatusDate = (status) => {
      if (!props.order.statusHistory) return null;

      const statusEntry = props.order.statusHistory.find(
        (entry) => entry.status === status
      );
      return statusEntry ? statusEntry.date : null;
    };

    const formatDate = (date) => {
      if (!date) return '';

      return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const formatPrice = (price) => {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
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

    const updateStatus = async () => {
      try {
        // Simulation d'appel API
        // En production, on appellerait un service ou une API pour mettre à jour le statut
        // await orderService.updateStatus(props.order.id, currentStatus.value);

        console.log('Statut mis à jour:', currentStatus.value);

        // Simuler un délai pour l'enregistrement
        await new Promise((resolve) => setTimeout(resolve, 500));

        emit('status-updated', {
          orderId: props.order.id,
          status: currentStatus.value,
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        // Gérer les erreurs (afficher un message, etc.)
      }
    };

    const addNote = async () => {
      if (!newNote.value.trim()) return;

      try {
        const note = {
          text: newNote.value.trim(),
          author: 'Administrateur', // À remplacer par le nom de l'utilisateur connecté
          date: new Date().toISOString(),
        };

        // Simulation d'appel API
        // En production, on appellerait un service ou une API pour ajouter une note
        // await orderService.addNote(props.order.id, note);

        console.log('Note ajoutée:', note);

        // Simuler un délai pour l'enregistrement
        await new Promise((resolve) => setTimeout(resolve, 500));

        emit('note-added', {
          orderId: props.order.id,
          note,
        });

        // Réinitialiser le champ de note
        newNote.value = '';
      } catch (error) {
        console.error("Erreur lors de l'ajout de la note:", error);
        // Gérer les erreurs (afficher un message, etc.)
      }
    };

    const printOrder = () => {
      // Ouvrir une fenêtre d'impression
      window.print();
    };

    return {
      currentStatus,
      newNote,
      orderStages,
      isStageActive,
      isStageCompleted,
      getStatusDate,
      formatDate,
      formatPrice,
      getStatusLabel,
      updateStatus,
      addNote,
      printOrder,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-icon,
.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.3s;
}

.btn-icon:hover,
.btn-close:hover {
  background-color: #f5f5f5;
}

.modal-body {
  padding: 1.5rem;
}

.order-status-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  position: relative;
}

.order-status-bar::before {
  content: '';
  position: absolute;
  top: 25px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ddd;
  z-index: 1;
}

.status-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.stage-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  color: #666;
}

.status-stage.active .stage-icon {
  border-color: #1a237e;
}

.stage-info {
  text-align: center;
}

.stage-name {
  font-weight: bold;
}

.stage-date {
  font-size: 0.875rem;
  color: #666;
}

.order-grid {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.order-info,
.customer-info,
.shipping-info,
.billing-info {
  flex: 1;
}

.order-info h3,
.customer-info h3,
.shipping-info h3,
.billing-info h3 {
  margin-bottom: 1rem;
}

.info-group {
  margin-bottom: 1rem;
}

.info-row {
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: bold;
}

.info-value {
  margin-left: 1rem;
}

.order-items {
  margin-bottom: 2rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th,
.items-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.items-table th {
  background-color: #f5f5f5;
}

.order-summary {
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.order-actions {
  margin-bottom: 2rem;
}

.status-update {
  display: flex;
  gap: 0.75rem;
}

.status-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #333;
}

.order-notes {
  margin-bottom: 2rem;
}

.notes-list {
  margin-bottom: 1rem;
}

.note-item {
  margin-bottom: 0.5rem;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.note-author {
  font-weight: bold;
}

.note-date {
  font-size: 0.875rem;
  color: #666;
}

.note-content {
  margin-left: 1rem;
}

.add-note {
  margin-bottom: 2rem;
}

.add-note h3 {
  margin-bottom: 0.5rem;
}

.textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 0.5rem;
}

.btn-primary {
  padding: 0.5rem 1rem;
  background-color: #1a237e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #333;
}
</style>
