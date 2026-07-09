import React from 'react';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';

const CircularProgressWithLabel = ({ value, color, label }) => {
  return (
    <Box sx={{ textAlign: 'center', cursor: 'pointer', '&:hover .progress-circle': { opacity: 0.8 } }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        {/* Background Circle */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={96}
          thickness={4}
          sx={{
            color: 'action.hover', // surface-container-high
          }}
        />
        {/* Foreground Circle */}
        <CircularProgress
          variant="determinate"
          value={value}
          size={96}
          thickness={4}
          sx={{
            color: `${color}.main`,
            position: 'absolute',
            left: 0,
            transition: 'all 1s ease-out',
            strokeLinecap: 'round',
          }}
          className="progress-circle"
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" component="div" color="text.primary" sx={{ fontWeight: 700 }}>
            {`${Math.round(value)}%`}
          </Typography>
        </Box>
      </Box>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </Typography>
    </Box>
  );
};

const QuarterlyTargets = () => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Typography variant="h6" color="text.primary" sx={{ mb: 4 }}>
          Quarterly Targets
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexGrow: 1 }}>
          <CircularProgressWithLabel value={75} color="primary" label="Revenue" />
          <CircularProgressWithLabel value={60} color="success" label="Leads" />
        </Box>

        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            You are <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>$12k ahead</Box> of your target pace for Q4.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuarterlyTargets;
