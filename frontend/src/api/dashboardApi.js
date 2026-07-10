import api from './axios';

export const fetchDashboardSummary = async (date_range = 'all_time') => {
  const response = await api.get(`/dashboard/summary?date_range=${date_range}`);
  return response.data;
};

export const fetchDashboardCharts = async (date_range = 'all_time') => {
  const response = await api.get(`/dashboard/charts?date_range=${date_range}`);
  return response.data;
};

export const fetchRecentActivities = async () => {
  const response = await api.get('/dashboard/recent-activities');
  return response.data;
};

export const fetchUpcomingFollowups = async () => {
  const response = await api.get('/dashboard/upcoming-followups');
  return response.data;
};
