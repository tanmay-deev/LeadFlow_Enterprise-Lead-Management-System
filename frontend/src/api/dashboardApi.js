import api from './axios';

export const fetchDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const fetchDashboardCharts = async () => {
  const response = await api.get('/dashboard/charts');
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
