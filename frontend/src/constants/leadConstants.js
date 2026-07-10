export const leadSources = [
  { id: 1, name: 'Website' },
  { id: 2, name: 'Facebook' },
  { id: 3, name: 'Google Ads' },
  { id: 4, name: 'Referral' },
  { id: 5, name: 'Cold Call' },
  { id: 6, name: 'Email Campaign' },
  { id: 7, name: 'Trade Show' },
];

export const leadStatuses = [
  { id: 1, name: 'New' },
  { id: 2, name: 'Attempted Contact' },
  { id: 3, name: 'Contacted' },
  { id: 4, name: 'Interested' },
  { id: 5, name: 'Qualified' },
  { id: 6, name: 'Proposal Sent' },
  { id: 7, name: 'Negotiation' },
  { id: 8, name: 'Won' },
  { id: 9, name: 'Lost' },
  { id: 10, name: 'Duplicate' },
  { id: 11, name: 'Spam' },
];

export const getStatusStyle = (statusName) => {
  const map = {
    'New': { bg: 'rgba(37, 99, 235, 0.1)', color: '#60a5fa', border: '1px solid rgba(37, 99, 235, 0.3)' },
    'Attempted Contact': { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' },
    'Contacted': { bg: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' },
    'Interested': { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' },
    'Qualified': { bg: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' },
    'Proposal Sent': { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' },
    'Negotiation': { bg: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' },
    'Won': { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
    'Lost': { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    'Duplicate': { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', border: '1px solid rgba(100, 116, 139, 0.3)' },
    'Spam': { bg: 'rgba(15, 23, 42, 0.5)', color: '#64748b', border: '1px solid rgba(30, 41, 59, 0.8)' },
  };
  return map[statusName] || { bg: 'rgba(141, 144, 160, 0.1)', color: '#9ca3af', border: '1px solid rgba(141, 144, 160, 0.3)' };
};
