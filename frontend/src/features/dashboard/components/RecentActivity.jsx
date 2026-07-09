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

const RecentActivity = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: fetchRecentActivities,
  });

  const getIcon = (action) => {
    switch (action) {
      case 'created_followup': return <AddCircleIcon sx={{ fontSize: 16, color: 'primary.contrastText' }} />;
      case 'status_updated': return <CheckCircleIcon sx={{ fontSize: 16, color: 'success.contrastText' }} />;
      case 'lead_created': return <PersonIcon sx={{ fontSize: 16, color: 'secondary.contrastText' }} />;
      case 'lead_assigned': return <AssignmentIndIcon sx={{ fontSize: 16, color: 'warning.contrastText' }} />;
      default: return <HistoryIcon sx={{ fontSize: 16, color: 'info.contrastText' }} />;
    }
  };

  const getColor = (action) => {
    switch (action) {
      case 'created_followup': return 'primary';
      case 'status_updated': return 'success';
      case 'lead_created': return 'secondary';
      case 'lead_assigned': return 'warning';
      default: return 'info';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
              Recent Activity
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             {Array.from(new Array(4)).map((_, i) => (
                <Box key={i}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
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
              pl: 11, // space for time text
              display: 'flex', 
              flexDirection: 'column', 
              gap: 4,
              flexGrow: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 78, // line position
                top: 8,
                bottom: 8,
                width: 1,
                bgcolor: 'divider'
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
                      left: -88, 
                      top: 4, 
                      color: 'text.secondary',
                      width: 65,
                      textAlign: 'right'
                    }}
                  >
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true }).replace('about ', '')}
                  </Typography>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: -48, // circle pos
                      top: 0, 
                      width: 28, 
                      height: 28, 
                      bgcolor: `${color}.main`, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid',
                      borderColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    {getIcon(activity.action)}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                    }}
                  >
                    <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                      {activity.user?.first_name || 'System'}
                    </Box>{' '}
                    {activity.description}{' '}
                    {activity.lead && (
                      <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                        - {activity.lead.contact_name}
                      </Box>
                    )}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No recent activities.</Typography>
        )}

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="text" 
            endIcon={<ArrowForwardIcon />} 
            sx={{ color: 'primary.main', fontWeight: 700 }}
          >
            View All Activity
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
