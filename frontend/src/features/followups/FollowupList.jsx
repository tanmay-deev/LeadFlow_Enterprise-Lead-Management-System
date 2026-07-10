import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Pagination,
  IconButton,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Avatar,
  Link,
  Skeleton,
  Grid,
  ListItemText
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Check as CheckIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Videocam as VideocamIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { fetchFollowups, createFollowup, updateFollowup, deleteFollowup, completeFollowup } from '../../api/followupApi';
import FollowupForm from './FollowupForm';

const FollowupList = ({ leadId = null, hideHeader = false, isCardView = false }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuFollowup, setMenuFollowup] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['followups', { page, leadId }],
    queryFn: () => fetchFollowups({ page, lead_id: leadId }),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: createFollowup,
    onSuccess: () => {
      queryClient.invalidateQueries(['followups']);
      toast.success('Follow-up scheduled successfully');
      setIsFormOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateFollowup,
    onSuccess: () => {
      queryClient.invalidateQueries(['followups']);
      toast.success('Follow-up updated successfully');
      setIsFormOpen(false);
    }
  });

  const completeMutation = useMutation({
    mutationFn: completeFollowup,
    onSuccess: () => {
      queryClient.invalidateQueries(['followups']);
      toast.success('Follow-up marked as completed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFollowup,
    onSuccess: () => {
      queryClient.invalidateQueries(['followups']);
      toast.success('Follow-up deleted successfully');
    }
  });

  const handleSubmitForm = (formData) => {
    if (selectedFollowup) {
      updateMutation.mutate({ id: selectedFollowup.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleOpenMenu = (event, followup) => {
    setAnchorEl(event.currentTarget);
    setMenuFollowup(followup);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuFollowup(null);
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const followups = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <Box>
      {!hideHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#e6edf3' }}>Follow-ups</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedFollowup(null); setIsFormOpen(true); }}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600 }}
          >
            Schedule Follow-up
          </Button>
        </Box>
      )}

      {hideHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => { setSelectedFollowup(null); setIsFormOpen(true); }}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600 }}
          >
            Schedule Follow-up
          </Button>
        </Box>
      )}

      {isCardView ? (
        <Grid container spacing={2}>
          {isLoading ? (
            Array.from(new Array(3)).map((_, index) => (
              <Grid item xs={12} sm={6} md={6} key={index}>
                <Paper sx={{ p: 2, bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                </Paper>
              </Grid>
            ))
          ) : followups.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={{ py: 4, textAlign: 'center', color: '#8b949e', border: '1px dashed #30363d', borderRadius: '12px' }}>
                No follow-ups scheduled right now.
              </Box>
            </Grid>
          ) : (
            followups.map((f) => (
              <Grid item xs={12} sm={6} md={6} key={f.id}>
                <Paper sx={{ p: 2.5, bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: '#e6edf3', fontWeight: 600, textTransform: 'capitalize' }}>
                        {f.type} Follow-up
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8b949e' }}>
                        {format(new Date(f.scheduled_at), 'MMM dd, yyyy • hh:mm a')}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, f)} sx={{ color: '#8b949e' }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {f.status === 'completed' ? (
                      <Chip label="Completed" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', height: 20, fontSize: '0.65rem' }} />
                    ) : (
                      <Chip label="Pending" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                  
                  {f.notes && (
                    <Typography variant="body2" sx={{ color: '#c9d1d9', mt: 1, p: 1.5, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1, border: '1px solid #30363d' }}>
                      {f.notes}
                    </Typography>
                  )}
                  
                  {f.type === 'meeting' && f.meeting_link && (
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<VideocamIcon />}
                      href={f.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ 
                        mt: 1,
                        textTransform: 'none', 
                        fontWeight: 600,
                        bgcolor: '#3b82f6',
                        color: '#fff',
                        '&:hover': { bgcolor: '#2563eb' }
                      }}
                    >
                      Join Meeting
                    </Button>
                  )}
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {!leadId && <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Name</TableCell>}
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scheduled At</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</TableCell>
              <TableCell align="right" sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  {!leadId && (
                    <TableCell sx={{ borderBottom: '1px solid #30363d' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#30363d' }} />
                        <Skeleton variant="text" width={120} height={20} sx={{ bgcolor: '#30363d' }} />
                      </Box>
                    </TableCell>
                  )}
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={80} sx={{ bgcolor: '#30363d' }} /></TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4, bgcolor: '#30363d' }} /></TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={120} sx={{ bgcolor: '#30363d' }} /></TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={150} sx={{ bgcolor: '#30363d' }} /></TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#30363d', ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : followups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: '#8b949e' }}>
                  No follow-ups scheduled right now.
                </TableCell>
              </TableRow>
            ) : (
              followups.map((f) => (
                <TableRow key={f.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  {!leadId && (
                    <TableCell sx={{ borderBottom: '1px solid #30363d' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: '#1e3a8a', color: '#60a5fa', fontWeight: 600 }}>
                          {getInitials(f.lead?.contact_name || 'Unknown')}
                        </Avatar>
                        <Link 
                          component="button"
                          variant="body2"
                          onClick={() => navigate(`/leads/${f.lead_id}`)}
                          sx={{ color: '#e6edf3', fontWeight: 500, textDecoration: 'none', '&:hover': { color: '#3b82f6', textDecoration: 'underline' } }}
                        >
                          {f.lead?.contact_name || 'Unknown Lead'}
                        </Link>
                      </Box>
                    </TableCell>
                  )}
                  <TableCell sx={{ borderBottom: '1px solid #30363d', textTransform: 'capitalize', color: '#c9d1d9' }}>{f.type}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}>
                    {f.status === 'completed' ? (
                      <Chip label="Completed" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)' }} />
                    ) : (
                      <Chip label="Pending" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d', color: '#c9d1d9' }}>{format(new Date(f.scheduled_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d', color: '#8b949e', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.notes || '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid #30363d' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {f.type === 'meeting' && f.meeting_link && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VideocamIcon />}
                          href={f.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            textTransform: 'none', 
                            color: '#3b82f6', 
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            '&:hover': { borderColor: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)' }
                          }}
                        >
                          Join Meeting
                        </Button>
                      )}
                      <IconButton size="small" onClick={(e) => handleOpenMenu(e, f)} sx={{ color: '#8b949e', '&:hover': { color: '#e6edf3' } }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      )}

      {meta.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={meta.last_page} 
            page={page} 
            onChange={(e, value) => setPage(value)} 
            sx={{
              '& .MuiPaginationItem-root': { color: '#8b949e', borderColor: '#30363d' },
              '& .Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.2) !important', color: '#3b82f6', borderColor: '#3b82f6' },
            }}
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: '#161b22',
            border: '1px solid #30363d',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              color: '#c9d1d9',
              fontSize: '0.875rem',
              '&:hover': { bgcolor: '#21262d' }
            }
          }
        }}
      >
        <MenuItem onClick={() => { navigate(`/leads/${menuFollowup?.lead_id}`); handleCloseMenu(); }}>
          <ListItemIcon><VisibilityIcon sx={{ color: '#8b949e', fontSize: 20 }} /></ListItemIcon>
          <ListItemText>View Lead</ListItemText>
        </MenuItem>
        
        {menuFollowup?.status === 'pending' && (
          <MenuItem onClick={() => { completeMutation.mutate(menuFollowup.id); handleCloseMenu(); }}>
            <ListItemIcon><CheckIcon sx={{ color: '#4ade80', fontSize: 20 }} /></ListItemIcon>
            <ListItemText sx={{ color: '#4ade80' }}>Mark Complete</ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={() => { setSelectedFollowup(menuFollowup); setIsFormOpen(true); handleCloseMenu(); }}>
          <ListItemIcon><EditIcon sx={{ color: '#8b949e', fontSize: 20 }} /></ListItemIcon>
          <ListItemText>Edit Follow-up</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { 
          if (window.confirm('Delete this follow-up?')) deleteMutation.mutate(menuFollowup.id); 
          handleCloseMenu(); 
        }}>
          <ListItemIcon><DeleteIcon sx={{ color: '#f87171', fontSize: 20 }} /></ListItemIcon>
          <ListItemText sx={{ color: '#f87171' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {isFormOpen && (
        <FollowupForm 
          open={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleSubmitForm}
          initialData={selectedFollowup}
          leadId={leadId}
        />
      )}
    </Box>
  );
};

export default FollowupList;
