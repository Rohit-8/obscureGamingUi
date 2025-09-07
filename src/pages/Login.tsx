import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { healthy } = useHealth();

  // If backend is down, don't allow visiting login page
  React.useEffect(() => {
    if (healthy === false) {
      navigate('/');
    }
  }, [healthy, navigate]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            🎮 Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue gaming
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component="button" onClick={() => navigate('/register')}>
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
