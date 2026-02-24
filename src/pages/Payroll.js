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
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Send as SendIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { TableSkeleton } from '../components/SkeletonLoader';

const mockPayroll = [
  {
    id: '1',
    employeeName: 'Albert Henoy',
    employeeId: 'EMP001',
    baseSalary: 85000,
    bonus: 5000,
    deductions: 12000,
    netPay: 78000,
    status: 'paid',
    payDate: '2023-10-31',
  },
  {
    id: '2',
    employeeName: 'John Doe',
    employeeId: 'EMP002',
    baseSalary: 95000,
    bonus: 7000,
    deductions: 15000,
    netPay: 87000,
    status: 'paid',
    payDate: '2023-10-31',
  },
  {
    id: '3',
    employeeName: 'Jane Smith',
    employeeId: 'EMP003',
    baseSalary: 75000,
    bonus: 3000,
    deductions: 10000,
    netPay: 68000,
    status: 'processing',
    payDate: '2023-11-30',
  },
];

export const Payroll = () => {
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('2023-10');

  useEffect(() => {
    setTimeout(() => {
      setPayroll(mockPayroll);
      setLoading(false);
    }, 1000);
  }, []);

  const totalPayroll = payroll.reduce((sum, record) => sum + record.netPay, 0);
  const paidAmount = payroll
    .filter((r) => r.status === 'paid')
    .reduce((sum, record) => sum + record.netPay, 0);

  if (loading) {
    return (
      <>
        {/* <SEOHelmet title="Payroll" /> */}
        <TableSkeleton />
      </>
    );
  }

  return (
    <>
      {/* <SEOHelmet title="Payroll" description="Manage employee payroll and compensation" /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Payroll Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              size="small"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="2023-10">October 2023</MenuItem>
              <MenuItem value="2023-11">November 2023</MenuItem>
              <MenuItem value="2023-12">December 2023</MenuItem>
            </TextField>
            <Button variant="outlined" startIcon={<DownloadIcon />}>
              Export Report
            </Button>
            <Button variant="contained" startIcon={<SendIcon />}>
              Process Payroll
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Payroll
                </Typography>
                <Typography variant="h5">
                  ${totalPayroll.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Paid This Month
                </Typography>
                <Typography variant="h5" color="success.main">
                  ${paidAmount.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pending Payments
                </Typography>
                <Typography variant="h5" color="warning.main">
                  {payroll.filter((r) => r.status !== 'paid').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Employees
                </Typography>
                <Typography variant="h5">{payroll.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <TableContainer>
              <Table aria-label="Payroll table">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell align="right">Base Salary</TableCell>
                    <TableCell align="right">Bonus</TableCell>
                    <TableCell align="right">Deductions</TableCell>
                    <TableCell align="right">Net Pay</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Pay Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payroll.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>{record.employeeId}</TableCell>
                      <TableCell align="right">${record.baseSalary.toLocaleString()}</TableCell>
                      <TableCell align="right">${record.bonus.toLocaleString()}</TableCell>
                      <TableCell align="right">${record.deductions.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ${record.netPay.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={
                            record.status === 'paid'
                              ? 'success'
                              : record.status === 'processing'
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(record.payDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" aria-label="More actions">
                          <MoreVertIcon />
                        </IconButton>
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
