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
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { fetchFollowups, createFollowup, updateFollowup, deleteFollowup, completeFollowup } from '../../api/followupApi';
import FollowupForm from './FollowupForm';

const FollowupList = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['followups', { page }],
    queryFn: () => fetchFollowups({ page }),
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

  const followups = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" color="text.primary">Follow-ups</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => { setSelectedFollowup(null); setIsFormOpen(true); }}
        >
          Schedule Follow-up
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lead Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Scheduled At</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : followups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No follow-ups scheduled.
                </TableCell>
              </TableRow>
            ) : (
              followups.map((f) => (
                <TableRow key={f.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {f.lead?.first_name} {f.lead?.last_name}
                  </TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{f.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={f.status} 
                      color={f.status === 'completed' ? 'success' : 'warning'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{format(new Date(f.scheduled_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.notes || '-'}
                  </TableCell>
                  <TableCell align="right">
                    {f.status === 'pending' && (
                      <IconButton size="small" color="success" onClick={() => completeMutation.mutate(f.id)} title="Mark Complete">
                        <CheckIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" color="primary" onClick={() => { setSelectedFollowup(f); setIsFormOpen(true); }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => window.confirm('Delete this follow-up?') && deleteMutation.mutate(f.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {meta.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={meta.last_page} 
            page={page} 
            onChange={(e, value) => setPage(value)} 
            color="primary" 
          />
        </Box>
      )}

      <FollowupForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={handleSubmitForm}
        initialData={selectedFollowup}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </Box>
  );
};

export default FollowupList;
