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

  const renderChanges = (oldVal, newVal) => {
    // If they are not objects, just return a simple From/To
    if (typeof oldVal !== 'object' && typeof newVal !== 'object') {
      return (
        <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
          {oldVal && <span>From: <strong>{String(oldVal)}</strong> </span>}
          {newVal && <span>To: <strong>{String(newVal)}</strong></span>}
        </Typography>
      );
    }

    // If they are objects, we diff them to find what changed
    const changes = [];
    const oldObj = typeof oldVal === 'string' ? JSON.parse(oldVal) : (oldVal || {});
    const newObj = typeof newVal === 'string' ? JSON.parse(newVal) : (newVal || {});
    
    // Check keys in newObj that differ from oldObj
    Object.keys(newObj).forEach(key => {
      // Ignore timestamp and system keys
      if (['updated_at', 'created_at', 'id'].includes(key)) return;
      
      if (oldObj[key] !== newObj[key]) {
        changes.push(
          <Box key={key} sx={{ mb: 0.5 }}>
            <span style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}:</span>{' '}
            {oldObj[key] && <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{String(oldObj[key])}</span>}{' '}
            <strong style={{ color: '#c9d1d9' }}>{String(newObj[key])}</strong>
          </Box>
        );
      }
    });

    if (changes.length === 0) {
      return null;
    }

    return (
      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mb: 1, fontWeight: 600 }}>CHANGES:</Typography>
        <Typography variant="body2" component="div" sx={{ color: '#8b949e' }}>
          {changes}
        </Typography>
      </Box>
    );
  };

  if (timelineEvents.length === 0) {
    return <Typography sx={{ color: '#8b949e', fontStyle: 'italic', p: 2 }}>No activity recorded for this lead yet.</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ color: '#e6edf3', fontWeight: 600, mb: 3 }}>Timeline & Activity</Typography>
      <Box sx={{ p: 0 }}>
        <Timeline position="right" sx={{ p: 0, m: 0, '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 } }}>
          {timelineEvents.map((event, index) => (
            <TimelineItem key={event.id || index}>
              <TimelineSeparator>
                <TimelineDot color={getEventColor(event.action || event.type)} sx={{ boxShadow: 'none' }}>
                  {getEventIcon(event.action || event.type)}
                </TimelineDot>
                {index < timelineEvents.length - 1 && <TimelineConnector sx={{ bgcolor: '#30363d' }} />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: '12px', px: 2, pb: 3 }}>
                <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid #30363d', borderRadius: '8px' }}>
                  <Typography variant="subtitle2" sx={{ color: '#c9d1d9', fontWeight: 600, display: 'block', mb: 0.5, textTransform: 'capitalize' }}>
                    {event.action ? event.action.replace('_', ' ') : 'Activity'}
                  </Typography>
                  
                  {event.action !== 'created' && renderChanges(event.old_value, event.new_value)}

                  <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mt: 1 }}>
                    {format(new Date(event.created_at), 'MMM dd, yyyy • HH:mm')}
                    {event.user && ` by ${event.user.first_name} ${event.user.last_name}`}
                  </Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Box>
  );
};

export default LeadTimeline;
