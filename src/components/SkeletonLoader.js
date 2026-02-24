import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

export const DashboardSkeleton = () => {
  return (
    <Box>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />

      {/* Top cards */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" height={50} />
                <Skeleton variant="text" width="30%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom charts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid xs={12} md={8}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={4}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={30} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
        {Array.from({ length: rows }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};
