import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  CircularProgress,
  Grid,
  Chip,
  Button,
  Skeleton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowBack, 
  Email as EmailIcon, 
  Phone as PhoneIcon, 
  Business as BusinessIcon,
  Source as SourceIcon,
  AccessTime as AccessTimeIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fetchLead, assignLead } from '../../api/leadApi';
import { fetchUsers } from '../../api/userApi';

import LeadNotes from './components/LeadNotes';
import LeadDocuments from './components/LeadDocuments';
import LeadTimeline from './components/LeadTimeline';
import FollowupList from '../followups/FollowupList';

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

import { getStatusStyle } from '../../constants/leadConstants';

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => fetchLead(id),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers({ per_page: 100 }),
  });
  
  const assignMutation = useMutation({
    mutationFn: assignLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leadTimeline', id] });
      setAnchorEl(null);
    }
  });

  const handleAssignClick = (event) => setAnchorEl(event.currentTarget);
  const handleAssignClose = () => setAnchorEl(null);
  const handleAssignAgent = (userId) => {
    assignMutation.mutate({ id, assigned_user_id: userId });
  };

  if (isLoading) {
    return (
      <Box>
        <Button startIcon={<ArrowBack />} disabled sx={{ mb: 3, color: '#8b949e' }}>Back to Leads</Button>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>
          <Box sx={{ width: { xs: '100%', md: '30%' }, minWidth: '320px' }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px' }}>
              <Skeleton variant="circular" width={100} height={100} sx={{ bgcolor: '#30363d', mb: 2 }} />
              <Skeleton variant="text" width="80%" height={40} sx={{ bgcolor: '#30363d' }} />
              <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: '#30363d', mb: 3 }} />
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ bgcolor: '#30363d', borderRadius: 2 }} />
            </Paper>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper sx={{ bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', minHeight: 400 }} />
          </Box>
        </Box>
      </Box>
    );
  }
  if (isError) return <Typography color="error">Error loading lead details.</Typography>;

  const lead = data?.data;
  const statusName = lead.status?.name || 'Unknown';
  const statusStyle = getStatusStyle(statusName);

  return (
    <Box>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/leads')} 
        sx={{ mb: 3, color: '#8b949e', '&:hover': { color: '#c9d1d9' } }}
      >
        Back to Leads
      </Button>
      
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>
        {/* Left Column: Profile Card */}
        <Box sx={{ width: { xs: '100%', md: '30%' }, minWidth: '320px' }}>
          <Paper sx={{ p: 0, bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            
            {/* Profile Header section */}
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '1px solid #30363d' }}>
              <Avatar sx={{ width: 100, height: 100, fontSize: '2.5rem', fontWeight: 700, bgcolor: '#1e3a8a', color: '#60a5fa', mb: 2, boxShadow: '0 4px 14px 0 rgba(30, 58, 138, 0.39)' }}>
                {getInitials(lead.contact_name)}
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#e6edf3', letterSpacing: '-0.02em', mb: 1 }}>
                {lead.contact_name}
              </Typography>
              <Box sx={{ 
                display: 'inline-block', 
                px: 2, 
                py: 0.5, 
                bgcolor: statusStyle.bg, 
                color: statusStyle.color, 
                border: statusStyle.border,
                borderRadius: '16px', 
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                mb: 2
              }}>
                {statusName}
              </Box>
            </Box>

            {/* Contact Details section */}
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, mb: 2 }}>
                Contact Information
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <EmailIcon sx={{ color: '#8b949e', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Email Address</Typography>
                    <Typography variant="body2" sx={{ color: '#e6edf3', fontWeight: 500 }}>{lead.email}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <PhoneIcon sx={{ color: '#8b949e', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Phone Number</Typography>
                    <Typography variant="body2" sx={{ color: '#e6edf3', fontWeight: 500 }}>{lead.phone || 'Not provided'}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <BusinessIcon sx={{ color: '#8b949e', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Company</Typography>
                    <Typography variant="body2" sx={{ color: '#e6edf3', fontWeight: 500 }}>{lead.company_name || 'Not provided'}</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#30363d' }} />
              
              <Typography variant="subtitle2" sx={{ color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, mb: 2 }}>
                Lead Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <SourceIcon sx={{ color: '#8b949e', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Source</Typography>
                    <Typography variant="body2" sx={{ color: '#e6edf3', fontWeight: 500 }}>{lead.source?.name || 'Unknown'}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <AccessTimeIcon sx={{ color: '#8b949e', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#8b949e', display: 'block' }}>Created On</Typography>
                    <Typography variant="body2" sx={{ color: '#e6edf3', fontWeight: 500 }}>
                      {format(new Date(lead.created_at), 'MMMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(37, 99, 235, 0.05)', borderRadius: '8px', border: '1px solid rgba(37, 99, 235, 0.2)', position: 'relative' }}>
                  <Typography variant="caption" sx={{ color: '#60a5fa', display: 'block', mb: 0.5 }}>Assigned Agent</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: '#2563eb', color: '#fff' }}>
                      {lead.assigned_user ? lead.assigned_user.first_name.charAt(0) : '?'}
                    </Avatar>
                    <Typography variant="body2" sx={{ color: '#c9d1d9', fontWeight: 600 }}>
                      {lead.assigned_user ? `${lead.assigned_user.first_name} ${lead.assigned_user.last_name}` : 'Unassigned'}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small" 
                    onClick={handleAssignClick}
                    disabled={assignMutation.isPending}
                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#8b949e', '&:hover': { color: '#e6edf3', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleAssignClose}
                    PaperProps={{
                      sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', mt: 1, minWidth: 200 }
                    }}
                  >
                    <MenuItem onClick={() => handleAssignAgent(null)} sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' } }}>
                      <em>Unassigned</em>
                    </MenuItem>
                    {(usersData?.data || []).map((agent) => (
                      <MenuItem 
                        key={agent.id} 
                        onClick={() => handleAssignAgent(agent.id)}
                        selected={lead.assigned_user_id === agent.id}
                        sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' }, '&.Mui-selected': { bgcolor: 'rgba(37, 99, 235, 0.2)' } }}
                      >
                        {agent.first_name} {agent.last_name}
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              </Box>

            </Box>
          </Paper>
        </Box>

        {/* Right Column: Main Content Tabs */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ width: '100%', mb: 2, border: '1px solid #30363d', bgcolor: '#161b22', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Box sx={{ borderBottom: '1px solid #30363d', px: 2, pt: 1 }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                sx={{
                  '& .MuiTabs-indicator': { backgroundColor: '#3b82f6', height: '3px', borderRadius: '3px 3px 0 0' },
                  '& .MuiTab-root': {
                    color: '#8b949e',
                    fontWeight: 600, 
                    textTransform: 'none', 
                    fontSize: '0.95rem',
                    '&.Mui-selected': { color: '#e6edf3' }
                  }
                }}
              >
                <Tab label="Timeline" />
                <Tab label="Notes" />
                <Tab label="Documents" />
                <Tab label="Follow-ups" />
              </Tabs>
            </Box>
            
            <CustomTabPanel value={tabValue} index={0}>
              <LeadTimeline leadId={id} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}>
              <LeadNotes leadId={id} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={2}>
              <LeadDocuments leadId={id} />
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={3}>
              <Box sx={{ mt: 1 }}>
                <FollowupList leadId={id} hideHeader={true} isCardView={true} />
              </Box>
            </CustomTabPanel>
            
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default LeadDetails;
