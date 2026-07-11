import React, { useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box,
  MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import { fetchLeads } from '../../api/leadApi';

const schema = yup.object().shape({
  type: yup.string().required('Type is required'),
  notes: yup.string().nullable(),
  scheduled_at: yup.string().required('Scheduled date/time is required'),
  meeting_link: yup.string().url('Must be a valid URL').nullable(),
  lead_id: yup.number().required('Lead ID is required')
});

const followupTypes = ['call', 'email', 'meeting'];

const FollowupForm = ({ open, onClose, onSubmit, initialData = null, isLoading = false, leadId = null }) => {
  const { register, handleSubmit, formState: { errors }, reset, watch, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      type: 'call',
      notes: '',
      scheduled_at: '',
      meeting_link: '',
      lead_id: leadId || ''
    }
  });

  const selectedType = watch('type');

  const { data: leadsData } = useQuery({
    queryKey: ['leads-all'],
    queryFn: () => fetchLeads({ per_page: 100 }),
    enabled: open && !leadId && !initialData
  });
  const leads = leadsData?.data || [];

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
        meeting_link: '',
        lead_id: leadId || ''
      });
    }
  }, [initialData, reset, open, leadId]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>{initialData ? 'Edit Follow-up' : 'Schedule Follow-up'}</DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)} style={{ width: '100%' }}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {(!leadId && !initialData) && (
              <TextField
                select
                fullWidth
                label="Lead"
                defaultValue=""
                {...register('lead_id')}
                error={!!errors.lead_id}
                helperText={errors.lead_id?.message}
              >
                <MenuItem value="" disabled>Select a Lead</MenuItem>
                {leads.map((lead) => (
                  <MenuItem key={lead.id} value={lead.id}>
                    {lead.contact_name} {lead.company_name ? `(${lead.company_name})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            )}
            
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Type"
                    error={!!errors.type}
                    helperText={errors.type?.message}
                    sx={{ flex: 1 }}
                  >
                    {followupTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              
              <TextField
                fullWidth
                label="Scheduled At"
                type="datetime-local"
                slotProps={{ inputLabel: { shrink: true } }}
                {...register('scheduled_at')}
                error={!!errors.scheduled_at}
                helperText={errors.scheduled_at?.message}
                sx={{ flex: 1 }}
              />
            </Box>
            
            {selectedType === 'meeting' && (
              <TextField
                fullWidth
                label="Meeting Link"
                placeholder="https://zoom.us/j/1234567890"
                {...register('meeting_link')}
                error={!!errors.meeting_link}
                helperText={errors.meeting_link?.message}
              />
            )}
            
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={4}
              placeholder="Add any specific details or agenda for this follow-up..."
              {...register('notes')}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />
            
            {/* Hidden field for lead_id when passed as prop */}
            {(leadId || initialData) && <input type="hidden" {...register('lead_id')} />}
          </Box>
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
