import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';
// import { SEOHelmet } from '../components/SEOHelmet';

export const Planning = () => {
  return (
    <>
      {/* <SEOHelmet title="Planning" description="Workforce planning and scheduling" /> */}

      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Workforce Planning
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Allocation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Plan and manage workforce resources across projects and departments.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Capacity Overview
                </Typography>
                <Chip label="Engineering: 85%" color="primary" sx={{ m: 0.5 }} />
                <Chip label="Design: 70%" color="success" sx={{ m: 0.5 }} />
                <Chip label="Sales: 95%" color="warning" sx={{ m: 0.5 }} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
