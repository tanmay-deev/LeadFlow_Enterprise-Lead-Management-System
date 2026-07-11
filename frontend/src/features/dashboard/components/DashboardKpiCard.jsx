import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

const DashboardKpiCard = ({ title, value, icon, color, loading }) => {
  // Map color names to exact hex values for glows and sparklines
  const colorMap = {
    blue: '#2563eb', // Total Leads
    lightBlue: '#0ea5e9', // Today's Leads
    orange: '#f97316', // Follow-ups Due
    green: '#22c55e', // Won Leads
    red: '#ef4444', // Lost Leads
  };

  const activeColor = colorMap[color] || colorMap.blue;

  return (
    <Box
      sx={{
        backgroundColor: '#161b22', // Darker card background matching the screenshot
        borderRadius: '12px',
        border: '1px solid #30363d', // Subtle border
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center content since graph is removed
        height: '120px', // Fixed height since graph is removed
        width: '100%', // Let it fill the grid cell
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Icon with Glow */}
          <Box
            sx={{
              position: 'relative',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${activeColor}80, ${activeColor}20)`,
              boxShadow: `0 0 20px ${activeColor}60`, // Glow effect
              color: '#fff',
            }}
          >
            {/* The icon component passed in */}
            {React.cloneElement(icon, { sx: { fontSize: 24, filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' } })}
          </Box>

          {/* Title and Value */}
          <Box>
            <Typography variant="body2" sx={{ color: '#8b949e', fontWeight: 600, fontSize: '0.85rem', mb: 0.5 }}>
              {title}
            </Typography>
            {loading ? (
              <Skeleton variant="text" width={80} height={40} sx={{ bgcolor: '#30363d' }} />
            ) : (
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardKpiCard;
