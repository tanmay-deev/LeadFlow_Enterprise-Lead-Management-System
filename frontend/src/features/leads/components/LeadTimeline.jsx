import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { useQuery } from '@tanstack/react-query';
import { fetchLeadTimeline } from '../../../api/leadApi';
import { format } from 'date-fns';
import { AddCircle, NoteAlt, Description, SwapHoriz, Event, Autorenew } from '@mui/icons-material';

const LeadTimeline = ({ leadId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['leadTimeline', leadId],
    queryFn: () => fetchLeadTimeline(leadId),
  });

  if (isLoading) return <CircularProgress />;

  const timelineEvents = data?.data || [];

  const getEventIcon = (type) => {
    switch(type) {
      case 'created': return <AddCircle fontSize="small" />;
      case 'note_added': return <NoteAlt fontSize="small" />;
      case 'document_uploaded': return <Description fontSize="small" />;
      case 'status_changed': return <SwapHoriz fontSize="small" />;
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
      case 'status_changed': return 'warning';
      case 'followup_scheduled': return 'primary';
      default: return 'grey';
    }
  };

  if (timelineEvents.length === 0) {
    return <Typography color="text.secondary">No activity recorded for this lead yet.</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>Timeline & Activity</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Timeline position="alternate">
          {timelineEvents.map((event, index) => (
            <TimelineItem key={event.id || index}>
              <TimelineOppositeContent color="text.secondary" sx={{ m: 'auto 0' }}>
                {format(new Date(event.created_at), 'MMM dd, yyyy HH:mm')}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector />
                <TimelineDot color={getEventColor(event.type)}>
                  {getEventIcon(event.type)}
                </TimelineDot>
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2 }}>
                <Typography variant="subtitle1" component="span">
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Paper>
    </Box>
  );
};

export default LeadTimeline;
