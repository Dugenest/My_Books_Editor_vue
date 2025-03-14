// src/services/CommentService.js
import axios from 'axios';

const API_URL = 'http://localhost:8111/api';

class CommentService {
  getCommentsByBookId(bookId) {
    return axios.get(`${API_URL}/books/${bookId}/comments`);
  }

  addComment(commentData) {
    return axios.post(`${API_URL}/comments`, commentData);
  }
}

export default new CommentService();
