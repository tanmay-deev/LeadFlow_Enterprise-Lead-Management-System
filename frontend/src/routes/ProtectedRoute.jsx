import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfileAPI } from '../api/authApi';
import { updateUser, logout } from '../redux/slices/authSlice';
import { Box, CircularProgress } from '@mui/material';

export const ProtectedRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [loading, setLoading] = useState(!user && isAuthenticated);

  useEffect(() => {
    let active = true;
    if (isAuthenticated && !user) {
      fetchProfileAPI()
        .then((res) => {
          if (active && (res.status === 'success' || res.data)) {
             dispatch(updateUser(res.data));
          }
        })
        .catch(() => {
          if (active) dispatch(logout());
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => { active = false; };
  }, [isAuthenticated, user, dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user?.roles?.some(r => r.name === 'Admin' || r.name === 'Super Admin') || user?.role?.name === 'Admin' || user?.role?.name === 'Super Admin';
  
  if (!isAdmin && (location.pathname.startsWith('/users') || location.pathname.startsWith('/settings'))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
