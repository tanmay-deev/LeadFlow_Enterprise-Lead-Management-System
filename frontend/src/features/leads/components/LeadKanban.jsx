import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Chip, Skeleton } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { leadStatuses, getStatusStyle } from '../../../constants/leadConstants';

const LeadKanban = ({ leads, onDragEnd, isLoading }) => {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({});

  useEffect(() => {
    // Group leads by status
    const grouped = leadStatuses.reduce((acc, status) => {
      acc[status.id] = leads.filter(lead => lead.status_id === status.id);
      return acc;
    }, {});
    // ensure Attempted Contact, Interested, etc. fall somewhere or we only show main statuses
    // For now stick to standard 6 statuses defined here
    setColumns(grouped);
  }, [leads]);

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same place
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumnId = parseInt(source.droppableId);
    const destColumnId = parseInt(destination.droppableId);
    
    // Optimistic UI Update
    const sourceClone = Array.from(columns[sourceColumnId] || []);
    const destClone = Array.from(columns[destColumnId] || []);
    const [movedLead] = sourceClone.splice(source.index, 1);

    if (sourceColumnId === destColumnId) {
      sourceClone.splice(destination.index, 0, movedLead);
      setColumns({
        ...columns,
        [sourceColumnId]: sourceClone
      });
    } else {
      // Create a new lead object with the updated status
      const updatedLead = { ...movedLead, status_id: destColumnId, status: leadStatuses.find(s => s.id === destColumnId) };
      destClone.splice(destination.index, 0, updatedLead);
      setColumns({
        ...columns,
        [sourceColumnId]: sourceClone,
        [destColumnId]: destClone
      });
    }

    // Call the parent handler to sync with backend
    onDragEnd(parseInt(draggableId), destColumnId);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, minHeight: 'calc(100vh - 300px)', scrollbarWidth: 'thin' }}>
        {leadStatuses.map((status) => (
          <Box key={status.id} sx={{ minWidth: 320, width: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8b949e', fontSize: '0.75rem' }}>
                {status.name}
              </Typography>
              <Chip label={columns[status.id]?.length || 0} size="small" sx={{ fontWeight: 700, bgcolor: getStatusStyle(status.name).bg, color: getStatusStyle(status.name).color, border: getStatusStyle(status.name).border }} />
            </Box>

            <Droppable droppableId={status.id.toString()}>
              {(provided, snapshot) => (
                <Box
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{
                    flexGrow: 1,
                    minHeight: 150,
                    bgcolor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                    borderRadius: 2,
                    p: 1,
                    transition: 'background-color 0.2s ease',
                    border: '1px dashed',
                    borderColor: snapshot.isDraggingOver ? getStatusStyle(status.name).color : 'transparent'
                  }}
                >
                  {isLoading ? (
                    Array.from(new Array(3)).map((_, index) => (
                      <Paper key={`skeleton-${index}`} sx={{ p: 2, mb: 2, border: '1px solid #30363d', borderRadius: 2, bgcolor: '#161b22' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#30363d' }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton variant="text" width="80%" sx={{ bgcolor: '#30363d' }} />
                            <Skeleton variant="text" width="50%" sx={{ bgcolor: '#30363d' }} />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Skeleton variant="text" width="30%" sx={{ bgcolor: '#30363d' }} />
                          <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: '#30363d' }} />
                        </Box>
                      </Paper>
                    ))
                  ) : (
                    columns[status.id]?.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <Paper
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          sx={{
                            p: 2,
                            mb: 2,
                            border: '1px solid',
                            borderColor: snapshot.isDragging ? status.color : '#30363d',
                            borderRadius: '8px',
                            boxShadow: snapshot.isDragging ? '0 10px 15px -3px rgba(0,0,0,0.3)' : '0 4px 6px -1px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            bgcolor: '#161b22',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              borderColor: '#8b949e',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#1e3a8a', color: '#60a5fa', fontSize: '0.75rem', fontWeight: 700 }}>
                              {lead.contact_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lead.contact_name}
                              </Typography>
                              <Typography variant="caption" sx={{ display: 'block', color: '#8b949e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {lead.company_name || 'No Company'}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#8b949e', fontWeight: 500 }}>
                              {format(new Date(lead.created_at), 'MMM dd')}
                            </Typography>
                            {lead.assigned_user && (
                              <Avatar 
                                sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#7c2d12', color: '#fb923c', fontWeight: 700 }}
                                title={`${lead.assigned_user.first_name} ${lead.assigned_user.last_name}`}
                              >
                                {lead.assigned_user.first_name.charAt(0).toUpperCase()}
                              </Avatar>
                            )}
                          </Box>
                        </Paper>
                      )}
                    </Draggable>
                  ))
                  )}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </Box>
        ))}
      </Box>
    </DragDropContext>
  );
};

export default LeadKanban;
