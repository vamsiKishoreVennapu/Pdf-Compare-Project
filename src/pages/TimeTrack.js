import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { PlayArrow, Pause, Stop } from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';

export const TimeTrack = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeEntries = [
    { id: 1, date: '2023-11-03', task: 'Development', hours: 8, status: 'approved' },
    { id: 2, date: '2023-11-02', task: 'Meetings', hours: 3, status: 'approved' },
    { id: 3, date: '2023-11-01', task: 'Code Review', hours: 5, status: 'pending' },
  ];

  return (
    <>
      {/* <SEOHelmet title="Time Tracking" description="Track your work hours and activities" /> */}

      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Time Tracking
        </Typography>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Current Session
                </Typography>
                <Typography variant="h2" component="div" sx={{ my: 3, textAlign: 'center' }}>
                  {formatTime(elapsedTime)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={isTracking ? <Pause /> : <PlayArrow />}
                    onClick={() => setIsTracking(!isTracking)}
                  >
                    {isTracking ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Stop />}
                    onClick={() => {
                      setIsTracking(false);
                      setElapsedTime(0);
                    }}
                  >
                    Stop
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  This Week
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Hours
                    </Typography>
                    <Typography variant="h4">40:00</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Billable
                    </Typography>
                    <Typography variant="h4">35:00</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Time Entries
            </Typography>
            <TableContainer>
              <Table aria-label="Time entries table">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Task</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                      <TableCell>{entry.task}</TableCell>
                      <TableCell>{entry.hours}h</TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status}
                          color={entry.status === 'approved' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};
