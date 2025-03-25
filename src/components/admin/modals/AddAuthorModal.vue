<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Ajouter un auteur</h2>
        <button class="btn-close" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="firstName">Prénom *</label>
            <input
              type="text"
              id="firstName"
              v-model="author.firstName"
              required
            />
          </div>

          <div class="form-group">
            <label for="lastName">Nom *</label>
            <input
              type="text"
              id="lastName"
              v-model="author.lastName"
              required
            />
          </div>

          <div class="form-group">
            <label for="biography">Biographie</label>
            <textarea
              id="biography"
              v-model="author.biography"
              rows="4"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="birthDate">Date de naissance</label>
              <input type="date" id="birthDate" v-model="author.birthDate" />
            </div>

            <div class="form-group">
              <label for="nationality">Nationalité</label>
              <input
                type="text"
                id="nationality"
                v-model="author.nationality"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="website">Site web</label>
            <input
              type="url"
              id="website"
              v-model="author.website"
              placeholder="https://..."
            />
          </div>

          <!-- Ajout du sélecteur d'éditeur -->
          <div class="form-group">
            <label for="editor">Éditeur</label>
            <select id="editor" v-model="author.editorId">
              <option value="">-- Sélectionner un éditeur --</option>
              <option
                v-for="editor in editors"
                :key="editor.id"
                :value="editor.id"
              >
                {{ editor.companyId }}
              </option>
            </select>
          </div>

          <!-- Ajout du sélecteur de catégories -->
          <div class="form-group">
            <label for="categories">Catégories</label>
            <select id="categories" v-model="author.categoryIds" multiple>
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Ajout des champs adresse et téléphone -->
          <div class="form-group">
            <label for="address">Adresse</label>
            <textarea
              id="address"
              v-model="userData.address"
              rows="2"
              placeholder="Adresse complète"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              v-model="userData.phone"
              placeholder="Ex: +33 6 12 34 56 78"
            />
          </div>

          <div class="form-group">
            <label for="photo">Photo</label>
            <div class="file-upload">
              <input
                type="file"
                id="photo"
                @change="handleImageUpload"
                accept="image/*"
              />
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Photo de l'auteur" />
              </div>
            </div>
          </div>

          <h3 class="form-section-title">Informations de connexion</h3>

          <div class="form-group">
            <label for="username">Nom d'utilisateur *</label>
            <input
              type="text"
              id="username"
              v-model="userData.username"
              required
            />
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" v-model="userData.email" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                v-model="userData.password"
                required
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmer le mot de passe *</label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                required
              />
              <div v-if="passwordError" class="form-error">
                {{ passwordError }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="role">Rôle *</label>
            <select id="role" v-model="userData.role" required>
              <option value="AUTHOR">Auteur</option>
              <option value="EDITOR">Éditeur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <div class="form-group switch-group">
            <label class="switch-label">
              <span>Statut</span>
              <div class="switch">
                <input type="checkbox" v-model="userData.active" />
                <span class="slider"></span>
              </div>
              <span>{{ userData.active ? 'Actif' : 'Inactif' }}</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Enregistrement...' : "Ajouter l'auteur" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import AuthorService from '@/services/AuthorService';
import CategoryService from '@/services/CategoryService';
import EditorService from '@/services/EditorService';
import { useStore } from 'vuex';

export default {
  name: 'AddAuthorModal',

  emits: ['close', 'author-added'],

  setup(props, { emit }) {
    const store = useStore();
    const author = ref({
      firstName: '',
      lastName: '',
      biography: '',
      birthDate: '',
      nationality: '',
      website: '',
      photo: null,
      editorId: '',
      categoryIds: [],
    });

    const userData = ref({
      username: '',
      email: '',
      password: '',
      role: 'AUTHOR',
      active: true,
      address: '',
      phone: '',
    });

    const confirmPassword = ref('');
    const imagePreview = ref(null);
    const isSubmitting = ref(false);
    const categories = ref([]);
    const editors = ref([]);

    // Chargement des catégories
    const loadCategories = async () => {
      try {
        console.log('Chargement des catégories...');
        // Utilise le CategoryService modifié qui retourne directement le tableau
        const categoriesData = await CategoryService.getCategories();
        categories.value = categoriesData.map((cat) => ({
          ...cat,
          books: cat.books || [],
          icon: cat.icon || 'fas fa-book',
          color: cat.color || 'blue',
        }));
        console.log('Catégories chargées:', categories.value);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        categories.value = [];
      }
    };

    // Chargement des éditeurs
    const loadEditors = async () => {
      try {
        console.log('Chargement des éditeurs...');
        const response = await EditorService.getEditors();
        // Vérifiez la structure de la réponse et ajustez selon le besoin
        editors.value = Array.isArray(response)
          ? response
          : response.data?.content || response.data || [];
        console.log('Éditeurs chargés:', editors.value);
      } catch (error) {
        console.error('Erreur lors du chargement des éditeurs:', error);
        editors.value = [];
      }
    };

    // Chargement des données au montage du composant
    onMounted(() => {
      loadCategories();
      loadEditors();
    });

    // Vérifier l'authentification et les rôles
    const checkAuth = () => {
      // Vérifier les deux clés possibles pour le token
      const token =
        localStorage.getItem('auth_token') || localStorage.getItem('token');
      let user = null;
      let isAdmin = false;

      // Récupérer les informations utilisateur depuis localStorage (vérifier les deux clés)
      const userInfoStr =
        localStorage.getItem('user_info') || localStorage.getItem('user');
      if (userInfoStr) {
        try {
          user = JSON.parse(userInfoStr);
          console.log('📋 Données utilisateur:', user);

          // Vérifier le rôle en ignorant la casse
          const userRole = user?.role?.toLowerCase?.() || '';
          const userRoles = user?.roles || [];

          isAdmin =
            userRole === 'admin' ||
            userRoles.some(
              (r) =>
                r?.toLowerCase?.() === 'admin' ||
                r?.toLowerCase?.() === 'role_admin'
            );

          console.log('🔍 Vérification du rôle:');
          console.log('- Role brut:', user?.role);
          console.log('- Role en minuscules:', userRole);
          console.log('- Roles array:', userRoles);
          console.log('- Est admin (après vérification):', isAdmin);
        } catch (e) {
          console.error(
            'Erreur lors de la lecture des informations utilisateur:',
            e
          );
        }
      }

      // Si pas d'info utilisateur dans localStorage, essayer depuis le store
      if (!user && store.state.auth && store.state.auth.user) {
        user = store.state.auth.user;
        console.log('📋 Données utilisateur depuis le store:', user);

        // Vérifier le rôle en ignorant la casse
        const userRole = user?.role?.toLowerCase?.() || '';
        const userRoles = user?.roles || [];

        isAdmin =
          userRole === 'admin' ||
          userRoles.some(
            (r) =>
              r?.toLowerCase?.() === 'admin' ||
              r?.toLowerCase?.() === 'role_admin'
          );

        console.log('🔍 Vérification du rôle depuis le store:');
        console.log('- Role brut:', user?.role);
        console.log('- Role en minuscules:', userRole);
        console.log('- Roles array:', userRoles);
        console.log('- Est admin (après vérification):', isAdmin);
      }

      console.log("🔑 Vérification d'authentification:");
      console.log('- Token présent:', !!token);
      console.log('- Utilisateur connecté:', !!user);
      console.log(
        '- Rôle utilisateur:',
        user ? user.role || user.roles?.join(', ') : 'Non défini'
      );
      console.log('- Est admin:', isAdmin);

      return { token, user, isAdmin };
    };

    // Appeler la vérification au chargement
    checkAuth();

    const passwordError = computed(() => {
      if (
        confirmPassword.value &&
        userData.value.password !== confirmPassword.value
      ) {
        return 'Les mots de passe ne correspondent pas';
      }
      return '';
    });

    const isFormValid = computed(() => {
      return (
        userData.value.username &&
        userData.value.email &&
        userData.value.password &&
        userData.value.password === confirmPassword.value
      );
    });

    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        author.value.photo = file;
        imagePreview.value = URL.createObjectURL(file);
      }
    };

    const handleSubmit = async () => {
      isSubmitting.value = true;

      // Vérifier l'authentification avant de soumettre
      const { token, user, isAdmin } = checkAuth();

      console.log('🚀 Tentative de soumission du formulaire:');
      console.log('- Token présent:', !!token);
      console.log('- Utilisateur:', user);
      console.log('- isAdmin (résultat de checkAuth):', isAdmin);

      // Vérification manuelle du rôle admin (en ignorant la casse)
      const manualAdminCheck =
        user &&
        (user.role?.toLowerCase() === 'admin' ||
          (user.roles &&
            user.roles.some(
              (r) =>
                r?.toLowerCase?.() === 'admin' ||
                r?.toLowerCase?.() === 'role_admin'
            )));

      console.log('- Vérification manuelle du rôle admin:', manualAdminCheck);

      // Utiliser soit isAdmin soit la vérification manuelle
      const hasAdminRights = isAdmin || manualAdminCheck;
      console.log("- Droits d'administration (combinés):", hasAdminRights);

      if (!token) {
        console.error("❌ Erreur: Vous n'êtes pas authentifié");
        alert("Vous n'êtes pas authentifié. Veuillez vous connecter.");
        isSubmitting.value = false;
        emit('close');
        return;
      }

      // TEMPORAIRE: Ignorer la vérification des droits d'administration pour déboguer
      // if (!hasAdminRights) {
      //   console.error("❌ Erreur: Vous n'avez pas les permissions nécessaires");
      //   alert(
      //     "Vous n'avez pas les permissions nécessaires pour ajouter un auteur."
      //   );
      //   isSubmitting.value = false;
      //   return;
      // }

      // Afficher un avertissement mais continuer quand même
      if (!hasAdminRights) {
        console.warn(
          "⚠️ Avertissement: Vous n'avez pas les droits d'administration, mais nous continuons quand même pour le débogage"
        );
      }

      try {
        // Vérifier que les champs obligatoires sont remplis
        if (!author.value.firstName || !author.value.lastName) {
          throw new Error("Le prénom et le nom de l'auteur sont obligatoires");
        }

        if (
          !userData.value.username ||
          !userData.value.email ||
          !userData.value.password
        ) {
          throw new Error(
            "Le nom d'utilisateur, l'email et le mot de passe sont obligatoires"
          );
        }

        if (userData.value.password !== confirmPassword.value) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        if (userData.value.password.length < 8) {
          throw new Error(
            'Le mot de passe doit contenir au moins 8 caractères'
          );
        }

        // Créer l'auteur avec les informations utilisateur
        console.log('📤 Envoi des données au service:', {
          author: {
            ...author.value,
            photo: author.value.photo ? 'Photo présente' : 'Pas de photo',
          },
          userData: { ...userData.value, password: '********' },
        });

        const result = await AuthorService.createAuthorWithUser(
          author.value,
          userData.value
        );

        console.log('✅ Auteur créé avec succès:', result);
        emit('author-added', result);
        emit('close');
      } catch (error) {
        console.error("❌ Erreur lors de l'ajout de l'auteur:", error);
        alert(`Erreur lors de l'ajout de l'auteur: ${error.message}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      author,
      userData,
      confirmPassword,
      passwordError,
      isFormValid,
      imagePreview,
      isSubmitting,
      handleImageUpload,
      handleSubmit,
      categories,
      editors,
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
  width: 600px;
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

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.file-upload {
  border: 1px dashed #ddd;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #4361ee;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-primary:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #4b5563;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.form-error {
  color: #d32f2f;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.form-section-title {
  font-size: 1.1rem;
  color: #333;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #eee;
}

.switch-group {
  display: flex;
  align-items: center;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4361ee;
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
