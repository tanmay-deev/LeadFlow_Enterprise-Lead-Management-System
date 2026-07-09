import React from 'react';
import { Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton, IconButton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../../../api/leadApi';
import { formatDistanceToNow, format } from 'date-fns';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const RecentLeads = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recentLeads'],
    queryFn: () => fetchLeads({ page: 1, per_page: 5 }),
  });

  const getStatusStyle = (statusName) => {
    const map = {
      'New': { bg: 'rgba(37, 99, 235, 0.1)', color: '#60a5fa', border: '1px solid rgba(37, 99, 235, 0.3)' },
      'Contacted': { bg: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' },
      'Attempted Contact': { bg: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' },
      'Qualified': { bg: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' },
      'Won': { bg: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' },
      'Lost': { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' },
    };
    return map[statusName] || { bg: 'rgba(141, 144, 160, 0.1)', color: '#9ca3af', border: '1px solid rgba(141, 144, 160, 0.3)' };
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <Box sx={{ p: 2.5, borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.875rem' }}>Recent Leads</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ bgcolor: '#21262d' }} />
        </Box>
      </Card>
    );
  }

  const leads = data?.data || [];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <Box sx={{ p: '20px 24px', borderBottom: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ color: '#e6edf3', fontWeight: 600, fontSize: '0.875rem' }}>
          Recent Leads
        </Typography>
        <Typography sx={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
          View All Leads
        </Typography>
      </Box>
      <TableContainer sx={{ boxShadow: 'none', bgcolor: 'transparent' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Contact Name</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Company</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Status</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Source</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Assigned To</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Last Activity</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }}>Follow-up Date</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 500, fontSize: '0.75rem', py: 2 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leads.length > 0 ? (
              leads.map((lead) => {
                const statusName = lead.status?.name || 'New';
                const statusStyle = getStatusStyle(statusName);
                
                return (
                  <TableRow key={lead.id} sx={{ '&:hover': { bgcolor: '#21262d' } }}>
                    {/* Contact Name */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#1e3a8a', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                          {getInitials(lead.contact_name)}
                        </Box>
                        <Typography sx={{ color: '#c9d1d9', fontSize: '0.8rem' }}>{lead.contact_name}</Typography>
                      </Box>
                    </TableCell>
                    
                    {/* Company */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.8rem' }}>
                      {lead.company_name || '-'}
                    </TableCell>
                    
                    {/* Status */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                      <Box sx={{ 
                        display: 'inline-block', 
                        px: 1.5, 
                        py: 0.25, 
                        bgcolor: statusStyle.bg, 
                        color: statusStyle.color, 
                        border: statusStyle.border,
                        borderRadius: '12px', 
                        fontSize: '0.65rem',
                        fontWeight: 600
                      }}>
                        {statusName}
                      </Box>
                    </TableCell>

                    {/* Source */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#8b949e', fontSize: '0.8rem' }}>
                      {lead.source?.name || '-'}
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#7c2d12', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700 }}>
                          {getInitials(lead.assigned_user?.first_name ? `${lead.assigned_user.first_name} ${lead.assigned_user.last_name}` : 'Unassigned')}
                        </Box>
                        <Typography sx={{ color: '#c9d1d9', fontSize: '0.8rem' }}>
                          {lead.assigned_user?.first_name ? `${lead.assigned_user.first_name} ${lead.assigned_user.last_name}` : '-'}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Last Activity */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.8rem' }}>
                      {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
                    </TableCell>

                    {/* Follow-up Date */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.8rem' }}>
                       {lead.followups?.length > 0 ? format(new Date(lead.followups[0].scheduled_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }} align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <IconButton size="small" sx={{ color: '#8b949e', '&:hover': { color: '#c9d1d9' } }}>
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#8b949e', '&:hover': { color: '#c9d1d9' } }}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton size="small" sx={{ color: '#8b949e', '&:hover': { color: '#c9d1d9' } }}>
                          <MoreVertIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                  <Typography variant="body2" color="#8b949e">No recent leads found.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export default RecentLeads;
