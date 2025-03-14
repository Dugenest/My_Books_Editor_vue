<!-- SettingsSection.vue - Composant des paramètres -->
<template>
  <section class="settings-section">
    <div class="section-header">
      <h2>Paramètres</h2>
    </div>

    <div class="settings-grid">
      <!-- Paramètres généraux -->
      <div class="settings-card">
        <h3>Paramètres généraux</h3>
        <form @submit.prevent="$emit('save-general')">
          <div class="form-group">
            <label>Nom de la librairie</label>
            <input type="text" v-model="localSettings.storeName" />
          </div>
          <div class="form-group">
            <label>Email de contact</label>
            <input type="email" v-model="localSettings.contactEmail" />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input type="tel" v-model="localSettings.phone" />
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <textarea v-model="localSettings.address" rows="3"></textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="btn-primary">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

      <!-- Paramètres de livraison -->
      <div class="settings-card">
        <h3>Paramètres de livraison</h3>
        <form @submit.prevent="$emit('save-shipping')">
          <div class="form-group">
            <label>Frais de livraison standard</label>
            <input
              type="number"
              v-model="localSettings.standardShipping"
              step="0.01"
            />
          </div>
          <div class="form-group">
            <label>Frais de livraison express</label>
            <input
              type="number"
              v-model="localSettings.expressShipping"
              step="0.01"
            />
          </div>
          <div class="form-group">
            <label>Montant minimum pour la livraison gratuite</label>
            <input
              type="number"
              v-model="localSettings.freeShippingThreshold"
              step="0.01"
            />
          </div>
          <div class="form-group">
            <button type="submit" class="btn-primary">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>

      <!-- Paramètres des emails -->
      <div class="settings-card">
        <h3>Paramètres des emails</h3>
        <form @submit.prevent="$emit('save-email')">
          <div class="form-group">
            <label>Serveur SMTP</label>
            <input type="text" v-model="localSettings.smtpServer" required />
          </div>
          <div class="form-group">
            <label>Port SMTP</label>
            <input type="number" v-model="localSettings.smtpPort" required />
          </div>
          <div class="form-group">
            <label>Utilisateur SMTP</label>
            <input type="text" v-model="localSettings.smtpUser" />
          </div>
          <div class="form-group">
            <label>Mot de passe SMTP</label>
            <input type="password" v-model="localSettings.smtpPassword" />
          </div>
          <div class="form-group">
            <button type="submit" class="btn-primary">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, watch } from 'vue';

export default {
  name: 'SettingsSection',

  props: {
    settings: {
      type: Object,
      required: true,
    },
  },

  emits: ['save-general', 'save-shipping', 'save-email'],

  setup(props) {
    // Créer une copie locale des paramètres pour éviter de modifier directement les props
    const localSettings = ref({ ...props.settings });

    // Mettre à jour les paramètres locaux lorsque les props changent
    watch(
      () => props.settings,
      (newSettings) => {
        localSettings.value = { ...newSettings };
      }
    );

    return {
      localSettings,
    };
  },
};
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  color: #333;
  margin: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.settings-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.settings-card h3 {
  font-size: 1.25rem;
  color: #333;
  margin: 0 0 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.btn-primary {
  background-color: #1a237e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #303f9f;
}

@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
