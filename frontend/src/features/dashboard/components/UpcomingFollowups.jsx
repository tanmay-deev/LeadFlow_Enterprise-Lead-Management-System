import React from 'react';
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingFollowups } from '../../../api/dashboardApi';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Event as EventIcon } from '@mui/icons-material';

const UpcomingFollowups = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['upcomingFollowups'],
    queryFn: fetchUpcomingFollowups,
  });

  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  const followups = data?.data || [];

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return <Chip label="Today" color="error" size="small" />;
    if (isTomorrow(date)) return <Chip label="Tomorrow" color="warning" size="small" />;
    if (isPast(date)) return <Chip label="Overdue" color="default" size="small" />;
    return <Chip label={format(date, 'MMM dd')} color="primary" size="small" />;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
          Upcoming Follow-ups
        </Typography>
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {followups.length > 0 ? (
            followups.map((followup) => (
              <ListItem key={followup.id} alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <EventIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">
                        {followup.lead?.contact_name || 'Unknown Lead'}
                      </Typography>
                      {getDateLabel(followup.scheduled_at)}
                    </Box>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {followup.type.charAt(0).toUpperCase() + followup.type.slice(1)}
                      </Typography>
                      {` — ${format(new Date(followup.scheduled_at), 'hh:mm a')}`}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {followup.notes && followup.notes.length > 30 ? `${followup.notes.substring(0, 30)}...` : followup.notes}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">No upcoming follow-ups.</Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default UpcomingFollowups;
