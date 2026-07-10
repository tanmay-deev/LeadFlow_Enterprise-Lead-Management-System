import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, List, ListItem, ListItemText, IconButton, Paper } from '@mui/material';
import { Download as DownloadIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeadDocuments, uploadLeadDocument, deleteLeadDocument } from '../../../api/leadApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const LeadDocuments = ({ leadId }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['leadDocuments', leadId],
    queryFn: () => fetchLeadDocuments(leadId),
  });

  const uploadMutation = useMutation({
    mutationFn: (selectedFile) => uploadLeadDocument({ id: leadId, file: selectedFile }),
    onSuccess: () => {
      queryClient.invalidateQueries(['leadDocuments', leadId]);
      setFile(null);
      toast.success('Document uploaded');
    },
    onError: () => toast.error('Failed to upload document')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLeadDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['leadDocuments', leadId]);
      toast.success('Document deleted');
    }
  });

  const handleUpload = () => {
    if (!file) return;
    uploadMutation.mutate(file);
  };

  const handleDelete = (docId) => {
    if(window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(docId);
    }
  };

  if (isLoading) return <CircularProgress />;

  const documents = data?.data || [];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" sx={{ color: '#e6edf3', fontWeight: 600, mb: 3 }}>Documents</Typography>
      
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 3, 
        bgcolor: 'rgba(255,255,255,0.02)', 
        border: '1px dashed #30363d', 
        borderRadius: '8px' 
      }}>
        <input
          type="file"
          id="document-upload"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="document-upload">
          <Button 
            variant="outlined" 
            component="span" 
            startIcon={<CloudUploadIcon />}
            sx={{ 
              borderColor: '#30363d', 
              color: '#c9d1d9', 
              textTransform: 'none',
              '&:hover': { borderColor: '#8b949e', bgcolor: 'rgba(255,255,255,0.05)' } 
            }}
          >
            Choose File
          </Button>
        </label>
        <Typography variant="body2" sx={{ color: file ? '#c9d1d9' : '#8b949e', flexGrow: 1 }}>
          {file ? file.name : 'No file selected'}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleUpload} 
          disabled={!file || uploadMutation.isPending}
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
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </Paper>

      {documents.length === 0 ? (
        <Typography sx={{ color: '#8b949e', fontStyle: 'italic', p: 2 }}>No documents uploaded.</Typography>
      ) : (
        <List sx={{ p: 0 }}>
          {documents.map(doc => (
            <Paper key={doc.id} sx={{ mb: 1.5, bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '8px' }}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton component="a" href={doc.file_url} target="_blank" sx={{ color: '#60a5fa', mr: 1, '&:hover': { bgcolor: 'rgba(96, 165, 250, 0.1)' } }}>
                      <DownloadIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(doc.id)} sx={{ color: '#f87171', '&:hover': { bgcolor: 'rgba(248, 113, 113, 0.1)' } }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={<Typography sx={{ color: '#c9d1d9', fontWeight: 500 }}>{doc.file_name}</Typography>}
                  secondary={
                    <Typography variant="caption" sx={{ color: '#8b949e' }}>
                      Uploaded by {doc.user?.first_name || 'User'} on {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                    </Typography>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default LeadDocuments;
