import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const cardStyle = {
  backgroundColor: '#161b22',
  borderRadius: '12px',
  border: '1px solid #30363d',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  mb: 2,
};

const titleStyle = {
  color: '#e6edf3',
  fontWeight: 600,
  fontSize: '0.875rem',
};

const AgentPerformanceChart = ({ data }) => {
  const agents = Array.isArray(data) ? data : [];

  const chartData = {
    labels: agents.map(agent => agent.name.split(' ')[0]), // Just use first name for brevity
    datasets: [
      {
        label: 'Total Leads',
        data: agents.map(agent => agent.total_leads),
        backgroundColor: '#2563eb', // Blue
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      },
      {
        label: 'Won Leads',
        data: agents.map(agent => agent.won_leads),
        backgroundColor: '#22c55e', // Green
        borderRadius: 4,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: '#8b949e',
          font: { size: 11, family: 'Inter' },
          usePointStyle: true,
          boxWidth: 8,
          boxHeight: 8,
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: '#30363d',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 10 } },
      },
      y: {
        grid: { color: '#30363d', borderDash: [4, 4], drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 10 }, stepSize: 5 },
        beginAtZero: true,
      },
    },
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={headerStyle}>
          <Typography sx={titleStyle}>Agent Performance Overview</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 220 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default AgentPerformanceChart;
