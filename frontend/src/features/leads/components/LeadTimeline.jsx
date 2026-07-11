import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchLeadTimeline } from '../../../api/leadApi';
import { format } from 'date-fns';
import { AddCircle, NoteAlt, Description, SwapHoriz, Event, Autorenew, ExpandMore } from '@mui/icons-material';
import { leadStatuses } from '../../../constants/leadConstants';

const LeadTimeline = ({ leadId }) => {
  const [visibleCount, setVisibleCount] = useState(8);

  const { data, isLoading } = useQuery({
    queryKey: ['leadTimeline', leadId],
    queryFn: () => fetchLeadTimeline(leadId),
  });

  if (isLoading) return <CircularProgress />;

  const timelineEvents = data?.data || [];
  const visibleEvents = timelineEvents.slice(0, visibleCount);

  const getEventIcon = (type) => {
    switch(type) {
      case 'created': return <AddCircle sx={{ fontSize: 18 }} />;
      case 'note_added': 
      case 'note_updated': return <NoteAlt sx={{ fontSize: 18 }} />;
      case 'document_uploaded': return <Description sx={{ fontSize: 18 }} />;
      case 'status_changed': return <SwapHoriz sx={{ fontSize: 18 }} />;
      case 'followup_scheduled': 
      case 'followup_created': 
      case 'followup_updated': return <Event sx={{ fontSize: 18 }} />;
      case 'updated': return <Autorenew sx={{ fontSize: 18 }} />;
      default: return <AddCircle sx={{ fontSize: 18 }} />;
    }
  };

  const getEventBgColor = (type) => {
    switch(type) {
      case 'created': return '#059669'; // success
      case 'note_added': 
      case 'note_updated': return '#0284c7'; // info
      case 'document_uploaded': return '#9333ea'; // secondary
      case 'status_changed': return '#d97706'; // warning
      case 'followup_scheduled': 
      case 'followup_created': 
      case 'followup_updated': return '#2563eb'; // primary
      default: return '#4b5563'; // grey
    }
  };

  const renderChanges = (action, oldVal, newVal) => {
    if (typeof oldVal !== 'object' && typeof newVal !== 'object' && typeof oldVal !== 'string') {
      return (
        <Typography variant="body2" sx={{ color: '#8b949e', mt: 1 }}>
          {oldVal && <span>From: <strong>{String(oldVal)}</strong> </span>}
          {newVal && <span>To: <strong>{String(newVal)}</strong></span>}
        </Typography>
      );
    }

    let oldObj = {};
    let newObj = {};
    try {
      oldObj = typeof oldVal === 'string' ? JSON.parse(oldVal) : (oldVal || {});
      newObj = typeof newVal === 'string' ? JSON.parse(newVal) : (newVal || {});
    } catch (e) {
      // Not JSON
    }

    // 1. Followups
    if (action === 'followup_scheduled' || action === 'followup_created' || action === 'followup_updated') {
        return (
            <Box sx={{ mt: 1.5, p: 2, bgcolor: 'rgba(37,99,235,0.05)', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.2)' }}>
               <Typography variant="body2" sx={{ color: '#c9d1d9', mb: 1 }}>
                 Scheduled a <strong>{newObj.type || 'follow-up'}</strong> for <strong>{newObj.scheduled_at ? format(new Date(newObj.scheduled_at), 'MMM dd, yyyy HH:mm') : ''}</strong>.
               </Typography>
               {newObj.notes && (
                 <Typography variant="body2" sx={{ color: '#8b949e', fontStyle: 'italic', wordBreak: 'break-word', pl: 1.5, borderLeft: '2px solid rgba(37,99,235,0.4)' }}>
                   "{newObj.notes}"
                 </Typography>
               )}
            </Box>
        );
    }

    // 2. Documents
    if (action === 'document_uploaded') {
        return (
            <Box sx={{ mt: 1.5, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 2 }}>
               <Description sx={{ color: '#8b949e', fontSize: 28 }} />
               <Box>
                 <Typography variant="body2" sx={{ color: '#c9d1d9', fontWeight: 600, wordBreak: 'break-word' }}>{newObj.file_name || 'Document'}</Typography>
                 {newObj.file_size && <Typography variant="caption" sx={{ color: '#8b949e' }}>{(newObj.file_size / 1024).toFixed(1)} KB</Typography>}
               </Box>
            </Box>
        );
    }

    // 3. Status
    if (action === 'status_changed') {
        const getStatusName = (id) => leadStatuses.find(s => s.id === parseInt(id))?.name || id;
        return (
            <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'rgba(245,158,11,0.05)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)' }}>
               <Typography variant="body2" sx={{ color: '#c9d1d9' }}>
                 Changed status from <strong style={{ color: '#fbbf24' }}>{getStatusName(oldObj.status_id)}</strong> to <strong style={{ color: '#fbbf24' }}>{getStatusName(newObj.status_id)}</strong>
               </Typography>
            </Box>
        );
    }

    // 4. Notes
    if (action === 'note_added' || action === 'note_updated') {
        if (!newObj.note) return null;
        return (
            <Box sx={{ mt: 1.5, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid #0ea5e9' }}>
               <Typography variant="body2" sx={{ color: '#e6edf3', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                 {newObj.note}
               </Typography>
            </Box>
        );
    }

    // 5. Default diff
    const changes = [];
    if (typeof newObj === 'object') {
        Object.keys(newObj).forEach(key => {
          if (['updated_at', 'created_at', 'id'].includes(key)) return;
          if (oldObj[key] !== newObj[key]) {
            changes.push(
              <Box key={key} sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</span>{' '}
                {oldObj[key] && <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{String(oldObj[key])}</span>}{' '}
                <strong style={{ color: '#c9d1d9' }}>{String(newObj[key])}</strong>
              </Box>
            );
          }
        });
    }

    if (changes.length === 0) return null;

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
      <Typography variant="subtitle1" sx={{ color: '#e6edf3', fontWeight: 600, mb: 4 }}>Timeline & Activity</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {visibleEvents.map((event, index) => {
          const actionType = event.action || event.type;
          const isLast = index === visibleEvents.length - 1;
          
          return (
            <Box key={event.id || index} sx={{ display: 'flex', position: 'relative', pb: isLast ? 0 : 4 }}>
              {/* Vertical connector line */}
              {!isLast && (
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '32px', 
                    left: '15px', 
                    bottom: 0, 
                    width: '2px', 
                    bgcolor: '#30363d',
                    zIndex: 0
                  }} 
                />
              )}
              
              {/* Timeline Dot */}
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  bgcolor: getEventBgColor(actionType), 
                  color: '#fff',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1,
                  border: '4px solid #0d1117' // Matches background to cut into the line
                }}
              >
                {getEventIcon(actionType)}
              </Box>
              
              {/* Content Card */}
              <Box sx={{ flexGrow: 1, pl: { xs: 2, sm: 3 } }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 2, sm: 2.5 }, 
                    bgcolor: 'rgba(255,255,255,0.02)', 
                    border: '1px solid #30363d', 
                    borderRadius: '12px', 
                    transition: 'all 0.2s', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.04)', borderColor: '#4b5563' } 
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#e6edf3', fontWeight: 600, display: 'block', textTransform: 'capitalize' }}>
                    {event.action ? event.action.replace(/_/g, ' ') : 'Activity'}
                  </Typography>
                  
                  {event.action !== 'created' && renderChanges(event.action, event.old_value, event.new_value)}

                  <Typography variant="caption" sx={{ color: '#8b949e', display: 'block', mt: 2 }}>
                    {format(new Date(event.created_at), 'MMM dd, yyyy • HH:mm')}
                    {event.user && ` by ${event.user.first_name} ${event.user.last_name}`}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          );
        })}
      </Box>

      {visibleCount < timelineEvents.length && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <Button 
            variant="outlined" 
            color="inherit" 
            endIcon={<ExpandMore />}
            onClick={() => setVisibleCount(prev => prev + 8)}
            sx={{ color: '#8b949e', borderColor: '#30363d', textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)', borderColor: '#8b949e' } }}
          >
            Load More Activities
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LeadTimeline;
