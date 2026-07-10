import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentActivities } from '../../../api/dashboardApi';
import { formatDistanceToNow } from 'date-fns';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';

const RecentActivity = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: fetchRecentActivities,
  });

  const getIcon = (action) => {
    switch (action) {
      case 'created_followup': return <AddCircleIcon sx={{ fontSize: 16, color: '#fff' }} />;
      case 'status_updated': return <CheckCircleIcon sx={{ fontSize: 16, color: '#fff' }} />;
      case 'lead_created': return <PersonIcon sx={{ fontSize: 16, color: '#fff' }} />;
      case 'assigned': return <AssignmentIndIcon sx={{ fontSize: 16, color: '#fff' }} />;
      default: return <HistoryIcon sx={{ fontSize: 16, color: '#fff' }} />;
    }
  };

  const getColor = (action) => {
    switch (action) {
      case 'created_followup': return '#2563eb';
      case 'status_updated': return '#22c55e';
      case 'lead_created': return '#a855f7';
      case 'assigned': return '#f97316';
      default: return '#0ea5e9';
    }
  };

  const getActionText = (action) => {
    switch (action) {
      case 'created_followup': return 'created a follow-up for';
      case 'status_updated': return 'updated lead status for';
      case 'lead_created': return 'created a new lead';
      case 'assigned': return 'was assigned a lead';
      case 'created': return 'created a new lead';
      case 'updated': return 'updated details for';
      default: return 'performed an action on';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.875rem' }}>
              Recent Activity
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             {Array.from(new Array(4)).map((_, i) => (
                <Box key={i}>
                  <Skeleton variant="text" width="80%" sx={{ bgcolor: '#30363d' }} />
                  <Skeleton variant="text" width="60%" sx={{ bgcolor: '#30363d' }} />
                </Box>
             ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  const activities = data?.data || [];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.875rem' }}>
            Recent Activity
          </Typography>
        </Box>

        {activities.length > 0 ? (
          <Box 
            sx={{ 
              position: 'relative', 
              pl: '100px', // space for time text
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              flexGrow: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '70px', // line position
                top: 8,
                bottom: 8,
                width: '2px', // FIXED: was 1 (100%)
                bgcolor: '#30363d'
              }
            }}
          >
            {activities.slice(0, 5).map((activity) => {
              const color = getColor(activity.action);
              
              return (
                <Box key={activity.id} sx={{ position: 'relative' }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      position: 'absolute', 
                      left: '-100px', 
                      top: 4, 
                      color: '#8b949e',
                      width: '60px',
                      textAlign: 'right',
                      whiteSpace: 'nowrap' // Prevent text wrapping
                    }}
                  >
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }).replace('about ', '')}
                  </Typography>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: '-44px', // circle pos
                      top: 0, 
                      width: 28, 
                      height: 28, 
                      bgcolor: color, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid #161b22', // FIXED: match card background
                      zIndex: 1
                    }}
                  >
                    {getIcon(activity.action)}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#8b949e',
                      lineHeight: 1.5,
                      mt: 0.5
                    }}
                  >
                    <Box component="span" sx={{ color: '#e6edf3', fontWeight: 600 }}>
                      {activity.user?.first_name || 'System'}
                    </Box>
                    {' '}
                    {getActionText(activity.action)}
                    {' '}
                    {activity.lead && (
                      <Box 
                        onClick={() => navigate(`/leads/${activity.lead.id}`)}
                        component="span" 
                        sx={{ color: '#c9d1d9', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {activity.lead.contact_name}
                      </Box>
                    )}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="#8b949e">No recent activities.</Typography>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="text" 
            onClick={() => navigate('/reports')}
            endIcon={<ArrowForwardIcon />} 
            sx={{ color: '#3b82f6', fontWeight: 700 }}
          >
            View All Activity
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
