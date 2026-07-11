import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Outlet } from 'react-router-dom';

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - 260px)` },
          minWidth: 0,
          overflowX: 'hidden'
        }}
      >
        <Toolbar /> {/* Spacer for Navbar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
