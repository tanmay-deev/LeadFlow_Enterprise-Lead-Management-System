import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="md">
      <Box 
        sx={{ 
          marginTop: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" color="primary" sx={{ fontSize: '100px', fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h4" color="text.primary" sx={{ mt: 2, mb: 4, fontWeight: 700 }}>
          Oops! Page not found.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={() => navigate('/')}
        >
          Go Back Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
