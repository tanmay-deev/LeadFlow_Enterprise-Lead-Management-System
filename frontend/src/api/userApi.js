import api from './axios';

export const fetchUsers = async ({ page = 1, search = '', role = '', per_page = 15 }) => {
  const params = new URLSearchParams({ page, per_page });
  if (search) params.append('search', search);
  if (role) params.append('role', role);

  const response = await api.get(`/users?${params.toString()}`);
  return response.data;
};

export const fetchUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async ({ id, ...data }) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const fetchRoles = async () => {
  const response = await api.get('/roles');
  return response.data;
};
