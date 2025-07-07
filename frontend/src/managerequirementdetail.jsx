/* import {
    AppBar,
    Box,
    Container,
    CssBaseline,
    Divider,
    Drawer,
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    Toolbar,
    Typography,
    Button,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const drawerWidth = 260;

const ManageRequirementDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [requirement, setRequirement] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/landing");
    };

    const menuItems = [
        { text: "Dashboard Overview", icon: <DashboardIcon />, path: "/admin" },
        { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Manage Test Requirements", icon: <DescriptionIcon />, path: "/admin/requirements" },
    ];

    useEffect(() => {
        const fetchRequirementDetail = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(
            `http://localhost:8000/admin/requirements/${id}`,
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            );
            setRequirement(res.data);
        } catch {
            alert("Failed to fetch requirement details");
        } finally {
            setLoading(false);
        }
        };

        fetchRequirementDetail();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this requirement?")) return;
        try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8000/admin/requirements/${id}`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });
        alert("Requirement deleted successfully.");
        navigate("/admin/requirements");
        } catch {
        alert("Error deleting requirement.");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <>
        <CssBaseline />
        <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="600">
                AI Squash - Admin Panel
            </Typography>
            </Toolbar>
        </AppBar>

        <Drawer
            variant="permanent"
            sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: "border-box",
                backgroundColor: "#f5f5f5",
            },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: "auto" }}>
            <List>
                {menuItems.map((item) => (
                <ListItem 
                    button 
                    key={item.text} 
                    onClick={() => navigate(item.path)} 
                    sx={{ cursor: "pointer" }}
                >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                </ListItem>
                ))}
            </List>
            <Divider />
            <List>
                <ListItem 
                    button 
                    onClick={handleLogout}
                    sx={{ cursor: "pointer" }}
                >
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
            </Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 4, ml: `${drawerWidth}px` }}>
            <Toolbar />
            <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>
                📝 Requirement Detail
            </Typography>

            <Paper elevation={4} sx={{ p: 4, mb: 4 }}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6">📌 ID:</Typography>
                    <Typography variant="body1">{requirement.id}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">📋 Requirement:</Typography>
                    <Typography variant="body1">{requirement.requirement_text}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">🧪 Test Scenario:</Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: "#f0f0f0" }}>
                    <Typography variant="body2">
                        {requirement.scenario ? requirement.scenario : "No scenario available."}
                    </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h6">⭐ Rating:</Typography>
                    <Typography variant="body1">{requirement.rating ?? "Not rated"}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                    Delete Requirement
                    </Button>
                </Grid>
                </Grid>
            </Paper>
            </Container>
        </Box>
        </>
    );
};

export default ManageRequirementDetail;
 */

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
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

import AppNavbar from './components/AppNavbar';
import AppTheme from '../shared-theme/AppTheme';

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

const drawerWidth = 240;
const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function ManageRequirementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [requirement, setRequirement] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/landing');
  };

  const menuItems = [
    { text: 'Dashboard Overview', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Manage Test Requirements', icon: <DescriptionIcon />, path: '/admin/requirements' },
  ];

  const fetchRequirementDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8000/admin/requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequirement(res.data);
    } catch (err) {
      console.error('Failed to fetch requirement details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this requirement?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/admin/requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Requirement deleted successfully.');
      navigate('/admin/requirements');
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Error deleting requirement.');
    }
  };

  React.useEffect(() => {
    fetchRequirementDetail();
  }, [id]);

  if (loading) return <Typography variant="body1" sx={{ p: 4 }}>Loading...</Typography>;

  return (
    <AppTheme themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
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
                <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </Box>
        </Box>

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
              <Typography variant="h4" fontWeight="600">
                📝 Requirement Detail
              </Typography>

              <Grid container spacing={3} sx={{ maxWidth: '1000px' }}>
                <Grid item xs={12}>
                  <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h6">📋 Requirement</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {requirement.requirement_text}
                    </Typography>

                    <Typography variant="h6">🧪 Test Scenario</Typography>
                    <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f0f0f0', mb: 2 }}>
                      <Typography variant="body2">
                        {requirement.scenario ? requirement.scenario : 'No scenario available.'}
                      </Typography>
                    </Paper>

                    <Typography variant="h6">⭐ Rating</Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {requirement.rating ?? 'Not rated'}
                    </Typography>

                    <Button variant="contained" color="error" onClick={handleDelete}>
                      Delete Requirement
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}
