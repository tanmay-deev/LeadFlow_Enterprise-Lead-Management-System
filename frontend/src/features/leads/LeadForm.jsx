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

const schema = yup.object().shape({
  contact_name: yup.string().required('Contact name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().nullable(),
  company_name: yup.string().nullable(),
  source_id: yup.number().required('Source is required'),
  status_id: yup.number().required('Status is required'),
});

// Hardcoded for now. In a real app, these would come from an API endpoint.
const leadSources = [
  { id: 1, name: 'Website' },
  { id: 2, name: 'Referral' },
  { id: 3, name: 'Cold Call' },
  { id: 4, name: 'Social Media' },
  { id: 5, name: 'Other' },
];

const leadStatuses = [
  { id: 1, name: 'New' },
  { id: 2, name: 'Contacted' },
  { id: 3, name: 'Qualified' },
  { id: 4, name: 'Proposal Sent' },
  { id: 5, name: 'Won' },
  { id: 6, name: 'Lost' },
];

const LeadForm = ({ open, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      contact_name: '',
      email: '',
      phone: '',
      company_name: '',
      source_id: 1,
      status_id: 1,
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
      });
    }
  }, [initialData, reset, open]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Lead' : 'Create New Lead'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Contact Name"
                {...register('contact_name')}
                error={!!errors.contact_name}
                helperText={errors.contact_name?.message}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                {...register('company_name')}
                error={!!errors.company_name}
                helperText={errors.company_name?.message}
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
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                {...register('phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
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
              >
                {leadStatuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Lead'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LeadForm;
