<template>
  <div class="comments-section">
    <div class="section-header">
      <h2>Gestion des Commentaires</h2>
      <div class="filter-controls">
        <select v-model="statusFilter" class="status-filter">
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="approved">Approuvés</option>
          <option value="rejected">Rejetés</option>
        </select>
        <button @click="refreshComments" class="btn-refresh" title="Rafraîchir">
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i> Chargement des commentaires...
    </div>

    <div v-else-if="error" class="error-message">
      <i class="fas fa-exclamation-triangle"></i> {{ error }}
    </div>

    <div v-else-if="!filteredComments.length" class="empty-state">
      <i class="fas fa-comments"></i>
      <p v-if="statusFilter === 'all'">Aucun commentaire n'a été trouvé.</p>
      <p v-else>
        Aucun commentaire avec le statut "{{ getStatusLabel(statusFilter) }}"
        n'a été trouvé.
      </p>
    </div>

    <div v-else class="comments-list">
      <div
        v-for="comment in filteredComments"
        :key="comment.id"
        class="comment-card"
        :class="getStatusClass(comment.status)"
      >
        <div class="comment-header">
          <div class="comment-info">
            <span class="comment-author">{{ comment.userName }}</span>
            <span class="comment-date">{{ formatDate(comment.date) }}</span>
            <span class="comment-book">sur "{{ comment.bookTitle }}"</span>
          </div>
          <div class="comment-status">
            <span class="status-badge" :class="getStatusClass(comment.status)">
              {{ getStatusLabel(comment.status) }}
            </span>
          </div>
        </div>

        <div class="comment-content">
          <p>{{ comment.content }}</p>
        </div>

        <div class="comment-rating" v-if="comment.rating">
          <div class="stars">
            <i class="fas fa-star" v-for="i in comment.rating" :key="i"></i>
            <i
              class="far fa-star"
              v-for="i in 5 - comment.rating"
              :key="i + 5"
            ></i>
          </div>
        </div>

        <div class="comment-actions">
          <button
            @click="viewComment(comment)"
            class="btn-action btn-view"
            title="Voir en détail"
          >
            <i class="fas fa-eye"></i>
          </button>

          <template v-if="comment.status === 'pending'">
            <button
              @click="approveComment(comment)"
              class="btn-action btn-approve"
              title="Approuver"
            >
              <i class="fas fa-check"></i>
            </button>
            <button
              @click="rejectComment(comment)"
              class="btn-action btn-reject"
              title="Rejeter"
            >
              <i class="fas fa-times"></i>
            </button>
          </template>

          <template v-else>
            <button
              @click="resetComment(comment)"
              class="btn-action btn-reset"
              title="Remettre en attente"
            >
              <i class="fas fa-undo"></i>
            </button>
          </template>

          <button
            @click="confirmDeleteComment(comment)"
            class="btn-action btn-delete"
            title="Supprimer"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="pagination">
        <button
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
          class="btn-page"
        >
          <i class="fas fa-chevron-left"></i>
        </button>

        <span class="page-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>

        <button
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
          class="btn-page"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Modal de détail du commentaire -->
    <div v-if="showCommentModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Détail du commentaire</h3>
          <button @click="closeCommentModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="comment-detail">
            <div class="detail-row">
              <span class="detail-label">Utilisateur:</span>
              <span class="detail-value">{{ selectedComment.userName }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ selectedComment.userEmail }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Livre:</span>
              <span class="detail-value">{{ selectedComment.bookTitle }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">{{
                formatDate(selectedComment.date)
              }}</span>
            </div>

            <div class="detail-row">
              <span class="detail-label">Note:</span>
              <div class="stars">
                <i
                  class="fas fa-star"
                  v-for="i in selectedComment.rating"
                  :key="i"
                ></i>
                <i
                  class="far fa-star"
                  v-for="i in 5 - selectedComment.rating"
                  :key="i + 5"
                ></i>
              </div>
            </div>

            <div class="detail-row">
              <span class="detail-label">Statut:</span>
              <span
                class="status-badge"
                :class="getStatusClass(selectedComment.status)"
              >
                {{ getStatusLabel(selectedComment.status) }}
              </span>
            </div>

            <div class="detail-row full-width">
              <span class="detail-label">Commentaire:</span>
              <div class="detail-comment">{{ selectedComment.content }}</div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeCommentModal" class="btn-secondary">
            Fermer
          </button>

          <template v-if="selectedComment.status === 'pending'">
            <button @click="approveCommentFromModal" class="btn-approve-text">
              Approuver
            </button>
            <button @click="rejectCommentFromModal" class="btn-reject-text">
              Rejeter
            </button>
          </template>

          <template v-else>
            <button @click="resetCommentFromModal" class="btn-secondary">
              Remettre en attente
            </button>
          </template>

          <button @click="confirmDeleteFromModal" class="btn-danger">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="modal-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button @click="cancelDelete" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer ce commentaire ?</p>
          <div class="comment-preview">
            <p>
              <strong>{{ selectedComment.userName }}</strong> sur "{{
                selectedComment.bookTitle
              }}"
            </p>
            <p>{{ truncateText(selectedComment.content, 100) }}</p>
          </div>
          <p class="warning">Cette action est irréversible.</p>
        </div>

        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-secondary">Annuler</button>
          <button
            @click="deleteComment"
            class="btn-danger"
            :disabled="deleting"
          >
            {{ deleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';

export default {
  name: 'CommentsSection',

  setup() {
    // États
    const comments = ref([]);
    const loading = ref(true);
    const error = ref(null);
    const currentPage = ref(1);
    const totalPages = ref(1);
    const statusFilter = ref('all');

    // États pour les modales
    const showCommentModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedComment = ref({});
    const deleting = ref(false);

    // Filtrer les commentaires selon le statut sélectionné
    const filteredComments = computed(() => {
      if (statusFilter.value === 'all') {
        return comments.value;
      }
      return comments.value.filter(
        (comment) => comment.status === statusFilter.value
      );
    });

    // Méthodes
    const fetchComments = async (page = 1) => {
      loading.value = true;
      error.value = null;
      currentPage.value = page;

      try {
        // Simuler une requête API
        setTimeout(() => {
          // Données factices pour la démo
          const mockComments = [
            {
              id: 1,
              userName: 'Jean Dupont',
              userEmail: 'jean.dupont@example.com',
              bookTitle: "Harry Potter à l'école des sorciers",
              content:
                "Un livre fantastique qui m'a fait voyager dans un monde magique. Je le recommande vivement!",
              rating: 5,
              date: new Date(2025, 2, 15),
              status: 'approved',
            },
            {
              id: 2,
              userName: 'Marie Martin',
              userEmail: 'marie.martin@example.com',
              bookTitle: 'Le Seigneur des Anneaux',
              content:
                'Une aventure épique mais un peu longue par moments. Les descriptions sont parfois trop détaillées.',
              rating: 3,
              date: new Date(2025, 2, 18),
              status: 'pending',
            },
            {
              id: 3,
              userName: 'Pierre Leroy',
              userEmail: 'pierre.leroy@example.com',
              bookTitle: '1984',
              content:
                "Un chef-d'œuvre intemporel qui nous fait réfléchir sur notre société actuelle.",
              rating: 5,
              date: new Date(2025, 2, 10),
              status: 'approved',
            },
            {
              id: 4,
              userName: 'Sophie Durand',
              userEmail: 'sophie.durand@example.com',
              bookTitle: 'Da Vinci Code',
              content: 'Contenu inapproprié avec des propos diffamatoires.',
              rating: 1,
              date: new Date(2025, 2, 5),
              status: 'rejected',
            },
            {
              id: 5,
              userName: 'Lucas Bernard',
              userEmail: 'lucas.bernard@example.com',
              bookTitle: 'Les Misérables',
              content:
                "Un classique de la littérature française que j'ai adoré redécouvrir.",
              rating: 4,
              date: new Date(2025, 2, 20),
              status: 'pending',
            },
          ];

          comments.value = mockComments;
          totalPages.value = 1;
          loading.value = false;
        }, 500);
      } catch (err) {
        console.error('Erreur lors du chargement des commentaires:', err);
        error.value =
          'Impossible de charger les commentaires. Veuillez réessayer plus tard.';
        loading.value = false;
      }
    };

    const refreshComments = () => {
      fetchComments(currentPage.value);
    };

    const changePage = (page) => {
      currentPage.value = page;
      fetchComments(page);
    };

    const formatDate = (date) => {
      if (!date) return '';

      if (typeof date === 'string') {
        date = new Date(date);
      }

      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    };

    const truncateText = (text, maxLength) => {
      if (!text) return '';
      return text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
    };

    const getStatusLabel = (status) => {
      const statusMap = {
        pending: 'En attente',
        approved: 'Approuvé',
        rejected: 'Rejeté',
        all: 'Tous',
      };
      return statusMap[status] || status;
    };

    const getStatusClass = (status) => {
      return `status-${status}`;
    };

    const viewComment = (comment) => {
      selectedComment.value = { ...comment };
      showCommentModal.value = true;
    };

    const closeCommentModal = () => {
      showCommentModal.value = false;
    };

    const approveComment = (comment) => {
      // Dans une application réelle, vous enverriez une requête API ici
      const index = comments.value.findIndex((c) => c.id === comment.id);
      if (index !== -1) {
        comments.value[index] = {
          ...comments.value[index],
          status: 'approved',
        };
      }
    };

    const rejectComment = (comment) => {
      // Dans une application réelle, vous enverriez une requête API ici
      const index = comments.value.findIndex((c) => c.id === comment.id);
      if (index !== -1) {
        comments.value[index] = {
          ...comments.value[index],
          status: 'rejected',
        };
      }
    };

    const resetComment = (comment) => {
      // Dans une application réelle, vous enverriez une requête API ici
      const index = comments.value.findIndex((c) => c.id === comment.id);
      if (index !== -1) {
        comments.value[index] = { ...comments.value[index], status: 'pending' };
      }
    };

    const approveCommentFromModal = () => {
      approveComment(selectedComment.value);
      closeCommentModal();
    };

    const rejectCommentFromModal = () => {
      rejectComment(selectedComment.value);
      closeCommentModal();
    };

    const resetCommentFromModal = () => {
      resetComment(selectedComment.value);
      closeCommentModal();
    };

    const confirmDeleteComment = (comment) => {
      selectedComment.value = { ...comment };
      showDeleteModal.value = true;
    };

    const confirmDeleteFromModal = () => {
      showCommentModal.value = false;
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      showDeleteModal.value = false;
    };

    const deleteComment = async () => {
      deleting.value = true;

      try {
        // Simuler une requête API
        setTimeout(() => {
          // Suppression (simulation)
          comments.value = comments.value.filter(
            (comment) => comment.id !== selectedComment.value.id
          );

          showDeleteModal.value = false;
          deleting.value = false;
        }, 500);
      } catch (err) {
        console.error('Erreur lors de la suppression du commentaire:', err);
        alert(
          'Une erreur est survenue lors de la suppression. Veuillez réessayer.'
        );
        deleting.value = false;
      }
    };

    // Observer les changements de filtre
    watch(statusFilter, () => {
      // Réinitialiser la pagination lors du changement de filtre
      currentPage.value = 1;
      // Dans une application réelle, vous pourriez recharger les données ici
    });

    // Cycle de vie
    onMounted(() => {
      fetchComments();
    });

    return {
      comments,
      filteredComments,
      loading,
      error,
      currentPage,
      totalPages,
      statusFilter,
      showCommentModal,
      showDeleteModal,
      selectedComment,
      deleting,

      fetchComments,
      refreshComments,
      changePage,
      formatDate,
      truncateText,
      getStatusLabel,
      getStatusClass,
      viewComment,
      closeCommentModal,
      approveComment,
      rejectComment,
      resetComment,
      approveCommentFromModal,
      rejectCommentFromModal,
      resetCommentFromModal,
      confirmDeleteComment,
      confirmDeleteFromModal,
      cancelDelete,
      deleteComment,
    };
  },
};
</script>

<style scoped>
.comments-section {
  width: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-filter {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
}

.btn-refresh {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  color: #666;
}

.btn-refresh:hover {
  background-color: #f5f5f5;
}

.loading-indicator,
.error-message,
.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: #ccc;
}

.error-message {
  color: #f44336;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background-color: white;
  border-radius: 8px;
  border-left: 4px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1rem;
}

.comment-card.status-approved {
  border-left-color: #4caf50;
}

.comment-card.status-pending {
  border-left-color: #ff9800;
}

.comment-card.status-rejected {
  border-left-color: #f44336;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.comment-info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.comment-author {
  font-weight: 600;
}

.comment-date,
.comment-book {
  color: #666;
  font-size: 0.9rem;
}

.status-badge {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
}

.status-badge.status-approved {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.status-badge.status-pending {
  background-color: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.status-badge.status-rejected {
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.comment-content {
  margin-bottom: 0.5rem;
}

.comment-rating {
  margin-bottom: 0.5rem;
}

.stars {
  color: #ffc107;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.btn-action {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.btn-action:hover {
  opacity: 1;
}

.btn-view {
  color: #2196f3;
}

.btn-approve {
  color: #4caf50;
}

.btn-reject,
.btn-delete {
  color: #f44336;
}

.btn-reset {
  color: #ff9800;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-page {
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: #666;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
}

.comment-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  align-items: baseline;
}

.detail-row.full-width {
  flex-direction: column;
  gap: 0.5rem;
}

.detail-label {
  font-weight: 600;
  min-width: 100px;
  color: #666;
}

.detail-comment {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  white-space: pre-line;
}

.comment-preview {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.btn-approve-text {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-reject-text {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.warning {
  color: #f44336;
  font-weight: 500;
}

@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .comment-status {
    align-self: flex-start;
  }

  .detail-row {
    flex-direction: column;
    gap: 0.25rem;
  }

  .detail-label {
    min-width: auto;
  }

  .modal-footer {
    flex-wrap: wrap;
  }
}
</style>
