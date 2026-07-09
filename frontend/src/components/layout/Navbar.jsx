import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Menu, MenuItem, Badge, Autocomplete, TextField, InputAdornment, CircularProgress } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Search as SearchIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../../api/notificationApi';
import { globalSearch } from '../../api/searchApi';

const Navbar = ({ onMenuClick }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications({ page: 1, per_page: 50 }),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const unreadCount = data?.data?.filter(n => !n.is_read).length || 0;

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  React.useEffect(() => {
    let active = true;

    if (inputValue === '') {
      setOptions([]);
      return undefined;
    }

    setSearchLoading(true);

    const timer = setTimeout(() => {
      globalSearch(inputValue).then((res) => {
        if (active) {
          const results = res.data;
          let newOptions = [];
          
          if (results.leads) {
            newOptions = [...newOptions, ...results.leads.map(lead => ({ ...lead, category: 'Leads' }))];
          }
          if (results.users) {
            newOptions = [...newOptions, ...results.users.map(user => ({ ...user, category: 'Users' }))];
          }
          
          setOptions(newOptions);
          setSearchLoading(false);
        }
      }).catch(() => {
        if (active) setSearchLoading(false);
      });
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(5, 20, 36, 0.8)',
        backdropFilter: 'blur(12px)',
        backgroundImage: 'none',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.main', letterSpacing: '-0.02em' }}>
          LeadFlow
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Autocomplete
            sx={{ width: { xs: 200, sm: 300 } }}
            size="small"
            open={searchOpen}
            onOpen={() => setSearchOpen(true)}
            onClose={() => setSearchOpen(false)}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
            isOptionEqualToValue={(option, value) => option.id === value.id && option.type === value.type}
            getOptionLabel={(option) => option.title}
            options={options}
            loading={searchLoading}
            groupBy={(option) => option.category}
            onChange={(event, newValue) => {
              if (newValue) {
                if (newValue.type === 'lead') {
                  navigate(`/leads/${newValue.id}`);
                } else if (newValue.type === 'user') {
                  navigate(`/users/${newValue.id}`);
                }
                setInputValue('');
                setSearchOpen(false);
              }
            }}
            renderInput={(params) => {
              const { InputProps: pInputProps, slotProps: pSlotProps, ...restParams } = params;
              const baseInput = pInputProps || pSlotProps?.input || {};

              return (
                <TextField
                  {...restParams}
                  placeholder="Search leads, users..."
                  variant="outlined"
                  slotProps={{
                    ...pSlotProps,
                    input: {
                      ...baseInput,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <React.Fragment>
                          {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {baseInput.endAdornment}
                        </React.Fragment>
                      ),
                      sx: { borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.04)', ...baseInput.sx }
                    }
                  }}
                />
              );
            }}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <Box key={key} component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...optionProps}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{option.subtitle}</Typography>
                  </Box>
                </Box>
              );
            }}
          />

          <IconButton color="inherit" onClick={() => navigate('/notifications')}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar alt={user?.first_name || 'User'} src="/static/images/avatar/1.jpg" sx={{ width: 32, height: 32 }} />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
