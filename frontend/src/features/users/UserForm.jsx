import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, CircularProgress, Typography, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, fetchRoles } from '../../api/userApi';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().when('isNew', {
    is: true,
    then: () => yup.string().required('Password is required').min(6, 'Min 6 chars'),
    otherwise: () => yup.string().nullable()
  }),
  role_id: yup.number().nullable(),
});

const UserForm = ({ open, onClose, initialData }) => {
  const queryClient = useQueryClient();
  const isEdit = !!initialData;

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      isNew: !isEdit,
      first_name: initialData?.first_name || '',
      last_name: initialData?.last_name || '',
      email: initialData?.email || '',
      password: '',
      role_id: initialData?.roles?.[0]?.id || '',
    }
  });

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  });

  useEffect(() => {
    if (initialData) {
      reset({
        isNew: false,
        first_name: initialData.first_name,
        last_name: initialData.last_name,
        email: initialData.email,
        password: '',
        role_id: initialData.roles?.[0]?.id || '',
      });
    }
  }, [initialData, reset]);

  const mutation = useMutation({
    mutationFn: isEdit ? updateUser : createUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success(isEdit ? 'User updated successfully' : 'User created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  });

  const onSubmit = (data) => {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      roles: data.role_id ? [data.role_id] : []
    };
    if (data.password) {
      payload.password = data.password;
    }
    
    if (isEdit) {
      mutation.mutate({ id: initialData.id, ...payload });
    } else {
      mutation.mutate(payload);
    }
  };

  const roles = rolesData?.data || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
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
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={isEdit ? "Password (leave blank to keep current)" : "Password"}
                type="password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </Grid>
            <Grid item xs={12}>
              {rolesLoading ? <CircularProgress size={24} /> : (
                <TextField
                  select
                  fullWidth
                  label="Role"
                  defaultValue={initialData?.roles?.[0]?.id || ''}
                  {...register('role_id')}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;
