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
  // Tooltip,
  // Toolbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  // Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;

export const SidebarCollapsable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [isExpanded, setIsExpanded] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const toggleDrawer = () => setIsExpanded(!isExpanded);

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenus((prev) => ({
        ...prev,
        [item.title]: !prev[item.title],
      }));
    } else {
      navigate(item.path);
      setIsExpanded(false); // Close overlay after navigation
    }
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { title: 'PDF Compare', icon: <DashboardIcon />, path: '/pdf/compare' },
    // { title: 'PDF Generate', icon: <SettingsIcon />, path: '/pdf/generate' },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <>
      {/* 1. THE TOGGLE BUTTON (Visible when sidebar is closed) */}
      {!isExpanded && (
        <Box sx={{ position: 'fixed', left: 16, top: 12, zIndex: 1201 }}>
          <IconButton
            onClick={toggleDrawer}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* 2. THE DRAWER (The Overlay) */}
      <Drawer
        variant="temporary"
        open={isExpanded}
        onClose={toggleDrawer}
        hideBackdrop={false} // Set to true if you don't want the dimmed background
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          zIndex: (theme) => theme.zIndex.appBar + 100,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            boxShadow: (theme) => theme.shadows[10],
            borderRight: 'none',
          },
        }}
      >
        {/* Top Header of Sidebar */}
        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64
        }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, ml: 1 }}>
            PDF Visualizer
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <List sx={{ px: 2 }}>
          {filteredMenuItems.map((item) => (
            <React.Fragment key={item.title}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleMenuClick(item)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      '& .MuiListItemIcon-root': { color: 'primary.main' }
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500 }}
                  />
                  {item.children && (openMenus[item.title] ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>

              {item.children && (
                <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.title} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => {
                            navigate(child.path);
                            setIsExpanded(false);
                          }}
                          selected={isActive(child.path)}
                          sx={{
                            pl: 5,
                            borderRadius: 2,
                            '&.Mui-selected': { backgroundColor: 'action.selected' },
                          }}
                        >
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
    </>
  );
};