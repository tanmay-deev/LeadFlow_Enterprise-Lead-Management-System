import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

// 1. Bar Chart: Total Leads by Source
export const LeadsBySourceBarChart = ({ data }) => {
  const sources = Array.isArray(data) ? data : [];
  
  const chartColors = ['#2563eb', '#22c55e', '#a855f7', '#f97316', '#0ea5e9', '#ec4899', '#eab308'];

  const chartData = {
    labels: sources.map(s => s.name),
    datasets: [
      {
        label: 'Total Leads',
        data: sources.map(s => s.total),
        backgroundColor: sources.map((s, i) => chartColors[i % chartColors.length]),
        borderRadius: 4,
        maxBarThickness: 45, // Prevents bars from becoming too wide
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
          <Typography sx={titleStyle}>Total Leads by Source</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 200 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

// 2. Doughnut Chart: Won vs Lost
export const WonLostDoughnutChart = ({ won, lost }) => {
  const chartData = {
    labels: ['Won', 'Lost'],
    datasets: [
      {
        data: [won, lost],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  const total = won + lost;

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', textAlign: 'left', mb: 2 }}>
          <Typography sx={titleStyle}>Won vs Lost Leads</Typography>
        </Box>
        <Box sx={{ position: 'relative', width: 160, height: 160, display: 'flex', justifyContent: 'center' }}>
          <Doughnut data={chartData} options={options} />
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.5rem', lineHeight: 1 }}>{total}</Typography>
            <Typography sx={{ color: '#8b949e', fontSize: '0.7rem' }}>Total Processed</Typography>
          </Box>
        </Box>
        <Box sx={{ mt: 3, display: 'flex', gap: 3, width: '100%', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#22c55e' }} />
            <Typography sx={{ color: '#c9d1d9', fontSize: '0.85rem' }}>Won ({won})</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography sx={{ color: '#c9d1d9', fontSize: '0.85rem' }}>Lost ({lost})</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// 3. Line Chart: Conversion Rate by Source
export const SourceConversionChart = ({ data }) => {
  const sources = Array.isArray(data) ? data : [];

  const chartData = {
    labels: sources.map(s => s.name),
    datasets: [
      {
        label: 'Conversion Rate',
        data: sources.map(s => s.conversion_rate),
        borderColor: '#a855f7',
        backgroundColor: '#a855f7',
        borderWidth: 2,
        tension: 0, // straight lines
        pointBackgroundColor: '#161b22',
        pointBorderColor: '#a855f7',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e6edf3',
        bodyColor: '#e6edf3',
        borderColor: '#30363d',
        borderWidth: 1,
        callbacks: {
          label: (context) => ` Conversion: ${context.parsed.y}%`
        }
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 10 } },
      },
      y: {
        grid: { color: '#30363d', borderDash: [4, 4], drawBorder: false },
        ticks: { 
          color: '#8b949e', 
          font: { size: 10 },
          callback: (value) => `${value}%`
        },
        beginAtZero: true,
        max: 100
      },
    },
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={headerStyle}>
          <Typography sx={titleStyle}>Conversion Rate by Source</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 200 }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

// 4. Area Chart: Leads Over Time
export const LeadsTrendChart = ({ data }) => {
  const labels = data?.length ? data.map(d => d.date) : [];
  const values = data?.length ? data.map(d => d.count) : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Leads Created',
        data: values,
        borderColor: '#0ea5e9',
        borderWidth: 2,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(14, 165, 233, 0.4)');
          gradient.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4, 
        pointBackgroundColor: '#161b22',
        pointBorderColor: '#0ea5e9',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
          <Typography sx={titleStyle}>Leads Over Time</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 250 }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};
