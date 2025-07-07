import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Sitemark from './SitemarkIcon';

export default function HomeNavbar({ username, onLogout }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Sitemark sx={{ mr: 1 }} />
          <Typography variant="h6" color="primary" sx={{ fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/')}>
            TestAutoMate
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.primary">
            Hello, {username}
          </Typography>
          <Button variant="outlined" color="error" size="small" onClick={onLogout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>Hello, {username}</MenuItem>
            <MenuItem onClick={onLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
HomeNavbar.propTypes = {
  username: PropTypes.string.isRequired,
  onLogout: PropTypes.func.isRequired,
};