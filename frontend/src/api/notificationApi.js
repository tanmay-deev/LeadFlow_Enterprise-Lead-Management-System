import api from './axios';

export const fetchNotifications = async ({ page = 1, per_page = 15 }) => {
  const params = new URLSearchParams({ page, per_page });
  const response = await api.get(`/notifications?${params.toString()}`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch('/notifications/read-all');
  return response.data;
};
