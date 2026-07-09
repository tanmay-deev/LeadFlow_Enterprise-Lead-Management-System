import React from 'react';
import { Card, Box, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

const KpiCard = ({ title, value, icon, color = 'primary', loading = false, trend = null, progress = 0 }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: (theme) => `${theme.palette[color].main}80`, 
          boxShadow: (theme) => `0 10px 15px -3px ${theme.palette[color].main}20, 0 4px 6px -4px ${theme.palette[color].main}10`,
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box 
          sx={{ 
            p: 1, 
            backgroundColor: (theme) => `${theme.palette[color].main}1A`, // ~10% opacity
            color: `${color}.main`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        
        {trend !== null && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: trend > 0 ? 'success.main' : trend < 0 ? 'error.main' : 'text.secondary',
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : 'Static'}
            {trend > 0 ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : trend < 0 ? <TrendingDownIcon sx={{ fontSize: 14 }} /> : <RemoveIcon sx={{ fontSize: 14 }} />}
          </Box>
        )}
      </Box>

      <Typography variant="overline" color="text.disabled" sx={{ display: 'block' }}>
        {title}
      </Typography>
      
      {loading ? (
        <Skeleton variant="text" width={80} height={40} sx={{ mt: 0.5 }} />
      ) : (
        <Typography variant="h2" color="text.primary" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      )}

      {/* Progress Bar (always shows to keep heights consistent) */}
      <Box sx={{ width: '100%', height: 4, bgcolor: 'action.selected', mt: 2, borderRadius: 2, overflow: 'hidden', display: 'flex', gap: '2px' }}>
        {progress > 0 && typeof progress === 'number' ? (
           <Box sx={{ height: '100%', bgcolor: `${color}.main`, width: `${progress}%` }} />
        ) : progress === 'segments' ? (
           <>
             <Box sx={{ flex: 1, height: '100%', bgcolor: `${color}.main`, borderRadius: 2 }} />
             <Box sx={{ flex: 1, height: '100%', bgcolor: `${color}.main`, borderRadius: 2 }} />
             <Box sx={{ flex: 1, height: '100%', bgcolor: 'transparent', borderRadius: 2 }} />
           </>
        ) : (
           <Box sx={{ height: '100%', bgcolor: `${color}.main`, width: '100%', opacity: 0 }} /> // hidden spacer if no progress passed
        )}
      </Box>
    </Card>
  );
};

export default KpiCard;
