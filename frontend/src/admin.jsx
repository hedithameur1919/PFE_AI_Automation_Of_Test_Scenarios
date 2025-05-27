import {
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
  Grid,
  Divider,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const drawerWidth = 260;

function Admin() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/landing");
  };

  const menuItems = [
    { text: "Dashboard Overview", icon: <DashboardIcon />, path: "/admin" },
    { text: "Manage Users", icon: <PeopleIcon />, path: "/admin/users" },
    { text: "Manage Test Requirements", icon: <DescriptionIcon />, path: "/admin/requirements" },
  ];

  const [stats, setStats] = useState({
    users: 0,
    scenarios: 0,
    requirements: 0,
    ratings: 0,
    average_rating: 0,
  });


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    };
  
    fetchStats();
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
              <ListItem button key={item.text} onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 4, ml: `${drawerWidth}px` }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            📊 Welcome, Admin!
          </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderLeft: "5px solid #1976d2" }}>
            <Typography variant="h6">👥 Registered Users</Typography>
            <Typography variant="h4">{stats.users}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderLeft: "5px solid #1976d2" }}>
            <Typography variant="h6">📑 Test Scenarios</Typography>
            <Typography variant="h4">{stats.scenarios}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderLeft: "5px solid #1976d2" }}>
            <Typography variant="h6">📝 Requirements</Typography>
            <Typography variant="h4">{stats.requirements}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderLeft: "5px solid #1976d2" }}>
            <Typography variant="h6">⭐ Total Ratings</Typography>
            <Typography variant="h4">{stats.ratings}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={4} sx={{ p: 3, borderLeft: "5px solid #1976d2" }}>
            <Typography variant="h6">⭐ Average Rating</Typography>
            <Typography variant="h4">{stats.average_rating}</Typography>
          </Paper>
        </Grid>
      </Grid>


          <Typography variant="body2" align="center" sx={{ mt: 5, color: "text.secondary" }}>
            © {new Date().getFullYear()} AI Squash. Admin Panel.
          </Typography>
        </Container>
      </Box>
    </>
  );
}

export default Admin;
