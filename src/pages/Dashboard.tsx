import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  Paper
} from '@mui/material';
import { PlayArrow, Star, Timer, Group } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const featuredGames = [
    { id: 'physics', name: 'Physics Interactive', icon: '⚗️', description: 'Explore physics simulations' },
    { id: 'sudoku', name: 'Sudoku', icon: '🧩', description: 'Classic number puzzle' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', description: 'Strategy game with AI' },
    { id: 'simon', name: 'Simon Says', icon: '🔴', description: 'Memory sequence game' }
  ];

  const recentActivity = [
    { game: 'Sudoku', score: 1250, time: '2 hours ago' },
    { game: 'Simon Says', score: 890, time: '1 day ago' },
    { game: 'Physics Interactive', score: 0, time: '2 days ago' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome back, {user?.username}! 🎮
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Ready for your next gaming adventure?
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Featured Games */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              🌟 Featured Games
            </Typography>
            <Grid container spacing={2}>
              {featuredGames.map((game) => (
                <Grid item xs={12} sm={6} key={game.id}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h4" sx={{ mr: 2 }}>{game.icon}</Typography>
                        <Typography variant="h6">{game.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {game.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        startIcon={<PlayArrow />}
                        onClick={() => navigate(`/play/${game.id}`)}
                      >
                        Play Now
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/games')}
            sx={{
              background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
              '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' }
            }}
          >
            View All Games
          </Button>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recent Activity */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              📊 Recent Activity
            </Typography>
            {recentActivity.map((activity, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2">{activity.game}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip size="small" label={`Score: ${activity.score}`} />
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Quick Stats */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎯 Quick Stats
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Games Played:</Typography>
                <Chip label="47" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Best Score:</Typography>
                <Chip label="2,340" size="small" color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Time Played:</Typography>
                <Chip label="12h 30m" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
