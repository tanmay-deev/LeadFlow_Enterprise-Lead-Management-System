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
  Button
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
      <Grid item xs={12} sm={6}>
        <Typography color="text.secondary">Name</Typography>
        <Typography>{lead.contact_name}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography color="text.secondary">Email</Typography>
        <Typography>{lead.email}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography color="text.secondary">Phone</Typography>
        <Typography>{lead.phone || 'N/A'}</Typography>
      </Grid>
      <Grid item xs={12} sm={6}>
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

  if (isLoading) return <CircularProgress />;
  if (isError) return <Typography color="error">Error loading lead details.</Typography>;

  const lead = data?.data;

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/leads')} sx={{ mb: 2 }}>
        Back to Leads
      </Button>
      
      <Grid container spacing={3}>
        {/* Left Side: Main Content Tabs */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%', mb: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Overview" />
                <Tab label="Timeline" />
                <Tab label="Notes" />
                <Tab label="Documents" />
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

        {/* Right Side: Quick Info & Actions */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Status</Typography>
              <Chip label={lead.status?.name || 'Unknown'} color="primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Assigned User</Typography>
              <Typography>
                {lead.assigned_user ? `${lead.assigned_user.first_name} ${lead.assigned_user.last_name}` : 'Unassigned'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LeadDetails;
