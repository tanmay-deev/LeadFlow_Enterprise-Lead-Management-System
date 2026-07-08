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
    <Box>
      <Typography variant="h6" gutterBottom>Documents</Typography>
      
      <Paper sx={{ p: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }} variant="outlined">
        <input
          type="file"
          id="document-upload"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="document-upload">
          <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />}>
            Choose File
          </Button>
        </label>
        <Typography variant="body2">{file ? file.name : 'No file selected'}</Typography>
        <Button 
          variant="contained" 
          onClick={handleUpload} 
          disabled={!file || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </Paper>

      {documents.length === 0 ? (
        <Typography color="text.secondary">No documents uploaded.</Typography>
      ) : (
        <List>
          {documents.map(doc => (
            <Paper key={doc.id} sx={{ mb: 1 }} variant="outlined">
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton component="a" href={doc.file_url} target="_blank" color="primary">
                      <DownloadIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(doc.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={doc.file_name}
                  secondary={`Uploaded by ${doc.user?.first_name || 'User'} on ${format(new Date(doc.created_at), 'MMM dd, yyyy')}`}
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
