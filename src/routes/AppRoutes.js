import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import EmployeeManagement from '../pages/EmployeeManagement';
import Recruitment from '../pages/Recruitment';
import Payroll from '../pages/Payroll';
import TimeOffRequests from '../pages/TimeOffRequests';
import PerformanceReviews from '../pages/PerformanceReviews';
import Reporting from '../pages/Reporting';
import PrivateRoute from '../components/PrivateRoute';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PrivateRoute allowedRoles={['admin', 'employee']}><Dashboard /></PrivateRoute>} />
    <Route path="/employee-management" element={<PrivateRoute allowedRoles={['admin']}><EmployeeManagement /></PrivateRoute>} />
    <Route path="/recruitment" element={<PrivateRoute allowedRoles={['admin']}><Recruitment /></PrivateRoute>} />
    <Route path="/payroll" element={<PrivateRoute allowedRoles={['admin']}><Payroll /></PrivateRoute>} />
    <Route path="/time-off-requests" element={<PrivateRoute allowedRoles={['admin','employee']}><TimeOffRequests /></PrivateRoute>} />
    <Route path="/performance-reviews" element={<PrivateRoute allowedRoles={['admin','employee']}><PerformanceReviews /></PrivateRoute>} />
    <Route path="/reporting" element={<PrivateRoute allowedRoles={['admin']}><Reporting /></PrivateRoute>} />
  </Routes>
);

export default AppRoutes;
