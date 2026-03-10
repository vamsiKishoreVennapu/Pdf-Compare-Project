// import { Helmet } from 'react-helmet';
// import React, {
//   // useState, 
//   // useEffect,
//   // lazy, Suspense
// } from 'react';
import {
  Box,
  Grid,
  // Card,
  // CardContent,
  Typography,
  // Button,
  // IconButton,
  // LinearProgress,
  // Chip,
  // List,
  // ListItem,
  // ListItemText,
  // ListItemAvatar,
  // Avatar,
  // Divider,
  Container
} from '@mui/material';
// import {
//   TrendingUp,
//   TrendingDown,
//   // Image,
//   // PlayArrow,
//   // Pause,
//   // Coffee,
//   // CheckCircle,
//   // Schedule,
//   // Warning,
// } from '@mui/icons-material';
// import { SEOHelmet } from '../components/SEOHelmet';
// import { DashboardSkeleton } from '../components/SkeletonLoader';
// import dashboardImage from 'figma:asset/ecfe26b3b7e47765daef76a3db7078ee746a8b84.png';

// Lazy load chart component
// const Chart = lazy(() => import('../components/AttendanceChart'));

import TextInputImage from '../assets/Modern_Text_Input_Icon.png'; // Adjust path to your assets folder
import ImageImage from '../assets/ImageIcon.jpg'; // Adjust path to your assets folder
import PDFImage from '../assets/PDF_file_icon.png'; // Adjust path to your assets folder


// const StatCard = ({ title, value, change, isPositive, icon }) => (
//   <Card>
//     <CardContent>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <Box>
//           <Typography variant="body2" color="text.secondary" gutterBottom>
//             {title}
//           </Typography>
//           <Typography variant="h4" component="div" sx={{ my: 1 }}>
//             {value}
//           </Typography>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//             {isPositive ? (
//               <TrendingUp color="success" fontSize="small" />
//             ) : (
//               <TrendingDown color="error" fontSize="small" />
//             )}
//             <Typography
//               variant="caption"
//               color={isPositive ? 'success.main' : 'error.main'}
//             >
//               {change}
//             </Typography>
//           </Box>
//         </Box>
//         <Box sx={{ color: 'primary.main' }}>{icon}</Box>
//       </Box>
//     </CardContent>
//   </Card>
// );

const imageStyle = {
  width: '100%',
  height: 'auto',
  maxWidth: 100,
  maxHeight: 124,
  borderRadius: '8px',
  display: 'block',
  margin: '0 auto'
};

const imageContainerStyle = {
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'background.paper',
  borderRadius: 4,
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: '1px solid',
  borderColor: 'divider',
  transition: 'transform 0.2s',
  '&:hover': { transform: 'translateY(-5px)' }
};

export const DashboardTest = () => {
  // const [loading, setLoading] = useState(false);
  // const [isClockedIn, setIsClockedIn] = useState(false);
  // const [currentTime, setCurrentTime] = useState('04:02:40');

  // useEffect(() => {
  //   // Simulate data loading
  //   // setTimeout(() => setLoading(false), 1500);

  //   // // Update timer
  //   // const interval = setInterval(() => {
  //   //   const now = new Date();
  //   //   setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
  //   // }, 1000);

  //   // return () => clearInterval(interval);
  // }, []);

  // // if (loading) {
  //   return (
  //     <DashboardSkeleton />
  //   );
  // }

  // const tasks = [
  //   {
  //     title: 'Making work certificate John Doe',
  //     status: 'in progress',
  //     date: '30/06/2023',
  //     assignee: 'Elyse',
  //   },
  //   {
  //     title: 'Call Jack Russel',
  //     date: '3 June 2023 at 10:30 am',
  //     status: 'scheduled',
  //   },
  // ];

  // const schedule = [
  //   { title: 'Meeting with Jeni', time: '3 June 2023 at 10:30 am', checked: true },
  //   { title: 'Interview with John Dubucock', time: '3 June 2023 at 10:30 am', checked: false },
  // ];

  return (
    <>
      {/* <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <img
            src={TextInputImage}
            alt="Delay"
            style={{ width: 100, height: 124, borderRadius: '4px' }}
          />
        </Grid>
        +
        <Grid item xs={12} md={6} lg={3}>
          <img
            src={ImageImage}
            alt="Delay"
            style={{ width: 100, height: 124, borderRadius: '4px' }}
          />
        </Grid>
        =
        <Grid item xs={12} md={6} lg={3}>
          <img
            src={PDFImage}
            alt="Delay"
            style={{ width: 100, height: 124, borderRadius: '4px' }}
          />
        </Grid>
      </Grid> */}
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 6, fontWeight: 700 }}>
          How It Works
        </Typography>

        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="center"
        >
          {/* Step 1: Text Input */}
          <Grid item xs={12} md={2.5}>
            <Box sx={imageContainerStyle}>
              <img src={TextInputImage} alt="Text Input" style={imageStyle} />
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>Text</Typography>
            </Box>
          </Grid>

          {/* PLUS OPERATOR */}
          <Grid item xs={12} md={1}>
            <Typography variant="h3" sx={{ color: 'text.secondary', fontWeight: 300 }}>+</Typography>
          </Grid>

          {/* Step 2: Image */}
          <Grid item xs={12} md={2.5}>
            <Box sx={imageContainerStyle}>
              <img src={ImageImage} alt="Images" style={imageStyle} />
              <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>Images</Typography>
            </Box>
          </Grid>

          {/* EQUALS OPERATOR */}
          <Grid item xs={12} md={1}>
            <Typography variant="h3" sx={{ color: 'text.secondary', fontWeight: 300 }}>=</Typography>
          </Grid>

          {/* Result: PDF */}
          <Grid item xs={12} md={2.5}>
            <Box sx={{ ...imageContainerStyle, borderColor: 'primary.main', borderWidth: 2 }}>
              <img src={PDFImage} alt="PDF Result" style={imageStyle} />
              <Typography variant="subtitle2" sx={{ mt: 1, color: 'primary.main', fontWeight: 700 }}>
                Professional PDF
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

