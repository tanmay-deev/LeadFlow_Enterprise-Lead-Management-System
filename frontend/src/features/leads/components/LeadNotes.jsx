import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper, Divider, IconButton } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeadNotes, createLeadNote, updateLeadNote, deleteLeadNote } from '../../../api/leadApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon, Check as CheckIcon } from '@mui/icons-material';

const LeadNotes = ({ leadId }) => {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['leadNotes', leadId],
    queryFn: () => fetchLeadNotes(leadId),
  });

  const createMutation = useMutation({
    mutationFn: (noteStr) => createLeadNote({ id: leadId, note: noteStr }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leadNotes', leadId]);
      setNewNote('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, note }) => updateLeadNote({ id, note }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leadNotes', leadId]);
      setEditingNoteId(null);
      setEditNoteContent('');
      toast.success('Note updated');
    },
    onError: () => toast.error('Failed to update note')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteLeadNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['leadNotes', leadId]);
      toast.success('Note deleted');
    },
    onError: () => toast.error('Failed to delete note')
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    createMutation.mutate(newNote);
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditNoteContent(note.note);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  const handleSaveEdit = (id) => {
    if (!editNoteContent.trim()) return;
    updateMutation.mutate({ id, note: editNoteContent });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <CircularProgress />;

  const notes = data?.data || [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ color: '#e6edf3', fontWeight: 600, mb: 3 }}>Notes</Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Type a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#c9d1d9',
              bgcolor: 'rgba(255,255,255,0.02)',
              '& fieldset': { borderColor: '#30363d' },
              '&:hover fieldset': { borderColor: '#8b949e' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            }
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleAddNote} 
          disabled={!newNote.trim() || createMutation.isPending}
          sx={{ 
            bgcolor: '#2563eb', 
            color: '#fff',
            '&:hover': { bgcolor: '#1d4ed8' },
            boxShadow: '0 0 10px rgba(37,99,235,0.3)',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          {createMutation.isPending ? 'Adding...' : 'Add Note'}
        </Button>
      </Box>

      {notes.length === 0 ? (
        <Typography sx={{ color: '#8b949e', fontStyle: 'italic', p: 2 }}>No notes found for this lead.</Typography>
      ) : (
        notes.map(note => (
          <Paper key={note.id} sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid #30363d', borderRadius: '8px', position: 'relative' }}>
            
            {editingNoteId === note.id ? (
              <Box>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={editNoteContent}
                  onChange={(e) => setEditNoteContent(e.target.value)}
                  sx={{ 
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#c9d1d9',
                      bgcolor: '#161b22',
                      '& fieldset': { borderColor: '#30363d' },
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" color="inherit" onClick={handleCancelEdit} disabled={updateMutation.isPending} sx={{ color: '#8b949e', borderColor: '#30363d', textTransform: 'none' }}>Cancel</Button>
                  <Button size="small" variant="contained" color="primary" onClick={() => handleSaveEdit(note.id)} disabled={!editNoteContent.trim() || updateMutation.isPending} sx={{ textTransform: 'none' }}>Save</Button>
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap', color: '#c9d1d9' }}>{note.note}</Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, ml: 2 }}>
                    <IconButton size="small" onClick={() => handleStartEdit(note)} sx={{ color: '#8b949e', '&:hover': { color: '#3b82f6', bgcolor: 'rgba(59,130,246,0.1)' } }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDelete(note.id)} disabled={deleteMutation.isPending} sx={{ color: '#8b949e', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)' } }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Divider sx={{ my: 1.5, borderColor: '#30363d' }} />
                <Typography variant="caption" sx={{ color: '#8b949e' }}>
                  Added by <Box component="span" sx={{ color: '#e6edf3', fontWeight: 500 }}>{note.user?.first_name} {note.user?.last_name}</Box> on {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </>
            )}
          </Paper>
        ))
      )}
    </Box>
  );
};

export default LeadNotes;
