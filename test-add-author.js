// Script pour tester l'ajout d'un auteur via l'API
const http = require('http');

// Configuration
const API_HOST = 'localhost';
const API_PORT = 8111;
const API_PATH = '/api/authors';

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
const TOKEN = 'VOTRE_TOKEN_ICI';

// Données de test
const authorData = {
  firstName: 'Victor',
  lastName: 'Hugo',
  biography: 'Écrivain français du 19e siècle',
  nationality: 'Française',
  user: {
    username: 'vhugo',
    email: 'victor.hugo@exemple.fr',
    password: 'motdepasse123',
    role: 'AUTHOR',
    active: true,
  },
};

// Fonction pour ajouter un auteur
function addAuthor() {
  console.log("Tentative d'ajout d'un auteur...");
  console.log('Données envoyées:', JSON.stringify(authorData, null, 2));
  console.log(
    'Token utilisé (premiers caractères):',
    TOKEN.substring(0, 20) + '...'
  );

  const data = JSON.stringify(authorData);

  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: API_PATH,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      Authorization: `Bearer ${TOKEN}`,
    },
  };

  const req = http.request(options, (res) => {
    console.log('Statut de la réponse:', res.statusCode);

    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Réponse brute:', responseData);

      if (responseData) {
        try {
          const jsonData = JSON.parse(responseData);
          console.log('Réponse JSON:', jsonData);
        } catch (e) {
          console.log("La réponse n'est pas au format JSON");
        }
      }

      if (res.statusCode === 403) {
        console.log('\n⚠️ ERREUR 403: Accès interdit');
        console.log('Votre token est peut-être invalide ou expiré.');
        console.log(
          "Assurez-vous d'utiliser un token valide d'un compte administrateur."
        );
      }
    });
  });

  req.on('error', (error) => {
    console.error('Erreur de requête:', error);
  });

  req.write(data);
  req.end();
}

// Exécuter le test
addAuthor();
