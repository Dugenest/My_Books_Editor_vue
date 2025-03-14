<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-column">
          <h3>À propos</h3>
          <p>
            MyBooks est une librairie en ligne spécialisée dans la vente de
            livres dans tous les domaines. Notre mission est de promouvoir la
            lecture et de rendre les livres accessibles à tous.
          </p>
        </div>

        <div class="footer-column">
          <h3>Liens utiles</h3>
          <ul class="footer-links">
            <li><router-link to="/">Accueil</router-link></li>
            <li><router-link to="/categories">Catégories</router-link></li>
            <li><router-link to="/authors">Auteurs</router-link></li>
            <li><router-link to="/new-releases">Nouveautés</router-link></li>
            <li><router-link to="/popular">Populaires</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3>Service client</h3>
          <ul class="footer-links">
            <li><router-link to="/contact">Contact</router-link></li>
            <li><router-link to="/faq">FAQ</router-link></li>
            <li><router-link to="/shipping">Livraison</router-link></li>
            <li><router-link to="/returns">Retours</router-link></li>
            <li><router-link to="/terms">Conditions générales</router-link></li>
          </ul>
        </div>

        <div class="footer-column">
          <h3>Suivez-nous</h3>
          <div class="social-links">
            <a href="#" target="_blank" class="social-link">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" target="_blank" class="social-link">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" target="_blank" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" target="_blank" class="social-link">
              <i class="fab fa-linkedin"></i>
            </a>
          </div>
          <h3>Inscrivez-vous à notre newsletter</h3>
          <div class="newsletter-form">
            <input
              type="email"
              v-model="newsletterEmail"
              placeholder="Votre adresse email"
              :disabled="isSubscribing"
            />
            <button
              @click="subscribeNewsletter"
              class="btn-subscribe"
              :disabled="!isValidEmail || isSubscribing"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
          <p
            v-if="newsletterMessage"
            class="newsletter-message"
            :class="{ success: newsletterSuccess }"
          >
            {{ newsletterMessage }}
          </p>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="payment-methods">
          <span>Paiement sécurisé</span>
          <div class="payment-icons">
            <i class="fab fa-cc-visa"></i>
            <i class="fab fa-cc-mastercard"></i>
            <i class="fab fa-cc-paypal"></i>
            <i class="fab fa-cc-amex"></i>
          </div>
        </div>
        <div class="copyright">
          &copy; {{ currentYear }} MyBooksEditor. Tous droits réservés.
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ref, computed } from 'vue';
import NewsletterService from '@/services/NewsletterService';

export default {
  name: 'AppFooter',

  setup() {
    // États
    const newsletterEmail = ref('');
    const newsletterMessage = ref('');
    const newsletterSuccess = ref(false);
    const isSubscribing = ref(false);

    // Propriétés calculées
    const currentYear = computed(() => new Date().getFullYear());

    const isValidEmail = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(newsletterEmail.value);
    });

    // Méthodes
    const subscribeNewsletter = async () => {
      if (!isValidEmail.value) return;

      isSubscribing.value = true;
      newsletterMessage.value = '';

      try {
        await NewsletterService.subscribe(newsletterEmail.value);
        newsletterMessage.value = 'Merci pour votre inscription!';
        newsletterSuccess.value = true;
        newsletterEmail.value = '';
      } catch (error) {
        console.error("Erreur lors de l'inscription à la newsletter:", error);
        newsletterMessage.value =
          'Une erreur est survenue. Veuillez réessayer.';
        newsletterSuccess.value = false;
      } finally {
        isSubscribing.value = false;
      }
    };

    return {
      newsletterEmail,
      newsletterMessage,
      newsletterSuccess,
      isSubscribing,
      currentYear,
      isValidEmail,
      subscribeNewsletter,
    };
  },
};
</script>

<style scoped>
.app-footer {
  background-color: #1a237e;
  color: white;
  padding: 50px 0 20px;
  margin-top: 50px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Footer Top avec colonnes */
.footer-top {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.footer-column h3 {
  color: white;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.footer-column p {
  margin-top: 0;
  line-height: 1.6;
  color: #c5cae9;
}

/* Liens dans le footer */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #c5cae9;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: white;
}

/* Icônes sociales */
.social-links {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: background-color 0.3s;
}

.social-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Formulaire de newsletter */
.newsletter-form {
  display: flex;
  margin-top: 15px;
}

.newsletter-form input {
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 4px 0 0 4px;
}

.btn-subscribe {
  padding: 0 15px;
  background-color: #e91e63;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.btn-subscribe:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.newsletter-message {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #ff8a80;
}

.newsletter-message.success {
  color: #b9f6ca;
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.payment-methods {
  display: flex;
  align-items: center;
  gap: 15px;
}

.payment-icons {
  display: flex;
  gap: 10px;
}

.payment-icons i {
  font-size: 1.5rem;
  color: #c5cae9;
}

.copyright {
  color: #c5cae9;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-bottom {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
}
</style>
