import React from 'react';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';

const SalesFunnel = ({ summary, isLoading }) => {
  if (isLoading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 4 }}>
            Sales Funnel Efficiency
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[100, 80, 60, 40].map((w, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Skeleton variant="text" width={48} />
                <Skeleton variant="rectangular" height={56} sx={{ width: `${w}%`, borderRadius: 2 }} />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  const total = summary.total_leads || 1; // Avoid division by zero
  
  const funnelData = [
    { stage: 'Total Leads', leads: summary.total_leads || 0, percentage: 100, color: 'primary' },
    { stage: 'Contacted', leads: summary.contacted || 0, percentage: Math.round(((summary.contacted || 0) / total) * 100), color: 'info' },
    { stage: 'Qualified', leads: summary.qualified || 0, percentage: Math.round(((summary.qualified || 0) / total) * 100), color: 'secondary' },
    { stage: 'Won (Converted)', leads: summary.won || 0, percentage: Math.round(((summary.won || 0) / total) * 100), color: 'success' },
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" color="text.primary" sx={{ mb: 4, fontWeight: 700 }}>
          Sales Funnel Efficiency
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {funnelData.map((step, index) => {
            const width = step.percentage === 100 ? '100%' : `max(280px, ${step.percentage + 20}%)`; 
            
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography variant="caption" color="text.disabled" sx={{ width: 48, textAlign: 'right', fontWeight: 600 }}>
                  {step.percentage}%
                </Typography>
                
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <Box 
                    sx={{ 
                      width: width,
                      maxWidth: '100%',
                      height: 56, 
                      bgcolor: `${step.color}.main`, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: { xs: 2, sm: 3 },
                      clipPath: 'polygon(0% 0%, 100% 0%, 98% 100%, 2% 100%)',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, color: `${step.color}.contrastText`, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {step.stage}
                    </Typography>
                    <Typography sx={{ color: `${step.color}.contrastText`, opacity: 0.8, fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                      {step.leads.toLocaleString()} Leads
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SalesFunnel;
