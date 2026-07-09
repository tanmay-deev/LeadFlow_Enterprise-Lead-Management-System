import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent, timelineOppositeContentClasses } from '@mui/lab';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentActivities } from '../../../api/dashboardApi';
import { format } from 'date-fns';
import { AddCircle, NoteAlt, Description, SwapHoriz, Event, Autorenew } from '@mui/icons-material';

const RecentActivities = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['recentActivities'],
    queryFn: fetchRecentActivities,
  });

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 700 }}>
            Recent Activity
          </Typography>
          <Timeline 
            sx={{ 
              p: 0, 
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0.2,
                pl: 0
              }
            }}
          >
            {Array.from(new Array(3)).map((_, index) => (
              <TimelineItem key={`skeleton-${index}`}>
                <TimelineOppositeContent sx={{ mt: 0.5 }}>
                  <Skeleton variant="text" width={40} />
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot sx={{ bgcolor: 'grey.300', boxShadow: 'none' }} />
                  {index < 2 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </CardContent>
      </Card>
    );
  }

  const activities = data?.data || [];

  const getEventIcon = (type) => {
    switch(type) {
      case 'created': return <AddCircle fontSize="small" />;
      case 'note_added': return <NoteAlt fontSize="small" />;
      case 'document_uploaded': return <Description fontSize="small" />;
      case 'status_updated': return <SwapHoriz fontSize="small" />;
      case 'followup_scheduled': return <Event fontSize="small" />;
      case 'updated': return <Autorenew fontSize="small" />;
      default: return <AddCircle fontSize="small" />;
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'created': return 'success';
      case 'note_added': return 'info';
      case 'document_uploaded': return 'secondary';
      case 'status_updated': return 'warning';
      case 'followup_scheduled': return 'primary';
      default: return 'grey';
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.primary" sx={{ mb: 2, fontWeight: 700 }}>
          Recent Activity
        </Typography>
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto', maxHeight: 350 }}>
          {activities.length > 0 ? (
            <Timeline 
              sx={{ 
                p: 0, 
                [`& .${timelineOppositeContentClasses.root}`]: {
                  flex: 0.2,
                  pl: 0
                }
              }}
            >
              {activities.map((activity) => (
                <TimelineItem key={activity.id}>
                  <TimelineOppositeContent color="text.secondary" variant="caption" sx={{ mt: 0.5 }}>
                    {format(new Date(activity.created_at), 'MMM dd')}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getEventColor(activity.action)} variant="outlined" sx={{ borderWidth: 2 }}>
                      {getEventIcon(activity.action)}
                    </TimelineDot>
                    <TimelineConnector sx={{ bgcolor: 'grey.100' }} />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2" component="span">
                      {activity.user?.first_name} {activity.user?.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'inline', ml: 1 }}>
                      {activity.action.replace('_', ' ')}
                    </Typography>
                    {activity.lead && (
                      <Typography variant="body2" color="primary">
                        {activity.lead.contact_name}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <Typography variant="body2" color="text.secondary">No recent activity found.</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
