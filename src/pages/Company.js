import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';
// import { SEOHelmet } from '../components/SEOHelmet';

export const Company = () => {
  return (
    <>
      {/* <SEOHelmet title="Company" description="Company overview and information" /> */}

      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Company Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Employees
                </Typography>
                <Typography variant="h3">65</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Departments
                </Typography>
                <Typography variant="h3">8</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Locations
                </Typography>
                <Typography variant="h3">3</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
