import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Pagination,
  IconButton,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { fetchLeads, createLead, updateLead, deleteLead, exportLeads, importLeads } from '../../api/leadApi';
import LeadForm from './LeadForm';

const LeadList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const fileInputRef = React.useRef(null);

  // Fetch Leads
  const { data, isLoading } = useQuery({
    queryKey: ['leads', { page, search }],
    queryFn: () => fetchLeads({ page, search }),
    keepPreviousData: true,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead created successfully');
      setIsFormOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create lead')
  });

  const updateMutation = useMutation({
    mutationFn: updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead updated successfully');
      setIsFormOpen(false);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update lead')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead deleted successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete lead')
  });

  const importMutation = useMutation({
    mutationFn: importLeads,
    onSuccess: (res) => {
      queryClient.invalidateQueries(['leads']);
      toast.success(res.message || 'Leads imported successfully');
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to import leads');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  const handleExport = async () => {
    try {
      const blob = await exportLeads({ search });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${format(new Date(), 'yyyy_MM_dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      toast.error('Failed to export leads');
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    importMutation.mutate(formData);
  };

  const handleOpenForm = (lead = null) => {
    setSelectedLead(lead);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedLead(null);
    setIsFormOpen(false);
  };

  const handleSubmitForm = (formData) => {
    if (selectedLead) {
      updateMutation.mutate({ id: selectedLead.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (statusName) => {
    const map = {
      'New': 'info',
      'Contacted': 'warning',
      'Qualified': 'primary',
      'Won': 'success',
      'Lost': 'error'
    };
    return map[statusName] || 'default';
  };

  const leads = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h3" color="text.primary">Leads</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button 
            variant="outlined" 
            color="primary" 
            startIcon={importMutation.isPending ? <CircularProgress size={20} /> : <ImportIcon />}
            onClick={() => fileInputRef.current?.click()}
            disabled={importMutation.isPending}
          >
            Import
          </Button>
          <input 
            type="file" 
            accept=".csv,.txt" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            New Lead
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, bgcolor: 'background.paper' }}>
        <TextField
          size="small"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        {/* Additional filters can go here */}
      </Paper>

      <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{lead.contact_name}</TableCell>
                  <TableCell>{lead.company_name || '-'}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={lead.status?.name || 'Unknown'} 
                      color={getStatusColor(lead.status?.name)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{lead.source?.name || 'Unknown'}</TableCell>
                  <TableCell>{format(new Date(lead.created_at), 'MMM dd, yyyy')}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="info" onClick={() => navigate(`/leads/${lead.id}`)} title="View Details">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="primary" onClick={() => handleOpenForm(lead)} title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(lead.id)} title="Delete">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {meta.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={meta.last_page} 
            page={page} 
            onChange={(e, value) => setPage(value)} 
            color="primary" 
          />
        </Box>
      )}

      {/* Form Modal */}
      <LeadForm 
        open={isFormOpen} 
        onClose={handleCloseForm} 
        onSubmit={handleSubmitForm}
        initialData={selectedLead}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </Box>
  );
};

export default LeadList;
