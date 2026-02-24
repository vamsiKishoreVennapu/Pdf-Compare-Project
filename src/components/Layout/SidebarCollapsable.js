import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Collapse,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;

const menuItems = [
  { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { title: 'PDF Compare', icon: <SettingsIcon />, path: '/pdf-compare' },
];

export const SidebarCollapsable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // States
  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleDrawer = () => setIsExpanded(!isExpanded);

  const handleMenuClick = (item) => {
    if (item.children) {
      // If sidebar is collapsed, open it first when clicking a parent
      if (!isExpanded) {
        setIsExpanded(true);
      }
      setOpenMenus((prev) => ({
        ...prev,
        [item.title]: !prev[item.title],
      }));
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path) => location.pathname === path;

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isExpanded ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        transition: (theme) => theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isExpanded ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      {/* Header with Toggle Button */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isExpanded ? 'space-between' : 'center',
        minHeight: 64 
      }}>
        {isExpanded && (
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            HR-Management
          </Typography>
        )}
        <IconButton onClick={toggleDrawer}>
          {isExpanded ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <List sx={{ px: isExpanded ? 2 : 1 }}>
        {filteredMenuItems?.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={!isExpanded ? item.title : ""} placement="right">
                <ListItemButton
                  onClick={() => handleMenuClick(item)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    justifyContent: isExpanded ? 'initial' : 'center',
                    px: 2.5,
                    '&.Mui-selected': { backgroundColor: 'action.selected' },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0, 
                    mr: isExpanded ? 2 : 'auto', 
                    justifyContent: 'center' 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  
                  {isExpanded && <ListItemText primary={item.title} />}
                  
                  {isExpanded && item.children &&
                    (openMenus[item.title] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </Tooltip>
            </ListItem>

            {/* Nested Items (only show if expanded) */}
            {isExpanded && item.children && (
              <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.title} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate(child.path)}
                        selected={isActive(child.path)}
                        sx={{
                          pl: 4,
                          borderRadius: 2,
                          '&.Mui-selected': { backgroundColor: 'action.selected' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{child.icon}</ListItemIcon>
                        <ListItemText primary={child.title} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};