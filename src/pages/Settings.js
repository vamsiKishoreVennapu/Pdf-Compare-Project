import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
// import { SEOHelmet } from '../components/SEOHelmet';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const Settings = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <>
      {/* <SEOHelmet title="Settings" description="Manage your account settings and preferences" /> */}

      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar src={user?.avatar} sx={{ width: 80, height: 80 }} />
                  <Button variant="outlined" size="small">
                    Change Photo
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Full Name" defaultValue={user?.name} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email" defaultValue={user?.email} disabled />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone Number" defaultValue="+1 234 567 8900" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Department" defaultValue="Engineering" />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Bio" multiline rows={4} />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                  <Button variant="contained" sx={{ mr: 2 }}>
                    Save Changes
                  </Button>
                  <Button variant="outlined">Cancel</Button>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Current Password" type="password" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="New Password" type="password" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Confirm New Password" type="password" />
                  </Grid>
                </Grid>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <FormControlLabel
                  control={<Switch checked={isDarkMode} onChange={toggleTheme} />}
                  label="Dark Mode"
                />
                <Divider sx={{ my: 2 }} />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email Notifications"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Push Notifications"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="SMS Notifications"
                />
              </CardContent>
            </Card>

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Info
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user?.role === 'admin' ? 'Administrator' : 'Employee'}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1">January 2023</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
