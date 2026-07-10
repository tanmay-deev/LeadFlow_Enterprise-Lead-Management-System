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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Skeleton
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon, 
  Visibility as VisibilityIcon,
  MoreVert as MoreVertIcon 
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { fetchUsers, deleteUser } from '../../api/userApi';
import UserForm from './UserForm';

const UserList = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', { page, search }],
    queryFn: () => fetchUsers({ page, search }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deleted successfully');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to delete user')
  });

  const handleOpenForm = (user = null) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedUser(null);
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setMenuUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuUser(null);
  };

  const getInitials = (first, last) => {
    return `${(first || '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();
  };

  const users = data?.data || [];
  const meta = data?.meta || { last_page: 1 };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#e6edf3' }}>
          Users & Roles
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600 }}
        >
          Add User
        </Button>
      </Box>

      <Paper sx={{ mb: 4, p: 2, display: 'flex', gap: 2, bgcolor: '#161b22', border: '1px solid #30363d', borderRadius: '12px', boxShadow: 'none' }}>
        <TextField
          size="small"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              color: '#c9d1d9',
              '& fieldset': { borderColor: '#30363d' },
              '&:hover fieldset': { borderColor: '#8b949e' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
            },
            '& .MuiSvgIcon-root': { color: '#8b949e' }
          }}
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
      </Paper>

      <TableContainer component={Paper} sx={{ bgcolor: '#161b22', borderRadius: '12px', border: '1px solid #30363d', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Name</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</TableCell>
              <TableCell sx={{ color: '#8b949e', borderBottom: '1px solid #30363d', fontWeight: 600, fontSize: '0.75rem', py: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
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
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="text" width={180} sx={{ bgcolor: '#30363d' }} /></TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 4, bgcolor: '#30363d' }} /></TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid #30363d' }}><Skeleton variant="circular" width={32} height={32} sx={{ bgcolor: '#30363d', ml: 'auto' }} /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#8b949e' }}>
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: '#4f46e5', color: '#e0e7ff', fontWeight: 600 }}>
                        {getInitials(user.first_name, user.last_name)}
                      </Avatar>
                      <Typography sx={{ color: '#e6edf3', fontWeight: 500 }}>
                        {user.first_name} {user.last_name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d', color: '#c9d1d9' }}>{user.email}</TableCell>
                  <TableCell sx={{ borderBottom: '1px solid #30363d' }}>
                    {user.role ? (
                      <Chip 
                        label={user.role.name} 
                        size="small" 
                        sx={{ 
                          fontWeight: 700, 
                          bgcolor: user.role.name === 'Super Admin' ? 'rgba(239, 68, 68, 0.1)' : 
                                   user.role.name === 'Admin' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                          color: user.role.name === 'Super Admin' ? '#f87171' : 
                                 user.role.name === 'Admin' ? '#fbbf24' : '#60a5fa', 
                          border: user.role.name === 'Super Admin' ? '1px solid rgba(239, 68, 68, 0.3)' : 
                                  user.role.name === 'Admin' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)' 
                        }} 
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ borderBottom: '1px solid #30363d' }}>
                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, user)} sx={{ color: '#8b949e', '&:hover': { color: '#e6edf3' } }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {meta.last_page > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={meta.last_page} 
            page={page} 
            onChange={(e, value) => setPage(value)} 
            sx={{
              '& .MuiPaginationItem-root': { color: '#8b949e', borderColor: '#30363d' },
              '& .Mui-selected': { bgcolor: 'rgba(59, 130, 246, 0.2) !important', color: '#3b82f6', borderColor: '#3b82f6' },
            }}
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: {
            bgcolor: '#161b22',
            border: '1px solid #30363d',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
              color: '#c9d1d9',
              fontSize: '0.875rem',
              '&:hover': { bgcolor: '#21262d' }
            }
          }
        }}
      >
        <MenuItem onClick={() => { navigate(`/users/${menuUser?.id}`); handleCloseMenu(); }}>
          <ListItemIcon><VisibilityIcon sx={{ color: '#8b949e', fontSize: 20 }} /></ListItemIcon>
          <ListItemText>View User</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => { handleOpenForm(menuUser); handleCloseMenu(); }}>
          <ListItemIcon><EditIcon sx={{ color: '#8b949e', fontSize: 20 }} /></ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        
        {menuUser?.role?.name !== 'Super Admin' && (
          <MenuItem onClick={() => { 
            handleDelete(menuUser?.id); 
            handleCloseMenu(); 
          }}>
            <ListItemIcon><DeleteIcon sx={{ color: '#f87171', fontSize: 20 }} /></ListItemIcon>
            <ListItemText sx={{ color: '#f87171' }}>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {isFormOpen && (
        <UserForm 
          open={isFormOpen} 
          onClose={handleCloseForm} 
          initialData={selectedUser} 
        />
      )}
    </Box>
  );
};

export default UserList;
