/* import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
  IconButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const drawerWidth = 260;

function ManageRequirement() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [requirements, setRequirements] = useState([]);

  const menuItems = [
    { text: "Dashboard Overview", icon: <DashboardIcon />, path: "/admin" },
    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Manage Test Requirements", icon: <DescriptionIcon />, path: "/admin/requirements" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/landing");
  };

  const fetchRequirements = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/requirements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequirements(res.data);
    } catch (err) {
      console.error("Failed to fetch requirements", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/admin/requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequirements(); // Refresh list after deletion
    } catch (err) {
      console.error("Failed to delete requirement", err);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

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
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 4, ml: `${drawerWidth}px` }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            📝 Manage Requirements
          </Typography>

          <Paper elevation={3} sx={{ p: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>User ID</strong></TableCell>
                  <TableCell><strong>Requirement Text</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirements.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.id}</TableCell>
                    <TableCell>{req.user_id}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "primary.main",
                          cursor: "pointer",
                          textDecoration: "underline",
                          "&:hover": { color: "primary.dark" },
                        }}
                        onClick={() => navigate(`/admin/requirements/${req.id}`)}
                      >
                        {req.requirement_text}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDelete(req.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default ManageRequirement;
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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import AppNavbar from './components/AppNavbar';
import AppTheme from '../shared-theme/AppTheme';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DeleteIcon from '@mui/icons-material/Delete';

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

export default function ManageRequirement() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [requirements, setRequirements] = React.useState([]);

  const menuItems = [
    { text: 'Dashboard Overview', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Manage Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Manage Test Requirements', icon: <DescriptionIcon />, path: '/admin/requirements' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/landing');
  };

  const fetchRequirements = async () => {
    try {
      const res = await axios.get('http://localhost:8000/admin/requirements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequirements(res.data);
    } catch (err) {
      console.error('Failed to fetch requirements', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this requirement?')) return;
    try {
      await axios.delete(`http://localhost:8000/admin/requirements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequirements();
    } catch (err) {
      console.error('Failed to delete requirement', err);
    }
  };

  React.useEffect(() => {
    fetchRequirements();
  }, []);

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
                <ListItemIcon>
                  <ExitToAppIcon />
                </ListItemIcon>
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
                📝 Manage Test Requirements
              </Typography>

              <Grid container spacing={3} sx={{ maxWidth: '1000px', mt: 2 }}>
                <Grid item xs={12}>
                  <Paper elevation={4} sx={{ p: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>ID</strong></TableCell>
                          <TableCell><strong>User ID</strong></TableCell>
                          <TableCell><strong>Requirement Text</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {requirements.map((req) => (
                          <TableRow key={req.id}>
                            <TableCell>{req.id}</TableCell>
                            <TableCell>{req.user_id}</TableCell>
                            <TableCell>
                              <Typography
                                sx={{
                                  color: 'primary.main',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  '&:hover': { color: 'primary.dark' },
                                }}
                                onClick={() => navigate(`/admin/requirements/${req.id}`)}
                              >
                                {req.requirement_text}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton color="error" onClick={() => handleDelete(req.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
