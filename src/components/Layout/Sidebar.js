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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  // CalendarMonth as CalendarIcon,
  // Business as CompanyIcon,
  // EventNote as PlanningIcon,
  // BeachAccess as LeaveIcon,
  // AccessTime as TimeTrackIcon,
  // People as PeopleIcon,
  // Work as RecruitmentIcon,
  // AttachMoney as PayrollIcon,
  // Assessment as PerformanceIcon,
  // BarChart as ReportingIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const DRAWER_WIDTH = 260;

const menuItems = [
  { title: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  // { title: 'Calendar', icon: <CalendarIcon />, path: '/calendar' },
  // {
  //   title: 'Company',
  //   icon: <CompanyIcon />,
  //   path: '/company',
  //   adminOnly: true,
  //   children: [
  //     { title: 'Employees', icon: <PeopleIcon />, path: '/employees' },
  //     { title: 'Recruitment', icon: <RecruitmentIcon />, path: '/recruitment' },
  //   ],
  // },
  // { title: 'Planning', icon: <PlanningIcon />, path: '/planning', adminOnly: true },
  // { title: 'Leave Request', icon: <LeaveIcon />, path: '/leave-request' },
  // { title: 'Time Track', icon: <TimeTrackIcon />, path: '/time-track' },
  // { title: 'Payroll', icon: <PayrollIcon />, path: '/payroll', adminOnly: true },
  // { title: 'Performance', icon: <PerformanceIcon />, path: '/performance' },
  // { title: 'Reporting', icon: <ReportingIcon />, path: '/reporting', adminOnly: true },
  // { title: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { title: 'PDF Compare', icon: <SettingsIcon />, path: '/pdf-compare' },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState({});

  const handleMenuClick = (item) => {
    if (item.children) {
      setOpenMenus((prev) => ({
        ...prev,
        [item.title]: !prev[item.title],
      }));
    } else {
      navigate(item.path);
    }
  };

  // ✅ Fix: Compare to current location pathname
  const isActive = (path) => location.pathname === path;

  const filteredMenuItems = menuItems.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" component="h1" sx={{ fontWeight: 700 }}>
          HR-Management
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {filteredMenuItems?.map((item) => (
          <React.Fragment key={item.title}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleMenuClick(item)}
                selected={isActive(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'action.selected',
                  },
                }}
                aria-label={item.title}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
                {item.children &&
                  (openMenus[item.title] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {item.children && (
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
                          '&.Mui-selected': {
                            backgroundColor: 'action.selected',
                          },
                        }}
                        aria-label={child.title}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {child.icon}
                        </ListItemIcon>
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
