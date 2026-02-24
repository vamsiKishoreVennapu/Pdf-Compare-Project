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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
} from '@mui/material';
import { Add as AddIcon, BeachAccess as LeaveIcon } from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { TableSkeleton } from '../components/SkeletonLoader';

const mockLeaves = [
  {
    id: '1',
    employeeName: 'Albert Henoy',
    type: 'Vacation',
    startDate: '2023-11-15',
    endDate: '2023-11-20',
    days: 5,
    reason: 'Family vacation',
    status: 'approved',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  },
  {
    id: '2',
    employeeName: 'Jane Smith',
    type: 'Sick Leave',
    startDate: '2023-11-10',
    endDate: '2023-11-12',
    days: 2,
    reason: 'Medical appointment',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  },
];

export const LeaveRequest = () => {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLeaves(mockLeaves);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <>
        {/* <SEOHelmet title="Leave Requests" /> */}
        <TableSkeleton />
      </>
    );
  }

  const totalLeaves = 20;
  const usedLeaves = 8;
  // const pendingRequests = leaves.filter((l) => l.status === 'pending').length;

  return (
    <>
      {/* <SEOHelmet title="Leave Requests" description="Manage time-off and leave requests" /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Leave Requests
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Request Leave
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LeaveIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Leave Days
                    </Typography>
                    <Typography variant="h5">{totalLeaves}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LeaveIcon color="success" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Used
                    </Typography>
                    <Typography variant="h5">{usedLeaves}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LeaveIcon color="warning" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining
                    </Typography>
                    <Typography variant="h5">{totalLeaves - usedLeaves}</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Leave History
            </Typography>
            <TableContainer>
              <Table aria-label="Leave requests table">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={leave.avatar} alt={leave.employeeName} />
                          {leave.employeeName}
                        </Box>
                      </TableCell>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>
                        {new Date(leave.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(leave.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          color={
                            leave.status === 'approved'
                              ? 'success'
                              : leave.status === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
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

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Request Time Off</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField select fullWidth label="Leave Type" defaultValue="vacation">
                  <MenuItem value="vacation">Vacation</MenuItem>
                  <MenuItem value="sick">Sick Leave</MenuItem>
                  <MenuItem value="personal">Personal Leave</MenuItem>
                  <MenuItem value="maternity">Maternity Leave</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Reason" multiline rows={4} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              Submit Request
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
