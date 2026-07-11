import React from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Divider, Avatar, Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUser, toggleUserSuspension } from '../../api/userApi';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useSelector(state => state.auth);
  const isAdmin = ['Super Admin', 'Admin'].includes(currentUser?.role?.name);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });

  const suspendMutation = useMutation({
    mutationFn: (is_suspended) => toggleUserSuspension({ id, is_suspended }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user', id]);
      toast.success(data.message || 'User status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleToggleSuspend = (is_suspended) => {
    suspendMutation.mutate(is_suspended);
  };

  if (isError || !data?.data) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">Failed to load user details.</Typography>
      </Box>
    );
  }

  const user = data.data;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" color="text.primary">User Profile</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: '2rem' }}
            >
              {user.first_name.charAt(0)}{user.last_name.charAt(0)}
            </Avatar>
            <Typography variant="h5">{user.first_name} {user.last_name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{user.email}</Typography>
            
            {user.roles && user.roles.map(role => (
              <Chip key={role.id} label={role.name} color="primary" sx={{ mb: 1 }} />
            ))}
          </Paper>
        </Grid>
        
        <Grid xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Account Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <Typography color="text.secondary">First Name</Typography>
                <Typography>{user.first_name}</Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography color="text.secondary">Last Name</Typography>
                <Typography>{user.last_name}</Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography color="text.secondary">Email Address</Typography>
                <Typography>{user.email}</Typography>
              </Grid>
              <Grid xs={12} sm={6}>
                <Typography color="text.secondary">Account Created</Typography>
                <Typography>{format(new Date(user.created_at), 'MMM dd, yyyy')}</Typography>
              </Grid>
            </Grid>


            {isAdmin && user.id !== currentUser.id && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 2, color: '#ef4444' }}>Account Status</Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography color="text.secondary">
                    Current Status: 
                    <Typography component="span" sx={{ ml: 1, fontWeight: 'bold', color: user.is_suspended ? '#ef4444' : '#22c55e' }}>
                      {user.is_suspended ? 'Suspended' : 'Active'}
                    </Typography>
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color={user.is_suspended ? "success" : "error"}
                    startIcon={user.is_suspended ? <CheckCircleIcon /> : <BlockIcon />}
                    onClick={() => handleToggleSuspend(!user.is_suspended)}
                    disabled={suspendMutation.isLoading}
                  >
                    {user.is_suspended ? 'Activate Account' : 'Suspend Account'}
                  </Button>
                </Box>
              </>
            )}

          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetails;
