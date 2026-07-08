import React from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSummary, fetchDashboardCharts } from '../../api/dashboardApi';
import KpiCard from '../../components/cards/KpiCard';
import { PeopleAlt, VerifiedUser, CheckCircle, Cancel } from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

import RecentLeads from './components/RecentLeads';
import RecentActivities from './components/RecentActivities';
import UpcomingFollowups from './components/UpcomingFollowups';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { data: summaryResponse, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: fetchDashboardSummary
  });

  const { data: chartsResponse, isLoading: loadingCharts } = useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: fetchDashboardCharts
  });

  const summary = summaryResponse?.data || { total_leads: 0, todays_leads: 0, qualified: 0, won: 0, lost: 0 };
  const charts = chartsResponse?.data || { lead_source: [], monthly_leads: [] };

  const barChartData = {
    labels: (charts.monthly_leads || []).map((d) => d.new_date),
    datasets: [
      {
        label: 'Leads Created',
        data: (charts.monthly_leads || []).map((d) => d.count),
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  const pieChartData = {
    labels: (charts.lead_source || []).map((d) => d.name),
    datasets: [
      {
        data: (charts.lead_source || []).map((d) => d.count),
        backgroundColor: [
          '#3B82F6',
          '#22C55E',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#CBD5E1', // text.secondary
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: '#334155', // divider
        },
        ticks: {
          color: '#94A3B8', // disabled text
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94A3B8',
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#CBD5E1',
        },
      },
    },
  };

  return (
    <Box>
      <Typography variant="h3" color="text.primary" sx={{ mb: 3 }}>
        Overview
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Total Leads" 
            value={summary.total_leads} 
            icon={<PeopleAlt />} 
            color="primary" 
            loading={loadingSummary} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Today's Leads" 
            value={summary.todays_leads} 
            icon={<VerifiedUser />} 
            color="info" 
            loading={loadingSummary} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Won Leads" 
            value={summary.won} 
            icon={<CheckCircle />} 
            color="success" 
            loading={loadingSummary} 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Lost Leads" 
            value={summary.lost} 
            icon={<Cancel />} 
            color="error" 
            loading={loadingSummary} 
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
                Monthly Leads
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {!loadingCharts && charts.monthly_leads.length > 0 ? (
                  <Bar data={barChartData} options={chartOptions} />
                ) : (
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: 400 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
                Lead Sources
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!loadingCharts && charts.lead_source.length > 0 ? (
                  <Pie data={pieChartData} options={pieOptions} />
                ) : (
                  <Typography variant="body2" color="text.secondary">No data available</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables & Lists */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <RecentLeads />
        </Grid>
        <Grid item xs={12} md={3}>
          <UpcomingFollowups />
        </Grid>
        <Grid item xs={12} md={3}>
          <RecentActivities />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
