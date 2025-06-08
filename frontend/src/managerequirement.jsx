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
