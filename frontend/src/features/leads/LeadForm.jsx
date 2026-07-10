import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid,
  MenuItem
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

import { leadSources, leadStatuses } from '../../constants/leadConstants';
import { fetchUsers } from '../../api/userApi';

const schema = yup.object().shape({
  contact_name: yup.string().required('Contact name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().nullable(),
  company_name: yup.string().nullable(),
  source_id: yup.number().required('Source is required'),
  status_id: yup.number().required('Status is required'),
  assigned_user_id: yup.number().nullable(),
});

const textFieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: '#c9d1d9',
    '& fieldset': { borderColor: '#30363d' },
    '&:hover fieldset': { borderColor: '#8b949e' },
    '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
  },
  '& .MuiInputLabel-root': { color: '#8b949e' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#3b82f6' },
  '& .MuiSvgIcon-root': { color: '#8b949e' }
};

const menuSlotProps = {
  select: {
    MenuProps: {
      PaperProps: {
        sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }
      }
    }
  }
};

const LeadForm = ({ open, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const { user } = useSelector(state => state.auth);
  const isAdmin = ['Super Admin', 'Admin', 'Sales Manager'].includes(user?.role?.name);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers({ per_page: 100 }),
    enabled: isAdmin,
  });
  const agents = usersData?.data || [];

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contact_name: '',
      email: '',
      phone: '',
      company_name: '',
      source_id: 1,
      status_id: 1,
      assigned_user_id: user?.id || '',
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        contact_name: '',
        email: '',
        phone: '',
        company_name: '',
        source_id: 1,
        status_id: 1,
        assigned_user_id: user?.id || '',
      });
    }
  }, [initialData, reset, open, user]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          bgcolor: '#161b22', 
          border: '1px solid #30363d', 
          backgroundImage: 'none',
          color: '#c9d1d9',
          borderRadius: '12px'
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid #30363d', fontWeight: 700 }}>
        {initialData ? 'Edit Lead' : 'Create New Lead'}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Contact Name"
                {...register('contact_name')}
                error={!!errors.contact_name}
                helperText={errors.contact_name?.message}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                {...register('company_name')}
                error={!!errors.company_name}
                helperText={errors.company_name?.message}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
                sx={textFieldStyle}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Source"
                defaultValue={initialData?.source_id || 1}
                {...register('source_id')}
                error={!!errors.source_id}
                helperText={errors.source_id?.message}
                sx={textFieldStyle}
                slotProps={menuSlotProps}
              >
                {leadSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    {source.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Status"
                defaultValue={initialData?.status_id || 1}
                {...register('status_id')}
                error={!!errors.status_id}
                helperText={errors.status_id?.message}
                sx={textFieldStyle}
                slotProps={menuSlotProps}
              >
                {leadStatuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {isAdmin && (
              <Grid xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Assign To"
                  defaultValue={initialData?.assigned_user_id || user?.id || ''}
                  {...register('assigned_user_id')}
                  error={!!errors.assigned_user_id}
                  helperText={errors.assigned_user_id?.message}
                  sx={textFieldStyle}
                  slotProps={menuSlotProps}
                >
                  <MenuItem value=""><em>Unassigned</em></MenuItem>
                  {agents.map((agent) => (
                    <MenuItem key={agent.id} value={agent.id}>
                      {agent.first_name} {agent.last_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #30363d' }}>
          <Button 
            onClick={onClose} 
            sx={{ color: '#8b949e', '&:hover': { color: '#c9d1d9', bgcolor: 'rgba(255,255,255,0.05)' } }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={isLoading}
            sx={{ 
              bgcolor: '#2563eb', 
              color: '#fff',
              '&:hover': { bgcolor: '#1d4ed8' },
              boxShadow: '0 0 10px rgba(37,99,235,0.3)',
              borderRadius: '8px',
              px: 3
            }}
          >
            {isLoading ? 'Saving...' : 'Save Lead'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeadForm;
