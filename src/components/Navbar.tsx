import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Home, Games, Person, ExitToApp, Leaderboard } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  if (!isAuthenticated) return null;

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #0f172a, #1e293b)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          🎮 Obscure Gaming
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
            Dashboard
          </Button>
          <Button color="inherit" startIcon={<Games />} onClick={() => navigate('/games')}>
            Games
          </Button>
          <Button color="inherit" startIcon={<Leaderboard />} onClick={() => navigate('/leaderboard')}>
            Leaderboard
          </Button>

          <IconButton color="inherit" onClick={handleMenuOpen}>
            <Person />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
