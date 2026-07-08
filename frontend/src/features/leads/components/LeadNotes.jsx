import React, { useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Paper, Divider } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeadNotes, createLeadNote } from '../../../api/leadApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const LeadNotes = ({ leadId }) => {
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['leadNotes', leadId],
    queryFn: () => fetchLeadNotes(leadId),
  });

  const createMutation = useMutation({
    mutationFn: (content) => createLeadNote({ id: leadId, content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leadNotes', leadId]);
      setNewNote('');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note')
  });

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    createMutation.mutate(newNote);
  };

  if (isLoading) return <CircularProgress />;

  const notes = data?.data || [];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Notes</Typography>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Type a new note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          onClick={handleAddNote} 
          disabled={!newNote.trim() || createMutation.isPending}
        >
          {createMutation.isPending ? 'Adding...' : 'Add Note'}
        </Button>
      </Box>

      {notes.length === 0 ? (
        <Typography color="text.secondary">No notes found.</Typography>
      ) : (
        notes.map(note => (
          <Paper key={note.id} sx={{ p: 2, mb: 2 }} variant="outlined">
            <Typography variant="body1" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>{note.content}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Added by {note.user?.first_name} {note.user?.last_name} on {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
            </Typography>
          </Paper>
        ))
      )}
    </Box>
  );
};

export default LeadNotes;
