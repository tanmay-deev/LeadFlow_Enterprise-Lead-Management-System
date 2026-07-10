import api from './axios';

export const fetchFollowups = async ({ page = 1, status = '', lead_id = '', per_page = 15 }) => {
  const params = new URLSearchParams({ page, per_page });
  if (status) params.append('status', status);
  if (lead_id) params.append('lead_id', lead_id);

  const response = await api.get(`/followups?${params.toString()}`);
  return response.data;
};

export const createFollowup = async (followupData) => {
  const response = await api.post('/followups', followupData);
  return response.data;
};

export const updateFollowup = async ({ id, ...followupData }) => {
  const response = await api.put(`/followups/${id}`, followupData);
  return response.data;
};

export const deleteFollowup = async (id) => {
  const response = await api.delete(`/followups/${id}`);
  return response.data;
};

export const completeFollowup = async (id) => {
  const response = await api.patch(`/followups/${id}/complete`);
  return response.data;
};
