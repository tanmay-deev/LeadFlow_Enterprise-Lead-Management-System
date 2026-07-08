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
  type: yup.string().required('Type is required'),
  notes: yup.string().nullable(),
  scheduled_at: yup.string().required('Scheduled date/time is required'),
  lead_id: yup.number().required('Lead ID is required')
});

const followupTypes = ['call', 'email', 'meeting'];

const FollowupForm = ({ open, onClose, onSubmit, initialData = null, isLoading = false, leadId = null }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'call',
      notes: '',
      scheduled_at: '',
      lead_id: leadId || 1 // defaulting to 1 for demo if not passed
    }
  });

  useEffect(() => {
    if (initialData) {
      // format date for datetime-local input
      const dateVal = initialData.scheduled_at 
        ? new Date(initialData.scheduled_at).toISOString().slice(0, 16) 
        : '';
      
      reset({
        ...initialData,
        scheduled_at: dateVal
      });
    } else {
      reset({
        type: 'call',
        notes: '',
        scheduled_at: '',
        lead_id: leadId || 1
      });
    }
  }, [initialData, reset, open, leadId]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Follow-up' : 'Schedule Follow-up'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Type"
                defaultValue={initialData?.type || 'call'}
                {...register('type')}
                error={!!errors.type}
                helperText={errors.type?.message}
              >
                {followupTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scheduled At"
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('scheduled_at')}
                error={!!errors.scheduled_at}
                helperText={errors.scheduled_at?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={4}
                {...register('notes')}
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            </Grid>
            {/* Hidden field for lead_id */}
            <input type="hidden" {...register('lead_id')} />
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FollowupForm;
