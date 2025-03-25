import api from './api';

class SeriesService {
  async getSeries() {
    try {
      const response = await api.get('/series');
      console.log('Réponse brute du service des séries:', response);
      return response;
    } catch (error) {
      console.error('Erreur dans SeriesService.getSeries:', error);
      throw error;
    }
  }

  async getSeriesById(id) {
    try {
      const response = await api.get(`/series/${id}`);
      return response;
    } catch (error) {
      console.error('Erreur dans SeriesService.getSeriesById:', error);
      throw error;
    }
  }

  async getBooksBySeries(id) {
    try {
      const response = await api.get(`/series/${id}/books`);
      return response;
    } catch (error) {
      console.error('Erreur dans SeriesService.getBooksBySeries:', error);
      throw error;
    }
  }
}

export default new SeriesService();
