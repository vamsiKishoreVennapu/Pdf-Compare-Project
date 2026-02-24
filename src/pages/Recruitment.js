import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  AvatarGroup,
  LinearProgress,
  // IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { DashboardSkeleton } from '../components/SkeletonLoader';

const mockJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    applicants: 24,
    status: 'open',
    posted: '2023-10-15',
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    applicants: 18,
    status: 'open',
    posted: '2023-10-20',
  },
  {
    id: '3',
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'San Francisco, CA',
    type: 'Full-time',
    applicants: 32,
    status: 'open',
    posted: '2023-10-10',
  },
];

export const Recruitment = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <>
        {/* <SEOHelmet title="Recruitment" /> */}
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <>
      {/* <SEOHelmet
        title="Recruitment"
        description="Manage job postings and candidate applications"
      /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Recruitment
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Create Job Posting
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Open Positions
                </Typography>
                <Typography variant="h4">12</Typography>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{ mt: 2 }}
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Applicants
                </Typography>
                <Typography variant="h4">248</Typography>
                <LinearProgress
                  variant="determinate"
                  value={60}
                  sx={{ mt: 2 }}
                  color="secondary"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Interviews Scheduled
                </Typography>
                <Typography variant="h4">18</Typography>
                <LinearProgress
                  variant="determinate"
                  value={45}
                  sx={{ mt: 2 }}
                  color="success"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="All Jobs" />
              <Tab label="Open" />
              <Tab label="Closed" />
              <Tab label="Drafts" />
            </Tabs>

            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} md={6} lg={4} key={job.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">{job.title}</Typography>
                        <Chip
                          label={job.status}
                          color={job.status === 'open' ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <WorkIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {job.department}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {job.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {job.applicants} applicants
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <AvatarGroup max={4}>
                          <Avatar sx={{ width: 28, height: 28 }}>A</Avatar>
                          <Avatar sx={{ width: 28, height: 28 }}>B</Avatar>
                          <Avatar sx={{ width: 28, height: 28 }}>C</Avatar>
                        </AvatarGroup>
                        <Button size="small">View Details</Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};
