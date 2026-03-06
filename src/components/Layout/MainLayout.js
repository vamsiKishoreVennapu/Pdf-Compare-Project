import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { SidebarCollapsable } from './SidebarCollapsable';
import { Header } from './Header';

export const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* The Header is position="fixed" (handled inside Header.js).
         It will stay at the top across the full width. 
      */}
      <Header />

      {/* The Sidebar is variant="temporary" (handled inside SidebarCollapsable.js).
         It slides OVER the content without affecting this Box's width.
      */}
      <SidebarCollapsable />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%', // Fixed width ensures no shifting
          backgroundColor: 'background.default',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Empty Toolbar acts as a spacer so content isn't hidden behind the fixed Header */}
        <Toolbar />
        
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};