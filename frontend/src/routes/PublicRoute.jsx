import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const PublicRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  // If authenticated, redirect to the page they tried to visit or dashboard
  return isAuthenticated ? <Navigate to={from} replace /> : <Outlet />;
};
