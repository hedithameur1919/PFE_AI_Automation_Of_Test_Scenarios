import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Typography, CssBaseline } from '@mui/material';
import { Route, Routes, Link, BrowserRouter as Router, Navigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types'; 

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Check if the user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.get('http://localhost:8000/protected-route', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(response => {
        setIsAuthenticated(true);
        setUserInfo(response.data);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        
        {/* Sidebar */}
        <Drawer
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <Box sx={{ padding: 2, textAlign: 'center' }}>
            <Typography variant="h6">Admin Panel</Typography>
          </Box>

          <List>
            <ListItem button component={Link} to="/dashboard">
              <ListItemButton>
                <DashboardIcon />
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
            <ListItem button component={Link} to="/profile">
              <ListItemButton>
                <AccountCircleIcon />
                <ListItemText primary="Profile" />
              </ListItemButton>
            </ListItem>
            {!isAuthenticated && (
              <ListItem button component={Link} to="/signin">
                <ListItemButton>
                  <LoginIcon />
                  <ListItemText primary="Sign-in" />
                </ListItemButton>
              </ListItem>
            )}
            {isAuthenticated && (
              <ListItem button onClick={handleLogout}>
                <ListItemButton>
                  <LoginIcon />
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: '#f8f9fa', padding: 3 }}
        >
          <Routes>
            <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/signin" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile userInfo={userInfo} /> : <Navigate to="/signin" />} />
            <Route path="/signin" element={!isAuthenticated ? <SignIn onLogin={handleLogin} /> : <Navigate to="/dashboard" />} />
            <Route path="/" element={<Navigate to="/dashboard" />} /> {/* Default route */}
          </Routes>
        </Box>
      </Box>
    </Router>
  );

  // Handle Logout
  function handleLogout() {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
  }

  // Handle login logic
  function handleLogin(token) {
    localStorage.setItem("access_token", token);
    setIsAuthenticated(true);
  }
};

const Dashboard = () => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Dashboard
    </Typography>
    <Typography variant="body1">
      Welcome to the Admin Dashboard. Here you can manage everything.
    </Typography>
  </Box>
);

const Profile = ({ userInfo }) => (
  <Box>
    <Typography variant="h4" gutterBottom>
      Profile
    </Typography>
    <Typography variant="body1">
      {userInfo ? `Welcome, ${userInfo.username}!` : 'Loading...'}
    </Typography>
  </Box>
);

Profile.propTypes = {
  userInfo: PropTypes.shape({
    username: PropTypes.string.isRequired,
    // Add other user information properties here if needed
  }).isRequired,
};

const SignIn = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/login', { username, password });
      onLogin(response.data.access_token);
    } catch (error) {
      console.error("Error logging in", error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Sign-in
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </Box>
        <Box>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Box>
        <Box>
          <button type="submit">Sign In</button>
        </Box>
      </form>
    </Box>
  );
};

SignIn.propTypes = {
  onLogin: PropTypes.func.isRequired, // Adding PropTypes for onLogin
};

export default AdminDashboard;
