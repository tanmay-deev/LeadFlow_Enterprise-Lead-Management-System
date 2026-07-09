import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingFollowups } from '../../../api/dashboardApi';
import { format, isPast } from 'date-fns';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';

const UpcomingFollowups = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['upcomingFollowups'],
    queryFn: fetchUpcomingFollowups,
  });

  const getIcon = (type) => {
    switch (type) {
      case 'call': return <CallIcon sx={{ fontSize: 12, color: 'primary.contrastText' }} />;
      case 'meeting': return <VideocamIcon sx={{ fontSize: 12, color: 'secondary.contrastText' }} />;
      case 'email': return <EmailIcon sx={{ fontSize: 12, color: 'success.contrastText' }} />;
      default: return <EventIcon sx={{ fontSize: 12, color: 'primary.contrastText' }} />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'call': return 'primary';
      case 'meeting': return 'secondary';
      case 'email': return 'success';
      default: return 'primary';
    }
  };

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 700 }}>
              Today's Agenda
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
             {Array.from(new Array(4)).map((_, i) => (
                <Box key={i}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
             ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  const followups = data?.data || [];

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#e6edf3', fontWeight: 700, fontSize: '0.875rem' }}>
            Today's Agenda
          </Typography>
          <Chip 
            label={`${followups.length} Tasks`} 
            size="small" 
            sx={{ bgcolor: 'action.hover', color: 'text.secondary', fontWeight: 700, borderRadius: 1 }} 
          />
        </Box>

        {followups.length > 0 ? (
          <Box 
            sx={{ 
              position: 'relative', 
              pl: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 11,
                top: 8,
                bottom: 8,
                width: 2,
                bgcolor: 'divider'
              }
            }}
          >
            {followups.map((followup, index) => {
              const color = getColor(followup.type);
              const isDone = isPast(new Date(followup.scheduled_at));
              
              return (
                <Box key={followup.id} sx={{ position: 'relative' }}>
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      left: -44, 
                      top: 4, 
                      width: 24, 
                      height: 24, 
                      bgcolor: isDone ? 'divider' : `${color}.main`, 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '4px solid',
                      borderColor: 'background.paper',
                      zIndex: 1
                    }}
                  >
                    {getIcon(followup.type)}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700, 
                      color: isDone ? 'text.disabled' : 'text.primary',
                      textDecoration: isDone ? 'line-through' : 'none'
                    }}
                  >
                    {followup.type.charAt(0).toUpperCase() + followup.type.slice(1)} - {followup.lead?.contact_name || 'Unknown Lead'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
                    {format(new Date(followup.scheduled_at), 'hh:mm a')}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">No upcoming tasks.</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingFollowups;
