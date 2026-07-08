import React from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Divider, Avatar, Grid } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../api/userApi';
import { format } from 'date-fns';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
        <Grid item xs={12} md={4}>
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
        
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Account Information</Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">First Name</Typography>
                <Typography>{user.first_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Last Name</Typography>
                <Typography>{user.last_name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Email Address</Typography>
                <Typography>{user.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography color="text.secondary">Account Created</Typography>
                <Typography>{format(new Date(user.created_at), 'MMM dd, yyyy')}</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Permissions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {user.roles && user.roles.flatMap(r => r.permissions).filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i).length > 0 ? (
                user.roles.flatMap(r => r.permissions)
                  .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
                  .map(permission => (
                    <Chip key={permission.id} label={permission.name} size="small" variant="outlined" />
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No special permissions.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDetails;
