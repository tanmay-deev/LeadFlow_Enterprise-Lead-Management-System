import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Assignment as AssignmentIcon, 
  BarChart as BarChartIcon, 
  Settings as SettingsIcon,
  Group as GroupIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Leads', icon: <PeopleIcon />, path: '/leads' },
  { text: 'Follow-ups', icon: <EventIcon />, path: '/followups' },
  { text: 'Users & Roles', icon: <GroupIcon />, path: '/users' },
  { text: 'Reports', icon: <BarChartIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user?.roles?.some(r => r.name === 'Admin' || r.name === 'Super Admin') || user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';
  
  const visibleMenuItems = menuItems.filter(item => {
    if (!isAdmin && (item.path === '/users' || item.path === '/settings')) {
      return false;
    }
    return true;
  });

  const drawerContent = (
    <Box sx={{ overflow: 'auto' }}>
      <List sx={{ px: 2, pt: 2 }}>
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onMobileClose();
                }}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.12)' : 'rgba(15, 23, 42, 0.04)',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  slotProps={{ primary: { fontWeight: isActive ? 600 : 500 } }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        <Toolbar /> {/* Spacer for Navbar */}
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        open
      >
        <Toolbar /> {/* Spacer for Navbar */}
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
