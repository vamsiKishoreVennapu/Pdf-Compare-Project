import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { TableSkeleton } from '../components/SkeletonLoader';

const mockEmployees = [
  {
    id: '1',
    name: 'Albert Henoy',
    email: 'albert.henoy@company.com',
    position: 'Senior Developer',
    department: 'Engineering',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    joinDate: '2022-01-15',
    salary: 85000,
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john.doe@company.com',
    position: 'Product Manager',
    department: 'Product',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    joinDate: '2021-06-10',
    salary: 95000,
  },
  {
    id: '3',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    position: 'UX Designer',
    department: 'Design',
    status: 'on-leave',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    joinDate: '2022-03-20',
    salary: 75000,
  },
  {
    id: '4',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    position: 'HR Manager',
    department: 'HR',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    joinDate: '2020-11-05',
    salary: 78000,
  },
];

export const Employees = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  // const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setEmployees(mockEmployees);
      setLoading(false);
    }, 1000);
  }, []);

  const handleMenuOpen = (event, employee) => {
    setAnchorEl(event.currentTarget);
    // setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'on-leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <>
        {/* <SEOHelmet title="Employees" /> */}
        <TableSkeleton rows={8} />
      </>
    );
  }

  return (
    <>
      {/* <SEOHelmet
        title="Employee Management"
        description="Manage your organization's employees and their information"
      /> */}

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Employee Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<ExportIcon />}>
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Employee
            </Button>
          </Box>
        </Box>

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table aria-label="Employees table">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Join Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={employee.avatar} alt={employee.name} />
                          <Box>
                            <Typography variant="body2">{employee.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {employee.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        {new Date(employee.joinDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.status}
                          color={getStatusColor(employee.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, employee)}
                          aria-label="Employee actions"
                        >
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

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleMenuClose}>
            <EditIcon sx={{ mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <DeleteIcon sx={{ mr: 1 }} /> Delete
          </MenuItem>
        </Menu>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Full Name" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" type="email" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Position" required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select label="Department">
                    <MenuItem value="engineering">Engineering</MenuItem>
                    <MenuItem value="product">Product</MenuItem>
                    <MenuItem value="design">Design</MenuItem>
                    <MenuItem value="hr">HR</MenuItem>
                    <MenuItem value="sales">Sales</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Join Date" type="date" InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Salary" type="number" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setOpenDialog(false)}>
              Add Employee
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
