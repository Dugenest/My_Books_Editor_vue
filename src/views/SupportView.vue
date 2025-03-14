<template>
  <div class="support-container">
    <div class="support-header">
      <h1>Support Client</h1>
      <p class="support-subtitle">
        Notre équipe est là pour vous aider 7j/7 de 9h à 20h
      </p>
    </div>

    <div class="support-content">
      <div class="contact-methods">
        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-comments"></i>
          </div>
          <h2>Chat en direct</h2>
          <p>Discutez en temps réel avec un conseiller</p>
          <button class="btn-contact" @click="startChat">
            <i class="fas fa-comment"></i>
            Démarrer le chat
          </button>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-envelope"></i>
          </div>
          <h2>Email</h2>
          <p>Réponse sous 24h ouvrées</p>
          <button class="btn-contact" @click="showEmailForm = true">
            <i class="fas fa-paper-plane"></i>
            Envoyer un email
          </button>
        </div>

        <div class="contact-card">
          <div class="contact-icon">
            <i class="fas fa-phone"></i>
          </div>
          <h2>Téléphone</h2>
          <p>Du lundi au dimanche, 9h-20h</p>
          <a href="tel:0123456789" class="btn-contact">
            <i class="fas fa-phone-alt"></i>
            01 23 45 67 89
          </a>
        </div>
      </div>

      <div class="faq-section">
        <h2>Questions fréquentes</h2>
        <div class="faq-list">
          <div
            v-for="(faq, index) in faqs"
            :key="index"
            class="faq-item"
            :class="{ active: faq.isOpen }"
          >
            <div class="faq-question" @click="toggleFaq(index)">
              <span>{{ faq.question }}</span>
              <i :class="faq.isOpen ? 'fas fa-minus' : 'fas fa-plus'"></i>
            </div>
            <div v-show="faq.isOpen" class="faq-answer">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Formulaire de contact par email -->
      <div v-if="showEmailForm" class="email-form-overlay">
        <div class="email-form-modal">
          <button class="close-modal" @click="showEmailForm = false">
            <i class="fas fa-times"></i>
          </button>

          <h2>Contactez-nous</h2>
          <form @submit.prevent="submitEmailForm" class="contact-form">
            <div class="form-group">
              <label for="subject">Sujet</label>
              <select id="subject" v-model="emailForm.subject" required>
                <option value="">Sélectionnez un sujet</option>
                <option value="order">Question sur ma commande</option>
                <option value="delivery">Problème de livraison</option>
                <option value="product">Question sur un produit</option>
                <option value="technical">Problème technique</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div v-if="emailForm.subject === 'order'" class="form-group">
              <label for="orderNumber">Numéro de commande</label>
              <input
                type="text"
                id="orderNumber"
                v-model="emailForm.orderNumber"
                placeholder="Ex: CMD-12345"
              />
            </div>

            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                v-model="emailForm.message"
                rows="6"
                required
                placeholder="Décrivez votre problème en détail..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="attachments">Pièces jointes</label>
              <div class="file-upload">
                <input
                  type="file"
                  id="attachments"
                  multiple
                  @change="handleFileUpload"
                  accept="image/*,.pdf"
                />
                <div class="upload-placeholder">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <span
                    >Glissez vos fichiers ici ou cliquez pour sélectionner</span
                  >
                </div>
              </div>
              <div v-if="emailForm.files.length" class="file-list">
                <div
                  v-for="(file, index) in emailForm.files"
                  :key="index"
                  class="file-item"
                >
                  <span>{{ file.name }}</span>
                  <button
                    type="button"
                    class="remove-file"
                    @click="removeFile(index)"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="button"
                class="btn-secondary"
                @click="showEmailForm = false"
              >
                Annuler
              </button>
              <button type="submit" class="btn-primary" :disabled="loading">
                <span v-if="loading">
                  <i class="fas fa-spinner fa-spin"></i>
                  Envoi en cours...
                </span>
                <span v-else>
                  <i class="fas fa-paper-plane"></i>
                  Envoyer
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Chat widget -->
      <div v-if="showChat" class="chat-widget">
        <div class="chat-header">
          <h3>Chat avec le support</h3>
          <button class="close-chat" @click="closeChat">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="chat-messages" ref="chatMessages">
          <div
            v-for="(message, index) in chatMessages"
            :key="index"
            :class="['message', message.type]"
          >
            <div class="message-content">
              {{ message.text }}
            </div>
            <div class="message-time">
              {{ formatMessageTime(message.timestamp) }}
            </div>
          </div>
        </div>

        <div class="chat-input">
          <textarea
            v-model="newMessage"
            @keyup.enter.prevent="sendMessage"
            placeholder="Tapez votre message..."
            rows="1"
          ></textarea>
          <button @click="sendMessage" :disabled="!newMessage.trim()">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick } from 'vue';

