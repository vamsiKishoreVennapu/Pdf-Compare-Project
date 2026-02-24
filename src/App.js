import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { register } from './serviceWorkerRegistration';

// Eager load essential pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { PdfCompare } from './pages/PdfCompare';


// Lazy load other pages
const Employees = lazy(() => import('./pages/Employees').then(m => ({ default: m.Employees })));
const Recruitment = lazy(() => import('./pages/Recruitment').then(m => ({ default: m.Recruitment })));
const Payroll = lazy(() => import('./pages/Payroll').then(m => ({ default: m.Payroll })));
const LeaveRequest = lazy(() => import('./pages/LeaveRequest').then(m => ({ default: m.LeaveRequest })));
const Performance = lazy(() => import('./pages/Performance').then(m => ({ default: m.Performance })));
const Reporting = lazy(() => import('./pages/Reporting').then(m => ({ default: m.Reporting })));
const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
const TimeTrack = lazy(() => import('./pages/TimeTrack').then(m => ({ default: m.TimeTrack })));
const Planning = lazy(() => import('./pages/Planning').then(m => ({ default: m.Planning })));
const Company = lazy(() => import('./pages/Company').then(m => ({ default: m.Company })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
// const PdfCompare = lazy(() => import('./pages/PdfCompare').then(m => ({ default: m.PdfCompare })));
const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));

const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
    }}
  >
    <CircularProgress />
  </Box>
);

const App= () => {
  useEffect(() => {
    // Register service worker for PWA functionality
    register();
  }, []);

  return (
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Unauthorized />
                </Suspense>
              } />

              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Suspense fallback={<LoadingFallback />}>
                        <Routes>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/leave-request" element={<LeaveRequest />} />
                          <Route path="/time-track" element={<TimeTrack />} />
                          <Route path="/performance" element={<Performance />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/pdf-compare" element={<PdfCompare />} />

                          {/* Admin only routes */}
                          <Route
                            path="/employees"
                            element={
                              <ProtectedRoute allowedRoles={['admin']}>
                                <Employees />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/recruitment"
                            element={
                              <ProtectedRoute allowedRoles={['admin']}>
                                <Recruitment />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/payroll"
                            element={
                              <ProtectedRoute allowedRoles={['admin']}>
                                <Payroll />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/reporting"
                            element={
                              <ProtectedRoute allowedRoles={['admin']}>
                                <Reporting />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/planning"
                            element={
                              <ProtectedRoute allowedRoles={['admin']}>
                                <Planning />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/company"
                            element={
                              <ProtectedRoute allowedRoles={['admin']}>
                                <Company />
                              </ProtectedRoute>
                            }
                          />

                          {/* Redirect root to dashboard */}
                          {/* <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}

                          <Route path="/" element={<Navigate to="/pdf-compare" replace />} />
                          <Route path="*" element={<Navigate to="/pdf-compare" replace />} />
                        </Routes>
                      </Suspense>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
  );
};

export default App;
