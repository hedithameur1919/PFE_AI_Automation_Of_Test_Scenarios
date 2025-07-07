// frontend/src/admin.jsx
import * as React from 'react';
import {
  Box,
  CssBaseline,
  Stack,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import AppNavbar from './components/AppNavbar';
import AppTheme from '../shared-theme/AppTheme';
import Header from './components/Header';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description'; 
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const drawerWidth = 240;

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = React.useState({
    users: 0,
    scenarios: 0,
    requirements: 0,
    ratings: 0,
    average_rating: 0,
  });

  const menuItems = [
    { text: 'Dashboard Overview', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Manage Test Requirements', icon: <DescriptionIcon />, path: '/admin/requirements' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/landing');
  };

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        {/* Custom SideMenu with Tabs */}
        <Box
          component="nav"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              width: drawerWidth,
              height: '100vh',
              bgcolor: '#f5f5f5',
              boxShadow: 3,
              pt: 8,
            }}
          >
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 1 }} />

            <List>
              <ListItem button onClick={handleLogout}>
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Box>

        {/* Top Navbar and Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          <AppNavbar />
          <Box
            component="main"
            sx={(theme) => ({
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
                : alpha(theme.palette.background.default, 1),
              minHeight: '100vh',
              p: 4,
              mt: 8,
            })}
          >
            <Stack spacing={2} alignItems="center">
              <Header title="📊 Welcome, Admin!" />

              <Grid container spacing={4} sx={{ maxWidth: '1200px', mt: 2 }}>
                <StatCard title="👥 Registered Users" value={stats.users} />
                <StatCard title="📑 Test Scenarios" value={stats.scenarios} />
                <StatCard title="📝 Requirements" value={stats.requirements} />
                <StatCard title="⭐ Total Ratings" value={stats.ratings} />
                <StatCard title="⭐ Average Rating" value={stats.average_rating} />
              </Grid>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 5, color: 'text.secondary' }}
              >
                © {new Date().getFullYear()} TestAutoMate. Admin Panel.
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}

// Reusable Stat Card
// eslint-disable-next-line react/prop-types
function StatCard({ title, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper
        elevation={4}
        sx={{
          p: 3,
          height: '100%',
          borderLeft: '5px solid #1976d2',
        }}
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4">{value}</Typography>
      </Paper>
    </Grid>
  );
}
