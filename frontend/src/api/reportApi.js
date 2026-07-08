import api from './axios';

export const fetchDailyReport = async (date) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);

  const response = await api.get(`/reports/daily?${params.toString()}`);
  return response.data;
};

export const fetchConversionReport = async ({ start_date, end_date }) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  const response = await api.get(`/reports/conversion?${params.toString()}`);
  return response.data;
};

export const fetchAgentPerformance = async ({ start_date, end_date }) => {
  const params = new URLSearchParams();
  if (start_date) params.append('start_date', start_date);
  if (end_date) params.append('end_date', end_date);

  const response = await api.get(`/reports/agent-performance?${params.toString()}`);
  return response.data;
};
