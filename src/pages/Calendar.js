import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';

const events = [
  { id: 1, title: 'Team Meeting', date: '2023-11-03', type: 'meeting' },
  { id: 2, title: 'Project Deadline', date: '2023-11-10', type: 'deadline' },
  { id: 3, title: 'Client Presentation', date: '2023-11-15', type: 'meeting' },
];

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <>
      {/* <SEOHelmet title="Calendar" description="View and manage your schedule and events" /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Calendar
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Event
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Typography>
                  <Box>
                    <IconButton onClick={previousMonth} aria-label="Previous month">
                      <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={nextMonth} aria-label="Next month">
                      <ChevronRight />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={1}>
                  {days.map((day, index) => (
                    <Grid item xs={12 / 7} key={index}>
                      <Box sx={{ textAlign: 'center', py: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {day}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}

                  {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <Grid item xs={12 / 7} key={`empty-${index}`}>
                      <Box sx={{ aspectRatio: '1', p: 1 }} />
                    </Grid>
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const isToday = day === new Date().getDate() &&
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear();

                    return (
                      <Grid item xs={12 / 7} key={day}>
                        <Box
                          sx={{
                            aspectRatio: '1',
                            p: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: isToday ? 'primary.main' : 'transparent',
                            color: isToday ? 'primary.contrastText' : 'text.primary',
                            '&:hover': {
                              bgcolor: isToday ? 'primary.dark' : 'action.hover',
                            },
                          }}
                        >
                          <Typography variant="body2">{day}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Events
                </Typography>
                <List>
                  {events.map((event) => (
                    <ListItem key={event.id} sx={{ px: 0 }}>
                      <ListItemText
                        primary={event.title}
                        secondary={new Date(event.date).toLocaleDateString()}
                      />
                      <Chip
                        label={event.type}
                        size="small"
                        color={event.type === 'meeting' ? 'primary' : 'warning'}
                      />
                    </ListItem>
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
