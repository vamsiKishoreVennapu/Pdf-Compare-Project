import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
// import { ProtectedRoute } from './routes/ProtectedRoute';
import { MainLayout } from './components/Layout/MainLayout';
import { register } from './serviceWorkerRegistration';

// Eager load essential pages
// import { Login } from './pages/Login';
// import { Dashboard } from './pages/Dashboard';
// import { DashboardTest } from './pages/DashboardTest';
// import { PdfCompare } from './pages/PdfCompare';
// import { PdfGenerate } from './pages/PDFGenerate/PDFGenerate';

// Lazy load other pages
// const Employees = lazy(() => import('./pages/Employees').then(m => ({ default: m.Employees })));
// const Recruitment = lazy(() => import('./pages/Recruitment').then(m => ({ default: m.Recruitment })));
// const Payroll = lazy(() => import('./pages/Payroll').then(m => ({ default: m.Payroll })));
// const LeaveRequest = lazy(() => import('./pages/LeaveRequest').then(m => ({ default: m.LeaveRequest })));
// const Performance = lazy(() => import('./pages/Performance').then(m => ({ default: m.Performance })));
// const Reporting = lazy(() => import('./pages/Reporting').then(m => ({ default: m.Reporting })));
// const Calendar = lazy(() => import('./pages/Calendar').then(m => ({ default: m.Calendar })));
// const TimeTrack = lazy(() => import('./pages/TimeTrack').then(m => ({ default: m.TimeTrack })));
// const Planning = lazy(() => import('./pages/Planning').then(m => ({ default: m.Planning })));
// const Company = lazy(() => import('./pages/Company').then(m => ({ default: m.Company })));
// const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const PdfCompare = lazy(() => import('./pages/PdfCompare').then(m => ({ default: m.PdfCompare })));
// const Unauthorized = lazy(() => import('./pages/Unauthorized').then(m => ({ default: m.Unauthorized })));
// import { DashboardTest } from './pages/DashboardTest';
const DashboardTest = lazy(() => import('./pages/DashboardTest').then(m => ({ default: m.DashboardTest })));

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

const App = () => {
  useEffect(() => {
    register();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* 1. Root Redirect */}
          <Route path="/" element={<Navigate to="/pdf/compare" replace />} />

          {/* 2. Layout Wrapper for specific valid routes only */}
          <Route
            path="/pdf/*"
            element={
              <MainLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<DashboardTest />} />
                    <Route path="/compare" element={<PdfCompare />} />
                    {/* Inner Catch-all: Redirects /pdf/anything-else to /pdf/compare */}
                    <Route path="*" element={<Navigate to="/compare" replace />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            }
          />

          {/* 3. Global Catch-all (Outside the Layout) */}
          {/* Redirects /sfgfd or anything else to /pdf/compare */}
          <Route path="*" element={<Navigate to="/pdf/compare" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};
export default App;
