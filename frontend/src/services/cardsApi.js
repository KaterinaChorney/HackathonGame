import axios from 'axios';

const cardsApiInstance = axios.create({
  baseURL: 'http://localhost:8082/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const cardsApi = {
  getRoundSummary: async (sessionId, round) => {
    try {
      const response = await cardsApiInstance.get(`/history/${sessionId}/round/${round}/summary`);
      return response.data;
    } catch (e) {
      console.error('Failed to fetch cards summary', e);
      return [];
    }
  }
};

export default cardsApi;
