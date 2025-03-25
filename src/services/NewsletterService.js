import api from './api';

class NewsletterService {
  /**
   * Inscrit un utilisateur à la newsletter
   * @param {string} email - Adresse email de l'utilisateur
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  subscribe(email) {
    return api.post('/newsletter/subscribe', { email });
  }

  /**
   * Désinscrit un utilisateur de la newsletter
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} token - Token de désinscription (envoyé par email)
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  unsubscribe(email, token) {
    return api.post('/newsletter/unsubscribe', { email, token });
  }

  /**
   * Vérifie si un email est déjà inscrit à la newsletter
   * @param {string} email - Adresse email à vérifier
   * @returns {Promise} - Promesse contenant le statut d'inscription
   */
  checkSubscription(email) {
    return api.get('/newsletter/check', {
      params: { email },
    });
  }

  /**
   * Met à jour les préférences de newsletter d'un utilisateur
   * @param {string} email - Adresse email de l'utilisateur
   * @param {Object} preferences - Préférences de l'utilisateur
   * @returns {Promise} - Promesse contenant la réponse du serveur
   */
  updatePreferences(email, preferences) {
    return api.put('/newsletter/preferences', {
      email,
      preferences,
    });
  }
}

export default new NewsletterService();
