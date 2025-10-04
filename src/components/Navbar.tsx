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
import { useHealth } from '../hooks/useHealth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
  navigate('/');
    handleMenuClose();
  };

  const { healthy } = useHealth();

  return (
    <AppBar position="sticky" sx={{ 
      background: 'linear-gradient(90deg, #0f172a, #1e293b)',
      top: 0,
      zIndex: 1300, // Ensure it stays above other content
    }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {/* <Box
            component="img"
            src="/obscurelogofinal-withoutbackground.png"
            alt="Obscure Gaming logo"
            sx={{ height: 32, width: 'auto', mr: 1 }}
          /> */}
            🎮 Obscure Gaming
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/') }>
            Home
          </Button>
          <Button color="inherit" startIcon={<Games />} onClick={() => navigate('/games') }>
            Games
          </Button>
          <Button color="inherit" onClick={() => navigate('/about')}>
            About
          </Button>

          {/* Show leaderboard only if backend healthy */}
          {healthy && (
            <Button color="inherit" startIcon={<Leaderboard />} onClick={() => navigate('/leaderboard')}>
              Leaderboard
            </Button>
          )}

          {healthy === true && isAuthenticated ? (
            <>
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
            </>
          ) : (
            // Not authenticated: show login/register only when backend is healthy
            healthy === true ? (
              <>
                <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
                <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
              </>
            ) : null
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
