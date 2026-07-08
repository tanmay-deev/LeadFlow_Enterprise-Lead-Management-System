import api from './axios';

export const fetchLeads = async ({ page = 1, search = '', status_id = '', source_id = '', per_page = 15 }) => {
  const params = new URLSearchParams({ page, per_page });
  if (search) params.append('search', search);
  if (status_id) params.append('status_id', status_id);
  if (source_id) params.append('source_id', source_id);

  const response = await api.get(`/leads?${params.toString()}`);
  return response.data;
};

export const fetchLead = async (id) => {
  const response = await api.get(`/leads/${id}`);
  return response.data;
};

export const createLead = async (leadData) => {
  const response = await api.post('/leads', leadData);
  return response.data;
};

export const updateLead = async ({ id, ...leadData }) => {
  const response = await api.put(`/leads/${id}`, leadData);
  return response.data;
};

export const deleteLead = async (id) => {
  const response = await api.delete(`/leads/${id}`);
  return response.data;
};

// Lead Status & Assignment
export const updateLeadStatus = async ({ id, status_id }) => {
  const response = await api.patch(`/leads/${id}/status`, { status_id });
  return response.data;
};

export const assignLead = async ({ id, assigned_user_id }) => {
  const response = await api.patch(`/leads/${id}/assign`, { assigned_user_id });
  return response.data;
};

// Lead Timeline
export const fetchLeadTimeline = async (id) => {
  const response = await api.get(`/leads/${id}/timeline`);
  return response.data;
};

export const exportLeads = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/leads/export?${params.toString()}`, { responseType: 'blob' });
  return response.data;
};

export const importLeads = async (formData) => {
  const response = await api.post('/leads/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

// Lead Notes
export const fetchLeadNotes = async (id) => {
  const response = await api.get(`/leads/${id}/notes`);
  return response.data;
};

export const createLeadNote = async ({ id, content }) => {
  const response = await api.post(`/leads/${id}/notes`, { content });
  return response.data;
};

// Lead Documents
export const fetchLeadDocuments = async (id) => {
  const response = await api.get(`/leads/${id}/documents`);
  return response.data;
};

export const uploadLeadDocument = async ({ id, file }) => {
  const formData = new FormData();
  formData.append('document', file);
  const response = await api.post(`/leads/${id}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteLeadDocument = async (docId) => {
  const response = await api.delete(`/documents/${docId}`);
  return response.data;
};


