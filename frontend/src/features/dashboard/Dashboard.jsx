import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchDashboardCharts } from '../../api/dashboardApi';

// Icons
import GroupsIcon from '@mui/icons-material/Groups';
import BoltIcon from '@mui/icons-material/Bolt';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Components
import DashboardKpiCard from './components/DashboardKpiCard';
import { LeadsOverviewChart, LeadSourcesChart, LeadStatusChart } from './components/DashboardCharts';
import RecentLeads from './components/RecentLeads';
import UpcomingFollowups from './components/UpcomingFollowups';
import RecentActivity from './components/RecentActivity';

const Dashboard = () => {
  const { data: summaryResponse, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary
  });

  const { data: chartsResponse, isLoading: loadingCharts } = useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: fetchDashboardCharts
  });

  const summary = summaryResponse?.data || { total_leads: 0, todays_leads: 0, qualified: 0, won: 0, lost: 0, follow_up: 0, contacted: 0 };
  const charts = chartsResponse?.data || { lead_source: [], monthly_leads: [], conversion_ratio: 0, sales_performance: [] };

  return (
    <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', xl: 'row' } }}>
      
      {/* LEFT MAIN CONTENT */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* Header Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
              Welcome back, Tanmay! 👋
            </Typography>
            <Typography variant="body2" sx={{ color: '#8b949e' }}>
              Here's what's happening with your leads today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                border: '1px solid #30363d',
                borderRadius: '8px',
                px: 2,
                py: 1,
                color: '#c9d1d9',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <CalendarTodayIcon sx={{ fontSize: 16 }} />
              Jul 03 - Jul 09, 2026
              <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
            </Box>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              sx={{ 
                bgcolor: '#2563eb', 
                color: '#fff',
                '&:hover': { bgcolor: '#1d4ed8' },
                boxShadow: '0 0 10px rgba(37,99,235,0.3)',
                borderRadius: '8px',
                px: 2
              }}
            >
              Add Lead
            </Button>
          </Box>
        </Box>

        {/* 5 KPI Cards Row */}
        <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 1 }}>
          <DashboardKpiCard 
            title="Total Leads" 
            value={summary.total_leads} 
            icon={<GroupsIcon />} 
            color="blue" 
            trend={12.5} 
            loading={loadingSummary} 
          />
          <DashboardKpiCard 
            title="Today's Leads" 
            value={summary.todays_leads} 
            icon={<CalendarTodayIcon />} 
            color="lightBlue" 
            trend={8.3}
            trendText="vs yesterday"
            loading={loadingSummary} 
          />
          <DashboardKpiCard 
            title="Follow-ups Due" 
            value={summary.follow_up} 
            icon={<NotificationImportantIcon />} 
            color="orange" 
            trend={4.1}
            trendText="vs yesterday"
            loading={loadingSummary} 
          />
          <DashboardKpiCard 
            title="Won Leads" 
            value={summary.won} 
            icon={<HandshakeIcon />} 
            color="green" 
            trend={15.6} 
            loading={loadingSummary} 
          />
          <DashboardKpiCard 
            title="Lost Leads" 
            value={summary.lost} 
            icon={<CancelIcon />} 
            color="red" 
            trend={-2.3} 
            loading={loadingSummary} 
          />
        </Box>

        {/* 3 Charts Row */}
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          <Box sx={{ flex: 2 }}>
            <LeadsOverviewChart data={charts.monthly_leads} />
          </Box>
          <Box sx={{ flex: 1.2 }}>
            <LeadSourcesChart data={charts.lead_source} />
          </Box>
          <Box sx={{ flex: 1.2 }}>
            <LeadStatusChart summary={summary} />
          </Box>
        </Box>

        {/* Recent Leads Table */}
        <Box>
          <RecentLeads />
        </Box>
        
      </Box>

      {/* RIGHT FIXED SIDEBAR */}
      <Box sx={{ width: { xs: '100%', xl: 320 }, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <UpcomingFollowups />
        <RecentActivity />
      </Box>

    </Box>
  );
};

export default Dashboard;
