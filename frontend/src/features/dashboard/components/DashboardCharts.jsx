import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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

export const LeadsOverviewChart = ({ data }) => {
  const labels = data?.length ? data.map(d => d.new_date) : [];
  const values = data?.length ? data.map(d => d.count) : [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Leads',
        data: values,
        borderColor: '#2563eb',
        borderWidth: 2,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.4, // Smooth curve
        pointBackgroundColor: '#161b22',
        pointBorderColor: '#3b82f6',
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
        ticks: { color: '#8b949e', font: { size: 10 }, stepSize: 20 },
        min: 0,
        max: 100, // Fixed max to match screenshot
      },
    },
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={headerStyle}>
          <Typography sx={titleStyle}>Leads Overview (Last 7 Days)</Typography>
          <Box sx={{ color: '#8b949e', fontSize: '0.75rem', bgcolor: '#21262d', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #30363d' }}>
            Last 7 Days ⌄
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 180 }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const LeadSourcesChart = ({ data }) => {
  const sources = data?.length ? data : [];

  const total = sources.reduce((sum, s) => sum + Number(s.count), 0);

  const chartColors = ['#2563eb', '#22c55e', '#a855f7', '#f97316', '#0ea5e9', '#ec4899', '#eab308'];

  const chartData = {
    labels: sources.map(s => s.name),
    datasets: [
      {
        data: sources.map(s => s.count),
        backgroundColor: sources.map((s, i) => chartColors[i % chartColors.length]),
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

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={headerStyle}>
          <Typography sx={titleStyle}>Lead Sources</Typography>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {/* Donut Chart */}
          <Box sx={{ width: 140, height: 140, position: 'relative', flexShrink: 0 }}>
            <Doughnut data={chartData} options={options} />
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.25rem', lineHeight: 1 }}>{total}</Typography>
              <Typography sx={{ color: '#8b949e', fontSize: '0.65rem' }}>Total Leads</Typography>
            </Box>
          </Box>
          
          {/* Legend */}
          <Box sx={{ ml: 3, display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
            {sources.map((source, i) => {
              const percent = Math.round((source.count / total) * 100);
              return (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: chartColors[i % chartColors.length] }} />
                    <Typography sx={{ color: '#c9d1d9', fontSize: 'inherit' }}>{source.name}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ color: '#8b949e', fontSize: 'inherit' }}>{percent}%</Typography>
                    <Typography sx={{ color: '#c9d1d9', fontSize: 'inherit', width: 24, textAlign: 'right' }}>({source.count})</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const LeadStatusChart = ({ summary }) => {
  const dataMap = [
    { label: 'New', value: summary?.new ?? 0, color: '#2563eb' },
    { label: 'Contacted', value: summary?.contacted ?? 0, color: '#f97316' },
    { label: 'Qualified', value: summary?.qualified ?? 0, color: '#a855f7' },
    { label: 'Won', value: summary?.won ?? 0, color: '#22c55e' },
    { label: 'Lost', value: summary?.lost ?? 0, color: '#ef4444' },
  ];

  const chartData = {
    labels: dataMap.map(d => d.label),
    datasets: [
      {
        data: dataMap.map(d => d.value),
        backgroundColor: dataMap.map(d => d.color),
        borderRadius: 4,
        barPercentage: 0.6,
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
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 9 }, maxRotation: 0, minRotation: 0 },
      },
      y: {
        grid: { color: '#30363d', borderDash: [4, 4], drawBorder: false },
        ticks: { color: '#8b949e', font: { size: 10 }, stepSize: 50 },
        min: 0,
        max: 200, // Match screenshot
      },
    },
    animation: {
      onComplete: (context) => {
        const chart = context.chart;
        const ctx = chart.ctx;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.font = 'bold 10px Inter';
        ctx.fillStyle = '#fff';

        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            ctx.fillText(data, bar.x, bar.y - 4);
          });
        });
      }
    }
  };

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: '20px !important', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={headerStyle}>
          <Typography sx={titleStyle}>Lead Status Distribution</Typography>
          <Box sx={{ color: '#8b949e', fontSize: '0.75rem', bgcolor: '#21262d', px: 1, py: 0.5, borderRadius: 1, border: '1px solid #30363d' }}>
            All Status ⌄
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 180 }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};
