import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, TextField, Button, Grid, Avatar } from '@mui/material';
import { Person, Lock } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { updateProfileAPI, updatePasswordAPI } from '../../api/authApi';
import { login } from '../../redux/slices/authSlice'; // Re-use login action to update user state if needed

const profileSchema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
});

const securitySchema = yup.object().shape({
  current_password: yup.string().required('Current password is required'),
  password: yup.string().min(6, 'Min 6 characters').required('New password is required'),
  password_confirmation: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm new password'),
});

const Settings = () => {
  const [tab, setTab] = useState(0);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" color="text.primary">Settings</Typography>
      </Box>

      <Paper sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 500 }}>
        <Tabs
          orientation="vertical"
          variant="scrollable"
          value={tab}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: 'divider', minWidth: 200, display: { xs: 'none', md: 'flex' } }}
        >
          <Tab icon={<Person />} iconPosition="start" label="Profile Info" sx={{ justifyContent: 'flex-start' }} />
          <Tab icon={<Lock />} iconPosition="start" label="Security" sx={{ justifyContent: 'flex-start' }} />
        </Tabs>

        {/* Mobile Tabs */}
        <Tabs
          variant="fullWidth"
          value={tab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', display: { xs: 'flex', md: 'none' } }}
        >
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Lock />} label="Security" />
        </Tabs>

        <Box sx={{ flexGrow: 1, p: 4 }}>
          {tab === 0 && <ProfileForm user={user} dispatch={dispatch} />}
          {tab === 1 && <SecurityForm />}
        </Box>
      </Paper>
    </Box>
  );
};

const ProfileForm = ({ user, dispatch }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    }
  });

  const mutation = useMutation({
    mutationFn: updateProfileAPI,
    onSuccess: (data) => {
      // Re-hydrate Redux auth user if your authSlice uses the same structure
      dispatch(login({ user: data.data, access_token: localStorage.getItem('token') }));
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Public Profile</Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
          {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>{user?.first_name} {user?.last_name}</Typography>
          <Typography variant="body2" color="text.secondary">{user?.role?.name || 'User'}</Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              {...register('first_name')}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              {...register('last_name')}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

const SecurityForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(securitySchema)
  });

  const mutation = useMutation({
    mutationFn: updatePasswordAPI,
    onSuccess: () => {
      toast.success('Password updated successfully');
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Change Password</Typography>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3} sx={{ maxWidth: 500 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              {...register('current_password')}
              error={!!errors.current_password}
              helperText={errors.current_password?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              {...register('password_confirmation')}
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation?.message}
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default Settings;
