import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  LinearProgress,
  // Chip,
  // List,
  // ListItem,
  // ListItemAvatar,
  // ListItemText,
  Button,
  Rating,
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { DashboardSkeleton } from '../components/SkeletonLoader';

const mockReviews = [
  {
    id: '1',
    employeeName: 'Albert Henoy',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    position: 'Senior Developer',
    overallScore: 4.5,
    metrics: {
      quality: 90,
      productivity: 85,
      communication: 88,
      teamwork: 92,
    },
    reviewDate: '2023-10-15',
    reviewer: 'John Manager',
  },
];

export const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <>
        {/* <SEOHelmet title="Performance Reviews" /> */}
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      {/* <SEOHelmet
        title="Performance Reviews"
        description="Track and manage employee performance reviews"
      /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Performance Reviews
          </Typography>
          <Button variant="contained">Create Review</Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrophyIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Score
                    </Typography>
                    <Typography variant="h4">4.5/5</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'success.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Reviews Completed
                    </Typography>
                    <Typography variant="h4">24</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <StarIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Pending Reviews
                    </Typography>
                    <Typography variant="h4">6</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar src={review.avatar} sx={{ width: 60, height: 60 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{review.employeeName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {review.position}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Rating value={review.overallScore} precision={0.5} readOnly />
                      <Typography variant="caption" display="block" color="text.secondary">
                        Reviewed by {review.reviewer}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Quality of Work
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={review.metrics.quality}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{review.metrics.quality}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Productivity
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={review.metrics.productivity}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color="secondary"
                        />
                        <Typography variant="body2">{review.metrics.productivity}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Communication
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={review.metrics.communication}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color="success"
                        />
                        <Typography variant="body2">{review.metrics.communication}%</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Teamwork
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={review.metrics.teamwork}
                          sx={{ flex: 1, height: 8, borderRadius: 4 }}
                          color="warning"
                        />
                        <Typography variant="body2">{review.metrics.teamwork}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};
