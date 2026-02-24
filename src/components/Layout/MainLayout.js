// import React from 'react';
// import { Box, Toolbar } from '@mui/material';
// import { SidebarCollapsable } from './SidebarCollapsable';
// // import { Sidebar } from './Sidebar';
// import { Header } from './Header';

// const DRAWER_WIDTH = 260;

// export const MainLayout = ({ children }) => {
//   return (
//     <Box sx={{ display: 'flex' }}>
//       {/* <Sidebar /> */}
//       <SidebarCollapsable />
//       <Header />
//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           p: 3,
//           width: `calc(100% - ${DRAWER_WIDTH}px)`,
//           minHeight: '100vh',
//           backgroundColor: 'background.default',
//         }}
//       >
//         <Toolbar />
//         {children}
//       </Box>
//     </Box>
//   );
// };


import React from 'react';
import { Box, Toolbar } from '@mui/material';
// import { SidebarCollapsable } from './SidebarCollapsable';
import { Header } from './Header';

export const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* <SidebarCollapsable /> */}
      <Header />
      <Box
        component="main"
        sx={{
          // flexGrow allows this box to take up all remaining horizontal space
          flexGrow: 1,
          p: 3,
          // Remove the hardcoded calc(100% - 260px)
          // Setting width to 0 ensures the flexbox can shrink/grow correctly without 
          // being pushed out by long content or pre-defined widths.
          width: { sm: `calc(100% - 0px)` }, 
          minHeight: '100vh',
          backgroundColor: 'background.default',
          // Transition matches the sidebar for a smooth animation
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};