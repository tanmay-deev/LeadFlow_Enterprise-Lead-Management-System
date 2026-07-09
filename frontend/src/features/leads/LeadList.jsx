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
  InputAdornment,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Skeleton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  ViewList as ViewListIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { fetchLeads, createLead, updateLead, deleteLead, exportLeads, importLeads, updateLeadStatus } from '../../api/leadApi';
import LeadForm from './LeadForm';
import LeadKanban from './components/LeadKanban';

const leadSources = [
  { id: 1, name: 'Website' },
  { id: 2, name: 'Referral' },
  { id: 3, name: 'Cold Call' },
  { id: 4, name: 'Social Media' },
  { id: 5, name: 'Other' },
];

const leadStatuses = [
  { id: 1, name: 'New' },
  { id: 2, name: 'Contacted' },
  { id: 3, name: 'Qualified' },
  { id: 4, name: 'Proposal Sent' },
  { id: 5, name: 'Won' },
  { id: 6, name: 'Lost' },
];

const LeadList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const fileInputRef = React.useRef(null);

  // Fetch Leads
  const { data, isLoading } = useQuery({
    queryKey: ['leads', { page, search, statusFilter, sourceFilter, viewMode }],
    queryFn: () => fetchLeads({ 
      page, 
      search, 
      status_id: statusFilter, 
      source_id: sourceFilter, 
      per_page: viewMode === 'kanban' ? 100 : 15 
    }),
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

  const updateStatusMutation = useMutation({
    mutationFn: updateLeadStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update status')
  });

  const handleDragEnd = (leadId, newStatusId) => {
    updateStatusMutation.mutate({ id: leadId, status_id: newStatusId });
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" color="text.primary" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
          Leads
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => {
              if (newMode) setViewMode(newMode);
            }}
            size="small"
            sx={{ bgcolor: 'background.paper', display: { xs: 'none', sm: 'flex' } }}
          >
            <ToggleButton value="list" title="List View">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="kanban" title="Kanban Board">
              <DashboardIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
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

      <Paper sx={{ p: 2.5, mb: 3, display: 'flex', gap: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <TextField
          size="small"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
        
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {leadStatuses.map((status) => (
            <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Source"
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Sources</MenuItem>
          {leadSources.map((source) => (
            <MenuItem key={source.id} value={source.id}>{source.name}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {viewMode === 'kanban' ? (
        <LeadKanban leads={leads} onDragEnd={handleDragEnd} isLoading={isLoading} />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contact Name</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton variant="text" width={120} height={20} />
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} height={20} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} height={20} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4 }} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} height={20} /></TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Skeleton variant="circular" width={28} height={28} />
                          <Skeleton variant="circular" width={28} height={28} />
                          <Skeleton variant="circular" width={28} height={28} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">No leads found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id} hover sx={{ '& td': { py: 2 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', color: 'primary.dark', fontSize: '0.875rem' }}>
                            {lead.contact_name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {lead.contact_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                          {lead.company_name || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{lead.email}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{lead.phone || '-'}</TableCell>
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
        </>
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
