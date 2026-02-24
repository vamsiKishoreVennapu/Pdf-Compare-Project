// import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  // InputBase,
  IconButton,
  // Avatar,
  // Badge,
  // Menu,
  // MenuItem,
  // Divider,
  Typography,
} from '@mui/material';
import {
  //   Search as SearchIcon,
  //   Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  //   Logout as LogoutIcon,
  //   Person as PersonIcon,
} from '@mui/icons-material';
// import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
// import { useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 260;

export const Header = () => {
  // const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  // const navigate = useNavigate();

  // ✅ Fixed: plain JS state (removed TypeScript type argument)
  // const [anchorEl, setAnchorEl] = useState(null);

  // const handleMenuOpen = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };

  // const handleMenuClose = () => {
  //   setAnchorEl(null);
  // };

  // const handleLogout = () => {
  //   logout();
  //   navigate('/login');
  //   handleMenuClose();
  // };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        // width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      <Toolbar>
        {/* 🔍 Search box */}
        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'action.hover',
            borderRadius: 2,
            px: 2,
            py: 0.5,
            flex: 1,
            maxWidth: 400,
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search for anything..."
            fullWidth
            inputProps={{ 'aria-label': 'search' }}
          />
        </Box> */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Visual PDF Analysis
        </Typography>
        <Box sx={{ flexGrow: 1 }} />

        {/* 🌗 Theme toggle */}
        <IconButton
          onClick={toggleTheme}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          sx={{ mr: 1 }}
        >
          {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        {/* 🔔 Notifications */}
        {/* <IconButton aria-label="show notifications" sx={{ mr: 2 }}>
          <Badge badgeContent={3} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton> */}

        {/* 👤 User menu */}
        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: 1,
          }}
          onClick={handleMenuOpen}
          role="button"
          aria-label="User menu"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleMenuOpen(e);
            }
          }}
        >
          <Typography variant="body2">{user?.name}</Typography>
          <Avatar
            src={user?.avatar}
            alt={user?.name}
            sx={{ width: 36, height: 36 }}
          />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => {
              navigate('/settings');
              handleMenuClose();
            }}
          >
            <PersonIcon sx={{ mr: 1 }} /> Profile
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1 }} /> Logout
          </MenuItem>
        </Menu> */}
      </Toolbar>
    </AppBar>
  );
};