export default {
  name: 'SupportView',

  setup() {
    const showEmailForm = ref(false);
    const showChat = ref(false);
    const loading = ref(false);
    const chatMessages = ref([]);
    const newMessage = ref('');

    const emailForm = ref({
      subject: '',
      orderNumber: '',
      message: '',
      files: [],
    });

    const faqs = ref([
      {
        question: 'Comment suivre ma commande ?',
        answer:
          'Vous pouvez suivre votre commande dans votre tableau de bord, section "Mes commandes". Vous y trouverez toutes les informations de suivi en temps réel.',
        isOpen: false,
      },
      {
        question: 'Quels sont les délais de livraison ?',
        answer:
          'Les délais varient selon le mode de livraison choisi : 3-5 jours ouvrés en standard, 1-2 jours en express, et 3-5 jours en point relais.',
        isOpen: false,
      },
      {
        question: 'Comment retourner un article ?',
        answer:
          'Vous disposez de 14 jours pour retourner un article. Rendez-vous dans votre espace client, section "Mes commandes", et suivez la procédure de retour.',
        isOpen: false,
      },
      {
        question: 'Comment annuler une commande ?',
        answer:
          "Vous pouvez annuler une commande tant qu'elle n'a pas été expédiée. Contactez-nous rapidement par téléphone pour toute annulation.",
        isOpen: false,
      },
    ]);

    const toggleFaq = (index) => {
      faqs.value[index].isOpen = !faqs.value[index].isOpen;
    };

    const handleFileUpload = (event) => {
      const files = Array.from(event.target.files);
      emailForm.value.files = [...emailForm.value.files, ...files];
    };

    const removeFile = (index) => {
      emailForm.value.files.splice(index, 1);
    };

    const submitEmailForm = async () => {
      loading.value = true;
      try {
        // Simuler l'envoi du formulaire
        await new Promise((resolve) => setTimeout(resolve, 2000));
        showEmailForm.value = false;
        emailForm.value = {
          subject: '',
          orderNumber: '',
          message: '',
          files: [],
        };
        // Afficher une notification de succès
      } catch (error) {
        console.error("Erreur lors de l'envoi:", error);
      } finally {
        loading.value = false;
      }
    };

    const startChat = () => {
      showChat.value = true;
      // Ajouter un message de bienvenue
      chatMessages.value.push({
        type: 'system',
        text: 'Bienvenue dans notre chat support ! Un conseiller va vous répondre dans quelques instants.',
        timestamp: new Date(),
      });
    };

    const closeChat = () => {
      showChat.value = false;
      chatMessages.value = [];
      newMessage.value = '';
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      // Ajouter le message de l'utilisateur
      chatMessages.value.push({
        type: 'user',
        text: newMessage.value,
        timestamp: new Date(),
      });

      newMessage.value = '';

      // Simuler une réponse automatique
      setTimeout(() => {
        chatMessages.value.push({
          type: 'agent',
          text: 'Un conseiller va vous répondre dans quelques instants...',
          timestamp: new Date(),
        });
      }, 1000);

      // Faire défiler jusqu'au dernier message
      await nextTick();
      const chatMessagesEl = document.querySelector('.chat-messages');
      if (chatMessagesEl) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      }
    };

    const formatMessageTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return {
      showEmailForm,
      showChat,
      loading,
      emailForm,
      faqs,
      chatMessages,
      newMessage,
      toggleFaq,
      handleFileUpload,
      removeFile,
      submitEmailForm,
      startChat,
      closeChat,
      sendMessage,
      formatMessageTime,
    };
  },
};
</script>

<style scoped>
.support-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.support-header {
  text-align: center;
  margin-bottom: 3rem;
}

.support-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.support-subtitle {
  color: #666;
  font-size: 1.1rem;
}

.contact-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.contact-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s;
}

.contact-card:hover {
  transform: translateY(-5px);
}

.contact-icon {
  width: 64px;
  height: 64px;
  background-color: #f5f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.contact-icon i {
  font-size: 1.5rem;
  color: #3f51b5;
}

.contact-card h2 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.contact-card p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-contact {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
}

.btn-contact:hover {
  background-color: #303f9f;
}

.faq-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.faq-section h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.faq-item {
  border-bottom: 1px solid #eee;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  cursor: pointer;
  color: #333;
  font-weight: 500;
}

.faq-question i {
  color: #666;
  transition: transform 0.3s;
}

.faq-item.active .faq-question i {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 0 1rem;
  color: #666;
  line-height: 1.5;
}

.email-form-overlay {
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

.email-form-modal {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
}

.contact-form {
  margin-top: 1rem;
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
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.file-upload {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  position: relative;
}

.file-upload input[type='file'] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  color: #666;
}

.upload-placeholder i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #3f51b5;
}

.file-list {
  margin-top: 1rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.remove-file {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  padding: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background-color: #3f51b5;
  color: white;
  border: none;
}

.btn-primary:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: white;
  color: #666;
  border: 1px solid #ddd;
}

.chat-widget {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 350px;
  height: 500px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.chat-header {
  padding: 1rem;
  background-color: #3f51b5;
  color: white;
  border-radius: 8px 8px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-chat {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.message {
  margin-bottom: 1rem;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.agent {
  margin-right: auto;
}

.message.system {
  margin: 1rem auto;
  text-align: center;
  color: #666;
  font-style: italic;
}

.message-content {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f5f5f5;
}

.message.user .message-content {
  background-color: #3f51b5;
  color: white;
}

.message-time {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
  text-align: right;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 0.5rem;
}

.chat-input textarea {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 1rem;
}

.chat-input button {
  padding: 0.75rem;
  background-color: #3f51b5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.chat-input button:disabled {
  background-color: #9fa8da;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .support-container {
    padding: 1rem;
  }

  .chat-widget {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .email-form-modal {
    width: 100%;
    height: 100%;
    max-height: none;
    border-radius: 0;
  }
}
</style>
