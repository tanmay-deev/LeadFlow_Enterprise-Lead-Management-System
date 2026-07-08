import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './routes/PublicRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import LeadList from './features/leads/LeadList';
import LeadDetails from './features/leads/LeadDetails';
import FollowupList from './features/followups/FollowupList';
import UserList from './features/users/UserList';
import UserDetails from './features/users/UserDetails';
import Notifications from './features/notifications/Notifications';
import Reports from './features/reports/Reports';
import Settings from './features/settings/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      {/* Public Routes (Accessible only if NOT logged in) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Routes (Accessible only if logged in) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<LeadList />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/followups" element={<FollowupList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
