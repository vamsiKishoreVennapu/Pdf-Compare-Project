import React, {
  createContext, useContext, useState, useEffect,
  // ReactNode,
  useMemo
} from 'react';
import {
  ThemeProvider as MuiThemeProvider, createTheme,
  //  Theme
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('hr_theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('hr_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? 'dark' : 'light',
          // primary: {
          //   main: '#4DD4AC', // Mint blue/teal
          //   light: '#7EDDBE',
          //   dark: '#3AB896',
          //   contrastText: '#fff',
          // },
          // primary: {
          //   main: '#34495E', //light navy blue
          //   light: '#5D6D7E',
          //   dark: '#283747',
          //   contrastText: '#fff',
          // },
          primary: {
            main: '#4A6FA5',
            light: '#88A3CC',
            dark: '#166088',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#6C63FF',
            light: '#9894FF',
            dark: '#4B44CC',
          },
          background: {
            default: isDarkMode ? '#121212' : '#F5F9F8',
            paper: isDarkMode ? '#1E1E1E' : '#FFFFFF',
          },
          text: {
            primary: isDarkMode ? '#FFFFFF' : '#1A1A1A',
            secondary: isDarkMode ? '#B3B3B3' : '#666666',
          },
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: isDarkMode
                  ? '0 2px 8px rgba(0, 0, 0, 0.4)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
              },
            },
          },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
