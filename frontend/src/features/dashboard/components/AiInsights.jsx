import React from 'react';
import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';

const AiInsights = () => {
  return (
    <Card 
      sx={{ 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (theme) => `${theme.palette.primary.main}4D`, // 30% opacity
        background: (theme) => `linear-gradient(to bottom right, ${theme.palette.background.paper}, ${theme.palette.primary.main}33)`,
      }}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -16, 
          right: -16, 
          opacity: 0.1, 
          pointerEvents: 'none',
          color: 'primary.main'
        }}
      >
        <PsychologyIcon sx={{ fontSize: 120 }} />
      </Box>

      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box 
            sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              bgcolor: (theme) => `${theme.palette.primary.main}33`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'primary.main'
            }}
          >
            <AutoAwesomeIcon />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
              LeadFlow AI Assistant
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Real-time optimization
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Insight 1 */}
          <Box 
            sx={{ 
              bgcolor: 'rgba(5, 20, 36, 0.4)', 
              backdropFilter: 'blur(4px)', 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" color="text.primary">
              3 high-value leads are showing increased activity. I recommend immediate follow-up.
            </Typography>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                bgcolor: (theme) => `${theme.palette.primary.main}1A`, 
                borderColor: (theme) => `${theme.palette.primary.main}33`,
                color: 'primary.main',
                '&:hover': {
                  bgcolor: (theme) => `${theme.palette.primary.main}33`,
                }
              }}
            >
              Review Leads
            </Button>
          </Box>

          {/* Insight 2 */}
          <Box 
            sx={{ 
              bgcolor: 'rgba(5, 20, 36, 0.4)', 
              backdropFilter: 'blur(4px)', 
              p: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography variant="body2" color="text.primary">
              Funnel drop-off at "Evaluation" stage is up 4%. Update your case study assets?
            </Typography>
            <Button 
              fullWidth 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                bgcolor: (theme) => `${theme.palette.success.main}1A`, 
                borderColor: (theme) => `${theme.palette.success.main}33`,
                color: 'success.main',
                '&:hover': {
                  bgcolor: (theme) => `${theme.palette.success.main}33`,
                  borderColor: (theme) => `${theme.palette.success.main}4D`,
                }
              }}
            >
              View Analytics
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AiInsights;
