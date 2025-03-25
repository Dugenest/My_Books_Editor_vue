// src/services/CommentService.js
import api from './api';

class CommentService {
  getCommentsByBookId(bookId) {
    return api.get(`/books/${bookId}/comments`);
  }

  addComment(commentData) {
    return api.post('/comments', commentData);
  }
}

export default new CommentService();
