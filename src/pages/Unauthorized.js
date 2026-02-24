import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock as LockIcon } from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';

export const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* <SEOHelmet title="Unauthorized Access" /> */}
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h3" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            You don't have permission to access this page.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </>
  );
};
