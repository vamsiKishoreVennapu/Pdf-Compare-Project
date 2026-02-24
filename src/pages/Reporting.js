import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const employeeData = [
  { month: 'Jan', employees: 45 },
  { month: 'Feb', employees: 52 },
  { month: 'Mar', employees: 49 },
  { month: 'Apr', employees: 58 },
  { month: 'May', employees: 62 },
  { month: 'Jun', employees: 65 },
];

const departmentData = [
  { name: 'Engineering', value: 35 },
  { name: 'Product', value: 20 },
  { name: 'Design', value: 15 },
  { name: 'Sales', value: 18 },
  { name: 'HR', value: 12 },
];

const COLORS = ['#4DD4AC', '#6C63FF', '#FF6B9D', '#FFA94D', '#4ECDC4'];

export const Reporting = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reportType, setReportType] = useState('employees');

  return (
    <>
      {/* <SEOHelmet title="Reports & Analytics" description="View HR analytics and generate reports" /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Reports & Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              size="small"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="employees">Employee Report</MenuItem>
              <MenuItem value="payroll">Payroll Report</MenuItem>
              <MenuItem value="attendance">Attendance Report</MenuItem>
              <MenuItem value="performance">Performance Report</MenuItem>
            </TextField>
            <Button variant="outlined" startIcon={<PrintIcon />}>
              Print
            </Button>
            <Button variant="contained" startIcon={<ExportIcon />}>
              Export
            </Button>
          </Box>
        </Box>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 3 }}>
              <Tab label="Overview" />
              <Tab label="Trends" />
              <Tab label="Departments" />
            </Tabs>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Employee Growth
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={employeeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="employees" fill="#4DD4AC" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Department Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => entry.name}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Attendance Trends
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={employeeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="employees"
                          stroke="#6C63FF"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Employees
                </Typography>
                <Typography variant="h4">65</Typography>
                <Typography variant="caption" color="success.main">
                  +5% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Avg. Attendance
                </Typography>
                <Typography variant="h4">94%</Typography>
                <Typography variant="caption" color="success.main">
                  +2% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Turnover Rate
                </Typography>
                <Typography variant="h4">3.2%</Typography>
                <Typography variant="caption" color="error.main">
                  +0.5% from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Satisfaction Score
                </Typography>
                <Typography variant="h4">4.2/5</Typography>
                <Typography variant="caption" color="success.main">
                  +0.3 from last month
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
