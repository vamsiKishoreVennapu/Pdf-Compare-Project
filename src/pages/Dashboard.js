// import { Helmet } from 'react-helmet';

import React, { useState, useEffect, 
  // lazy, Suspense
 } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  // IconButton,
  // LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  PlayArrow,
  Pause,
  Coffee,
  CheckCircle,
  Schedule,
  Warning,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { DashboardSkeleton } from '../components/SkeletonLoader';
// import dashboardImage from 'figma:asset/ecfe26b3b7e47765daef76a3db7078ee746a8b84.png';

// Lazy load chart component
// const Chart = lazy(() => import('../components/AttendanceChart'));

const StatCard = ({ title, value, change, isPositive, icon }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ my: 1 }}>
            {value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isPositive ? (
              <TrendingUp color="success" fontSize="small" />
            ) : (
              <TrendingDown color="error" fontSize="small" />
            )}
            <Typography
              variant="caption"
              color={isPositive ? 'success.main' : 'error.main'}
            >
              {change}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ color: 'primary.main' }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState('04:02:40');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1500);

    // Update timer
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <>
        {/* <SEOHelmet title="Dashboard" /> */}
        <DashboardSkeleton />
      </>
    );
  }

  const tasks = [
    {
      title: 'Making work certificate John Doe',
      status: 'in progress',
      date: '30/06/2023',
      assignee: 'Elyse',
    },
    {
      title: 'Call Jack Russel',
      date: '3 June 2023 at 10:30 am',
      status: 'scheduled',
    },
  ];

  // const schedule = [
  //   { title: 'Meeting with Jeni', time: '3 June 2023 at 10:30 am', checked: true },
  //   { title: 'Interview with John Dubucock', time: '3 June 2023 at 10:30 am', checked: false },
  // ];

  return (
    <>
      {/* <SEOHelmet
        title="Dashboard"
        description="HR Portal Dashboard - View your tasks, attendance, and performance metrics"
      /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Personal Dashboard
          </Typography>
          <Button variant="outlined" size="small">
            Manage widgets
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Delay rate"
              value="20%"
              change="+2%"
              isPositive={true}
              icon={<Schedule />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Attendance Rate"
              value="45%"
              change="+2%"
              isPositive={true}
              icon={<CheckCircle />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Overtime"
              value="85:00"
              change="+2%"
              isPositive={false}
              icon={<TrendingUp />}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <StatCard
              title="Negative Hours"
              value="15:00"
              change="+2%"
              isPositive={false}
              icon={<Warning />}
            />
          </Grid>

          {/* Calendar and Tasks */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  June 2023
                </Typography>
                {/* <Box
                  component="img"
                  src={dashboardImage}
                  alt="Dashboard preview"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    mt: 2,
                  }}
                /> */}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Time and Attendance Indicators
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {[
                    { title: 'Delay rate', value: '20%', change: '+2%' },
                    { title: 'Attendance Rate', value: '45%', change: '+2%' },
                    { title: 'Overtime', value: '85:00', change: '+2%' },
                    { title: 'Negative Hours', value: '15:00', change: '+2%' },
                  ].map((stat) => (
                    <Grid item xs={6} md={3} key={stat.title}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="caption" color="text.secondary">
                            {stat.title}
                          </Typography>
                          <Typography variant="h5">{stat.value}</Typography>
                          <Typography variant="caption" color="success.main">
                            {stat.change}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Clock In/Out */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Clock In / Out
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Clock Wednesday, 3 June 2023
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Clock In</Typography>
                  <Typography variant="h6">08:02 am</Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">Clock Out</Typography>
                  <Typography variant="h6">-</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', my: 3 }}>
                  <Typography variant="h3">{currentTime}</Typography>
                  <Typography variant="caption">Current time</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={isClockedIn ? <Pause /> : <PlayArrow />}
                    onClick={() => setIsClockedIn(!isClockedIn)}
                  >
                    {isClockedIn ? 'Clock Out' : 'Clock In'}
                  </Button>
                  <Button fullWidth variant="outlined" startIcon={<Coffee />}>
                    Start Break
                  </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Attendance Overview
                </Typography>
                {/* <Suspense fallback={<LinearProgress />}>
                  <Chart />
                </Suspense> */}
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Tasks (4)</Typography>
                  <Button size="small">View All</Button>
                </Box>
                <List>
                  {tasks.map((task, index) => (
                    <React.Fragment key={index}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'warning.light' }}>
                            {task.assignee?.[0] || 'T'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={task.title}
                          secondary={
                            <>
                              <Typography variant="caption" display="block">
                                {task.date}
                              </Typography>
                              <Chip
                                label={task.status}
                                size="small"
                                color={task.status === 'in progress' ? 'warning' : 'default'}
                                sx={{ mt: 0.5 }}
                              />
                            </>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                      </ListItem>
                      {index < tasks.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

