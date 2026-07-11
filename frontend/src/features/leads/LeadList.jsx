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
  Skeleton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  InputLabel,
  FormControl,
  Autocomplete
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
  Dashboard as DashboardIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { fetchLeads, createLead, updateLead, deleteLead, exportLeads, importLeads, updateLeadStatus, assignLead } from '../../api/leadApi';
import { fetchUsers } from '../../api/userApi';
import LeadForm from './LeadForm';
import LeadKanban from './components/LeadKanban';
import { leadSources, leadStatuses, getStatusStyle } from '../../constants/leadConstants';

const LeadList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const isAdmin = ['Super Admin', 'Admin', 'Sales Manager'].includes(user?.role?.name);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const fileInputRef = React.useRef(null);
  
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [activeMenuLead, setActiveMenuLead] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Duplicate detection states
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateStats, setDuplicateStats] = useState({ duplicateCount: 0, newCount: 0 });
  const [pendingImportFile, setPendingImportFile] = useState(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Fetch Leads
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['leads', { page, search, statusFilter, sourceFilter, agentFilter, viewMode }],
    queryFn: () => fetchLeads({ 
      page, 
      search, 
      status_id: statusFilter, 
      source_id: sourceFilter, 
      assigned_user_id: agentFilter,
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

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetchUsers({ per_page: 100 }),
  });
  const agents = usersData?.data || [];

  const assignMutation = useMutation({
    mutationFn: assignLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      setAssignDialogOpen(false);
      toast.success('Agent assigned successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to assign agent')
  });

  const handleActionClick = (event, lead) => {
    setActionAnchorEl(event.currentTarget);
    setActiveMenuLead(lead);
  };

  const handleActionClose = () => {
    setActionAnchorEl(null);
    setActiveMenuLead(null);
  };

  const handleOpenAssignDialog = () => {
    setSelectedAgentId(activeMenuLead?.assigned_user_id || '');
    setAssignDialogOpen(true);
    setActionAnchorEl(null);
  };

  const handleAssignSubmit = () => {
    if (activeMenuLead) {
      assignMutation.mutate({ id: activeMenuLead.id, assigned_user_id: selectedAgentId || null });
    }
  };

  const handleDragEnd = (leadId, newStatusId) => {
    updateStatusMutation.mutate({ id: leadId, status_id: newStatusId });
  };

  const importMutation = useMutation({
    mutationFn: importLeads,
    onSuccess: (res) => {
      if (res.requires_confirmation) {
        setDuplicateStats({
          duplicateCount: res.duplicate_count,
          newCount: res.new_count
        });
        setDuplicateDialogOpen(true);
      } else {
        queryClient.invalidateQueries(['leads']);
        toast.success(res.message || 'Leads imported successfully');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setPendingImportFile(null);
        setDuplicateDialogOpen(false);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to import leads');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setPendingImportFile(null);
      setDuplicateDialogOpen(false);
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
    setPendingImportFile(file);
    const formData = new FormData();
    formData.append('file', file);
    importMutation.mutate(formData);
  };

  const handleDuplicateAction = (action) => {
    if (!pendingImportFile) return;
    const formData = new FormData();
    formData.append('file', pendingImportFile);
    formData.append('duplicate_action', action);
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


  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              '& .MuiToggleButton-root': {
                color: '#8b949e',
                borderColor: '#30363d',
                '&.Mui-selected': {
                  color: '#fff',
                  bgcolor: '#21262d',
                },
                '&:hover': {
                  bgcolor: '#21262d',
                }
              }
            }}
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

      <Paper sx={{ 
        p: 2.5, 
        mb: 3, 
        display: 'flex', 
        gap: 2, 
        bgcolor: '#161b22', 
        border: '1px solid #30363d', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <TextField
          size="small"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ 
            width: 320,
            '& .MuiOutlinedInput-root': {
              color: '#c9d1d9',
              '& fieldset': { borderColor: '#30363d' },
              '&:hover fieldset': { borderColor: '#8b949e' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: '#8b949e' }} />
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
          sx={{ 
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              color: '#c9d1d9',
              '& fieldset': { borderColor: '#30363d' },
              '&:hover fieldset': { borderColor: '#8b949e' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
            '& .MuiInputLabel-root': { color: '#8b949e' },
            '& .MuiSvgIcon-root': { color: '#8b949e' }
          }}
          slotProps={{
            select: {
              MenuProps: {
                PaperProps: {
                  sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }
                }
              }
            }
          }}
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
          sx={{ 
            minWidth: 150,
            '& .MuiOutlinedInput-root': {
              color: '#c9d1d9',
              '& fieldset': { borderColor: '#30363d' },
              '&:hover fieldset': { borderColor: '#8b949e' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
            '& .MuiInputLabel-root': { color: '#8b949e' },
            '& .MuiSvgIcon-root': { color: '#8b949e' }
          }}
          slotProps={{
            select: {
              MenuProps: {
                PaperProps: {
                  sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }
                }
              }
            }
          }}
        >
          <MenuItem value="">All Sources</MenuItem>
          {leadSources.map((source) => (
            <MenuItem key={source.id} value={source.id}>{source.name}</MenuItem>
          ))}
        </TextField>

        {isAdmin && (
          <Autocomplete
            options={agents}
            getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
            value={agents.find(a => a.id === agentFilter) || null}
            onChange={(event, newValue) => {
              setAgentFilter(newValue ? newValue.id : '');
              setPage(1);
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                placeholder="Agent"
                size="small"
                sx={{ 
                  minWidth: 150, 
                  bgcolor: '#161b22', 
                  borderRadius: '8px', 
                  '& .MuiOutlinedInput-root': { 
                    color: '#c9d1d9', 
                    '& fieldset': { borderColor: '#30363d' },
                    '&:hover fieldset': { borderColor: '#8b949e' },
                    '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
                  } 
                }} 
              />
            )}
            PaperComponent={({ children }) => (
              <Paper sx={{ bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9' }}>{children}</Paper>
            )}
          />
        )}
      </Paper>

      {viewMode === 'kanban' ? (
        <LeadKanban leads={leads} onDragEnd={handleDragEnd} isLoading={isLoading} />
      ) : (
        <>
          <TableContainer component={Paper} sx={{ bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Name</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assigned To</TableCell>
                  <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</TableCell>
                  <TableCell align="right" sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from(new Array(5)).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#30363d' }} />
                          <Skeleton variant="text" width={120} height={20} sx={{ bgcolor: '#30363d' }} />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#30363d' }} /></TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={150} height={20} sx={{ bgcolor: '#30363d' }} /></TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#30363d' }} /></TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 4, bgcolor: '#30363d' }} /></TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={80} height={20} sx={{ bgcolor: '#30363d' }} /></TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={100} height={20} sx={{ bgcolor: '#30363d' }} /></TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={80} height={20} sx={{ bgcolor: '#30363d' }} /></TableCell>
                      <TableCell align="right" sx={{ borderBottom: '1px solid #30363d' }}>
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: '#30363d' }} />
                          <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: '#30363d' }} />
                          <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: '#30363d' }} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                      <Typography variant="body1" sx={{ color: '#8b949e' }}>No leads found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => {
                    const statusName = lead.status?.name || 'New';
                    const statusStyle = getStatusStyle(statusName);
                    
                    return (
                      <TableRow key={lead.id} sx={{ '&:hover': { bgcolor: '#21262d' } }}>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#1e3a8a', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                              {getInitials(lead.contact_name)}
                            </Box>
                            <Typography 
                              onClick={() => navigate(`/leads/${lead.id}`)}
                              sx={{ 
                                color: '#e6edf3', 
                                fontSize: '0.875rem', 
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': { color: '#3b82f6', textDecoration: 'underline' }
                              }}
                            >
                              {lead.contact_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                          <Typography sx={{ color: '#c9d1d9', fontSize: '0.875rem' }}>
                            {lead.company_name || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.875rem' }}>{lead.email}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.875rem' }}>{lead.phone || '-'}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                          <Box sx={{ 
                            display: 'inline-block', 
                            px: 1.5, 
                            py: 0.25, 
                            bgcolor: statusStyle.bg, 
                            color: statusStyle.color, 
                            border: statusStyle.border,
                            borderRadius: '12px', 
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textTransform: 'uppercase'
                          }}>
                            {statusName}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.875rem' }}>{lead.source?.name || 'Unknown'}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                          {lead.assigned_user ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: '#1f2937', color: '#9ca3af', fontWeight: 600 }}>
                                {lead.assigned_user.first_name[0].toUpperCase()}
                              </Avatar>
                              <Typography sx={{ color: '#c9d1d9', fontSize: '0.875rem' }}>
                                {lead.assigned_user.first_name} {lead.assigned_user.last_name}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ color: '#8b949e', fontSize: '0.875rem', fontStyle: 'italic' }}>Unassigned</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ borderBottom: '1px solid #30363d', py: 2, color: '#c9d1d9', fontSize: '0.875rem' }}>{format(new Date(lead.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid #30363d', py: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleActionClick(e, lead)} 
                              sx={{ color: '#8b949e', '&:hover': { color: '#c9d1d9', bgcolor: 'rgba(255,255,255,0.1)' } }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
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
                sx={{
                  '& .MuiPaginationItem-root': {
                    color: '#c9d1d9',
                    borderColor: '#30363d',
                    '&.Mui-selected': {
                      bgcolor: '#2563eb',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#1d4ed8',
                      }
                    },
                    '&:hover': {
                      bgcolor: '#21262d',
                    }
                  }
                }}
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
      {/* Action Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleActionClose}
        PaperProps={{
          sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', minWidth: 160, mt: 0.5 }
        }}
      >
        <MenuItem onClick={() => { navigate(`/leads/${activeMenuLead?.id}`); handleActionClose(); }} sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' } }}>
          <VisibilityIcon sx={{ fontSize: 18, mr: 1.5, color: '#8b949e' }} /> View Details
        </MenuItem>
        <MenuItem onClick={() => { handleOpenForm(activeMenuLead); handleActionClose(); }} sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' } }}>
          <EditIcon sx={{ fontSize: 18, mr: 1.5, color: '#3b82f6' }} /> Edit Lead
        </MenuItem>
        {isAdmin && (
          <MenuItem onClick={handleOpenAssignDialog} sx={{ fontSize: '0.875rem', '&:hover': { bgcolor: '#21262d' } }}>
            <PersonAddIcon sx={{ fontSize: 18, mr: 1.5, color: '#a855f7' }} /> Assign Agent
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleDelete(activeMenuLead?.id); handleActionClose(); }} sx={{ fontSize: '0.875rem', color: '#ef4444', '&:hover': { bgcolor: '#21262d' } }}>
          <DeleteIcon sx={{ fontSize: 18, mr: 1.5 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Assign Agent Dialog */}
      <Dialog 
        open={assignDialogOpen} 
        onClose={() => setAssignDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#e6edf3', width: '100%', maxWidth: 400, borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #30363d', fontSize: '1.25rem', fontWeight: 600, bgcolor: '#0d1117', p: 3 }}>Assign Agent</DialogTitle>
        <DialogContent sx={{ p: '24px !important', bgcolor: '#161b22' }}>
          <Typography variant="body2" sx={{ color: '#8b949e', mb: 3 }}>
            Select a team member below to assign them ownership of this lead. They will be notified automatically.
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="agent-select-label" sx={{ color: '#8b949e', '&.Mui-focused': { color: '#3b82f6' } }}>Select Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              label="Select Agent"
              sx={{
                color: '#e6edf3',
                bgcolor: '#0d1117',
                borderRadius: '8px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#30363d' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8b949e' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                '& .MuiSvgIcon-root': { color: '#8b949e' }
              }}
              MenuProps={{
                PaperProps: { sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#c9d1d9', mt: 1, borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' } }
              }}
            >
              <MenuItem value="" sx={{ py: 1.5, '&:hover': { bgcolor: '#21262d' } }}><em>Unassigned</em></MenuItem>
              {agents.map((agent) => (
                <MenuItem key={agent.id} value={agent.id} sx={{ py: 1.5, '&:hover': { bgcolor: '#21262d' }, '&.Mui-selected': { bgcolor: 'rgba(37, 99, 235, 0.2)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#1e3a8a', color: '#60a5fa' }}>
                      {agent.first_name.charAt(0)}
                    </Avatar>
                    <Typography sx={{ fontWeight: 500 }}>
                      {agent.first_name} {agent.last_name}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #30363d', bgcolor: '#161b22' }}>
          <Button onClick={() => setAssignDialogOpen(false)} sx={{ color: '#8b949e', textTransform: 'none', fontWeight: 600, mr: 1, '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}>Cancel</Button>
          <Button 
            onClick={handleAssignSubmit} 
            variant="contained" 
            disabled={assignMutation.isPending}
            sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: '0 0 10px rgba(59,130,246,0.3)' }}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Detection Dialog */}
      <Dialog 
        open={duplicateDialogOpen} 
        onClose={() => setDuplicateDialogOpen(false)}
        PaperProps={{ sx: { bgcolor: '#161b22', border: '1px solid #30363d', color: '#e6edf3', width: '100%', maxWidth: 550, borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #30363d', fontSize: '1.25rem', fontWeight: 600, bgcolor: '#0d1117', p: 3, color: '#e6edf3' }}>
          Duplicates Detected
        </DialogTitle>
        <DialogContent sx={{ p: 4, bgcolor: '#161b22' }}>
          <Typography variant="body1" sx={{ color: '#e6edf3', mb: 3, fontSize: '1.05rem' }}>
            We found <strong>{duplicateStats.duplicateCount}</strong> duplicate leads (matching email or phone number) in your file. 
            There are <strong>{duplicateStats.newCount}</strong> new leads.
          </Typography>
          <Typography variant="body2" sx={{ color: '#8b949e', lineHeight: 1.6 }}>
            How would you like to handle the duplicates?
            <br/><br/>
            • <strong style={{ color: '#c9d1d9' }}>Ignore:</strong> Only import the new leads. Skip the duplicates entirely.<br/>
            • <strong style={{ color: '#c9d1d9' }}>Replace:</strong> Import new leads AND update existing duplicate leads with the new data from your file.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #30363d', bgcolor: '#161b22', justifyContent: 'space-between' }}>
          <Button onClick={() => setDuplicateDialogOpen(false)} sx={{ color: '#8b949e', textTransform: 'none' }}>
            Cancel Import
          </Button>
          <Box>
            <Button 
              onClick={() => handleDuplicateAction('ignore')} 
              variant="outlined" 
              disabled={importMutation.isPending}
              sx={{ color: '#c9d1d9', borderColor: '#30363d', textTransform: 'none', mr: 2, '&:hover': { borderColor: '#8b949e', bgcolor: 'rgba(255,255,255,0.05)' } }}
            >
              {importMutation.isPending ? 'Processing...' : 'Ignore Duplicates'}
            </Button>
            <Button 
              onClick={() => handleDuplicateAction('replace')} 
              variant="contained" 
              disabled={importMutation.isPending}
              sx={{ bgcolor: '#3b82f6', color: '#fff', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600, px: 3, boxShadow: '0 0 10px rgba(59,130,246,0.3)' }}
            >
              {importMutation.isPending ? 'Processing...' : 'Replace Existing'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeadList;
