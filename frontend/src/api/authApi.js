import api from './axios';

export const loginAPI = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const fetchProfileAPI = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const logoutAPI = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const updateProfileAPI = async (data) => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const updatePasswordAPI = async (data) => {
  const response = await api.put('/auth/password', data);
  return response.data;
};
