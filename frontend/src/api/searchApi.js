import api from './axios';

export const globalSearch = async (query) => {
  const response = await api.get('/search', { params: { query } });
  return response.data;
};
