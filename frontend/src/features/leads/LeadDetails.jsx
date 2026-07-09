import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Skeleton,
  Avatar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowBack } from '@mui/icons-material';
import { fetchLead } from '../../api/leadApi';

import LeadNotes from './components/LeadNotes';
import LeadDocuments from './components/LeadDocuments';
import LeadTimeline from './components/LeadTimeline';

// Overview Component
const LeadOverview = ({ lead }) => (
  <Box>
    <Typography variant="h6">Overview</Typography>
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid xs={12} sm={6}>
        <Typography color="text.secondary">Name</Typography>
        <Typography>{lead.contact_name}</Typography>
      </Grid>
      <Grid xs={12} sm={6}>
        <Typography color="text.secondary">Email</Typography>
        <Typography>{lead.email}</Typography>
      </Grid>
      <Grid xs={12} sm={6}>
        <Typography color="text.secondary">Phone</Typography>
        <Typography>{lead.phone || 'N/A'}</Typography>
      </Grid>
      <Grid xs={12} sm={6}>
        <Typography color="text.secondary">Company</Typography>
        <Typography>{lead.company_name || 'N/A'}</Typography>
      </Grid>
    </Grid>
  </Box>
);

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id),
  });

  if (isLoading) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} disabled sx={{ mb: 2 }}>Back to Leads</Button>
        <Paper sx={{ p: 4, mb: 3, display: 'flex', alignItems: 'center', gap: 3, border: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4 }} />
            <Skeleton variant="text" width={120} />
          </Box>
        </Paper>
        <Paper sx={{ width: '100%', mb: 2, border: '1px solid', borderColor: 'divider', p: 3 }}>
          <Skeleton variant="text" width="60%" height={30} />
          <Skeleton variant="text" width="80%" height={30} />
          <Skeleton variant="text" width="40%" height={30} />
        </Paper>
      </Box>
    );
  }
  if (isError) return <Typography color="error">Error loading lead details.</Typography>;

  const lead = data?.data;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/leads')} sx={{ mb: 2, color: 'text.secondary' }}>
        Back to Leads
      </Button>
      
      {/* Profile Header */}
      <Paper sx={{ p: 4, mb: 3, display: 'flex', alignItems: 'center', gap: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Avatar sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.light', color: 'primary.dark' }}>
          {lead.contact_name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, letterSpacing: '-0.02em' }}>
            {lead.contact_name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            {lead.company_name || 'No Company'} • {lead.email}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Chip label={lead.status?.name || 'Unknown'} color="primary" sx={{ px: 1 }} />
          <Typography variant="caption" color="text.secondary">
            Assigned to: {lead.assigned_user ? `${lead.assigned_user.first_name} ${lead.assigned_user.last_name}` : 'Unassigned'}
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Main Content Tabs */}
        <Grid xs={12}>
          <Paper sx={{ width: '100%', mb: 2, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                slotProps={{ indicator: { style: { height: '3px', borderRadius: '3px 3px 0 0' } } }}
              >
                <Tab label="Overview" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' }} />
                <Tab label="Timeline" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' }} />
                <Tab label="Notes" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' }} />
                <Tab label="Documents" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' }} />
              </Tabs>
            </Box>
            <CustomTabPanel value={tabValue} index={0}>
              <LeadOverview lead={lead} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}>
              <LeadTimeline leadId={id} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={2}>
              <LeadNotes leadId={id} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={3}>
              <LeadDocuments leadId={id} />
            </CustomTabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadDetails;
