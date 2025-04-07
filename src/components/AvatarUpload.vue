<template>
  <div class="avatar-upload">
    <div class="avatar-preview" @click="triggerFileInput">
      <img
        v-if="displayUrl"
        :src="displayUrl"
        alt="Avatar de l'utilisateur"
        class="avatar-image"
      />
      <div v-else class="avatar-placeholder">
        <i class="fas fa-user"></i>
      </div>
      <div class="avatar-overlay">
        <span><i class="fas fa-camera"></i> Changer</span>
      </div>
    </div>
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      accept="image/*"
      class="file-input"
    />
    <div v-if="hasCustomAvatar && showResetButton" class="avatar-actions">
      <button type="button" @click="resetAvatar" class="reset-button">
        <i class="fas fa-times"></i> Réinitialiser
      </button>
    </div>
    <div v-if="isUploading" class="avatar-loading">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
    <div v-if="errorMessage" class="avatar-error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import UserService from '@/services/UserService';

export default {
  name: 'AvatarUpload',
  props: {
    userId: {
      type: [Number, String],
      required: false,
      default: null,
    },
    currentAvatar: {
      type: String,
      default: '',
    },
    // defaultAvatarPath: {
    //   type: String,
    //   default: '/static/assets/default-avatar.png',
    // },
    immediateUpload: {
      type: Boolean,
      default: true,
    },
    showResetButton: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      selectedFile: null,
      displayUrl: '',
      localUrl: '',
      hasCustomAvatar: false,
      isUploading: false,
      errorMessage: '',
    };
  },
  watch: {
    currentAvatar: {
      immediate: true,
      handler(newValue) {
        this.updateAvatarDisplay(newValue);
      },
    },
  },
  methods: {
    updateAvatarDisplay(avatarPath) {
      if (!avatarPath) {
        this.displayUrl = 'http://localhost:8111/default-avatar';
        this.hasCustomAvatar = false;
        return;
      }

      // Déterminer si c'est un avatar personnalisé ou par défaut
      this.hasCustomAvatar = !avatarPath.includes('default-avatar');

      // Si c'est une URL data (prévisualisation locale), l'utiliser directement
      if (avatarPath.startsWith('data:')) {
        this.displayUrl = avatarPath;
        return;
      }

      // Construire l'URL complète avec le port 8111 (votre serveur backend)
      if (avatarPath.startsWith('http')) {
        this.displayUrl = avatarPath;
      } else if (avatarPath.startsWith('/')) {
        this.displayUrl = `http://localhost:8111${avatarPath}`;
      } else {
        this.displayUrl = `http://localhost:8111/${avatarPath}`;
      }
    },
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.errorMessage = '';

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Veuillez sélectionner une image.';
        return;
      }

      // Vérifier la taille du fichier (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.errorMessage =
          "L'image est trop volumineuse. Taille maximum: 5MB.";
        return;
      }

      this.selectedFile = file;

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        this.localUrl = e.target.result;
        this.displayUrl = e.target.result;
        this.hasCustomAvatar = true;

        // Émettre l'événement pour les formulaires qui gèrent l'upload manuellement
        this.$emit('file-selected', {
          file: this.selectedFile,
          preview: this.localUrl,
        });
      };
      reader.readAsDataURL(file);

      // Uploader immédiatement si demandé et si l'ID de l'utilisateur est fourni
      if (this.immediateUpload && this.userId) {
        this.uploadAvatar();
      }
    },
    async uploadAvatar() {
      if (!this.selectedFile || !this.userId) return;

      this.isUploading = true;
      this.errorMessage = '';

      try {
        const response = await UserService.updateAvatar(
          this.userId,
          this.selectedFile
        );

        // Mise à jour réussie
        if (response.data && response.data.avatar) {
          this.updateAvatarDisplay(response.data.avatar);
        }
        this.$emit('update', response.data);
        this.$emit('success', 'Avatar mis à jour avec succès');
      } catch (error) {
        console.error("Erreur lors de l'upload de l'avatar", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Erreur lors de l'upload de l'avatar";
        this.$emit('error', this.errorMessage);
      } finally {
        this.isUploading = false;
      }
    },
    async resetAvatar() {
      if (!this.userId) {
        // Mode formulaire sans upload immédiat
        this.selectedFile = null;
        this.displayUrl = this.defaultAvatarPath;
        this.hasCustomAvatar = false;
        this.$emit('reset');
        return;
      }

      this.isUploading = true;
      this.errorMessage = '';

      try {
        const response = await UserService.resetAvatar(this.userId);

        // Réinitialisation réussie
        this.updateAvatarDisplay(
          response.data.avatar || this.defaultAvatarPath
        );
        this.selectedFile = null;
        this.$emit('update', response.data);
        this.$emit('success', 'Avatar réinitialisé avec succès');
      } catch (error) {
        console.error("Erreur lors de la réinitialisation de l'avatar", error);
        this.errorMessage =
          error.response?.data?.message ||
          "Erreur lors de la réinitialisation de l'avatar";
        this.$emit('error', this.errorMessage);
      } finally {
        this.isUploading = false;
      }
    },
  },
};
</script>

<style scoped>
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
}

.avatar-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview:hover {
  transform: scale(1.05);
}

.avatar-preview:hover .avatar-overlay {
  opacity: 1;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
  font-size: 3rem;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-overlay span {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-input {
  display: none;
}

.avatar-actions {
  margin-top: 0.8rem;
}

.reset-button {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-button:hover {
  background-color: #e0e0e0;
}

.avatar-loading {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.avatar-error {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #e53935;
  text-align: center;
}
</style>
