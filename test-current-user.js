// Script pour vérifier l'utilisateur actuellement connecté
const http = require('http');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 8111;
const API_PATH = '/api/users/current';

// =====================================================
// IMPORTANT: Remplacez 'VOTRE_TOKEN_ICI' par votre token d'authentification réel
// Pour obtenir votre token:
// 1. Ouvrez votre application dans le navigateur
// 2. Connectez-vous avec un compte administrateur
// 3. Ouvrez les outils de développement (F12)
// 4. Allez dans l'onglet "Application" ou "Stockage"
// 5. Cliquez sur "Stockage local" dans le menu de gauche
// 6. Recherchez la clé "token" ou "auth_token"
// 7. Copiez la valeur du token et collez-la ci-dessous
// =====================================================
const TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzZWJhc3RpZW4uZHVnZW5lc3RAZ21haWwuY29tIiwicm9sZXMiOlsiUk9MRV9hZG1pbiJdLCJpYXQiOjE3NDIxMzQ2OTksImV4cCI6MTc0MjIyMTA5OX0.EInpdCjwsWM60r5TcxOZi44zK9ZPH26zp74z2HNK9Sw';

// Fonction pour récupérer l'utilisateur actuel
function getCurrentUser() {
  console.log('=== DÉBUT DU TEST ===');
  console.log("Tentative de récupération de l'utilisateur actuel...");
  console.log(
    'Token utilisé (premiers caractères):',
    TOKEN.substring(0, 20) + '...'
  );
  console.log('URL complète:', `http://${API_HOST}:${API_PORT}${API_PATH}`);

  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: API_PATH,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  };

  console.log('Options de requête:', JSON.stringify(options, null, 2));

  const req = http.request(options, (res) => {
    console.log('Statut de la réponse:', res.statusCode);
    console.log('Headers de la réponse:', JSON.stringify(res.headers, null, 2));

    let responseData = '';

    res.on('data', (chunk) => {
      console.log('Réception de données...');
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Fin de la réponse');
      console.log('Réponse brute:', responseData);

      if (responseData) {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Utilisateur connecté:', jsonData);

          if (res.statusCode === 403) {
            console.log('\n⚠️ ERREUR 403: Accès interdit');
            console.log('Votre token est peut-être invalide ou expiré.');
            console.log(
              "Assurez-vous d'utiliser un token valide d'un compte administrateur."
            );
          }
        } catch (e) {
          console.log("La réponse n'est pas au format JSON:", e.message);
        }
      } else {
        console.log('Aucune donnée reçue dans la réponse');
      }
      console.log('=== FIN DU TEST ===');
    });
  });

  req.on('error', (error) => {
    console.error('Erreur de requête:', error);
    console.log('=== FIN DU TEST AVEC ERREUR ===');
  });

  console.log('Envoi de la requête...');
  req.end();
  console.log('Requête envoyée, en attente de réponse...');
}

// Exécuter le test
getCurrentUser();
