import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const Sparkline = ({ color }) => {
  // A visually pleasing static sparkline path to match the screenshot
  const pathData = "M0,20 Q10,15 20,25 T40,20 T60,10 T80,25 T100,5 T120,15 T140,5 L140,40 L0,40 Z";
  const strokeData = "M0,20 Q10,15 20,25 T40,20 T60,10 T80,25 T100,5 T120,15 T140,5";

  return (
    <Box sx={{ width: '100%', height: '40px', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 140 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={pathData} fill={`url(#gradient-${color})`} />
        <path d={strokeData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  );
};

const DashboardKpiCard = ({ title, value, icon, color, loading, trend, trendText }) => {
  // Map color names to exact hex values for glows and sparklines
  const colorMap = {
    blue: '#2563eb', // Total Leads
    lightBlue: '#0ea5e9', // Today's Leads
    orange: '#f97316', // Follow-ups Due
    green: '#22c55e', // Won Leads
    red: '#ef4444', // Lost Leads
  };

  const activeColor = colorMap[color] || colorMap.blue;
  const isPositive = trend >= 0;

  return (
    <Box
      sx={{
        backgroundColor: '#161b22', // Darker card background matching the screenshot
        borderRadius: '12px',
        border: '1px solid #30363d', // Subtle border
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minWidth: '200px', // Prevent squishing
        flex: 1, // Let it fill space equally in a flex row
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Box sx={{ p: 2.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
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
            
            {/* Inner tiny dot for detail like in screenshot */}
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 4, 
                right: 4, 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                bgcolor: '#fff', 
                boxShadow: `0 0 10px ${activeColor}` 
              }} 
            />
          </Box>

          {/* Title and Value */}
          <Box>
            <Typography variant="body2" sx={{ color: '#8b949e', fontWeight: 600, fontSize: '0.85rem' }}>
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

        {/* Trend Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: isPositive ? '#2ea043' : '#f85149',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
          >
            {isPositive ? <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDownIcon sx={{ fontSize: 16, mr: 0.5 }} />}
            {Math.abs(trend)}%
          </Box>
          <Typography variant="caption" sx={{ color: '#8b949e', fontSize: '0.75rem' }}>
            {trendText || 'vs last 7 days'}
          </Typography>
        </Box>
      </Box>

      {/* Sparkline at the bottom */}
      <Box sx={{ mt: 'auto', px: 1 }}>
        <Sparkline color={activeColor} />
      </Box>
    </Box>
  );
};

export default DashboardKpiCard;
