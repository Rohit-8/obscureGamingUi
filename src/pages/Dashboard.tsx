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
import { PlayArrow } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHealth } from '../hooks/useHealth';
import { apiService } from '../services/ApiService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { healthy } = useHealth();

  // UI-curated featured games remain static
  const featuredGames = [
    { id: 'physics', name: 'Physics Interactive', icon: '⚗️', description: 'Explore physics simulations' },
    { id: 'sudoku', name: 'Sudoku', icon: '🧩', description: 'Classic number puzzle' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', description: 'Strategy game with AI' },
    { id: 'simon', name: 'Simon Says', icon: '🔴', description: 'Memory sequence game' }
  ];

  // dynamic data (fetched from backend)
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const [profileStats, setProfileStats] = React.useState<{ gamesPlayed?: number; bestScore?: number; timePlayed?: string } | null>(null);
  const [loadingRecent, setLoadingRecent] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const loadRecent = async () => {
      setLoadingRecent(true);
      try {
        if (!user) {
          setRecentActivity([]);
          return;
        }
        // Best-effort: use leaderboard as source for recent activity if explicit endpoint not available
        const leaderboard = await apiService.getLeaderboard();
        if (!mounted) return;
        const recent = (leaderboard || []).slice(0, 5).map((u: any) => ({
          game: u.lastPlayedGame || 'Unknown',
          score: u.score ?? 0,
          time: u.lastPlayedAt ? new Date(u.lastPlayedAt).toLocaleString() : 'recently'
        }));
        setRecentActivity(recent);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setRecentActivity([]);
        setError('Failed to load recent activity');
      } finally {
        if (mounted) setLoadingRecent(false);
      }
    };

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        if (!user) {
          setProfileStats(null);
          return;
        }
        const profile = await apiService.getUserProfile(user.id);
        if (!mounted) return;
        const stats = (profile as any).stats ?? {};
        setProfileStats({
          gamesPlayed: stats.gamesPlayed ?? 0,
          bestScore: stats.totalScore ?? 0,
          timePlayed: (stats as any).timePlayed ?? '0h'
        });
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setProfileStats(null);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    loadRecent();
    loadProfile();

    return () => { mounted = false; };
  }, [user]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Obscure Gaming 🎮
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
          {healthy ? (
            // Backend healthy: show quick stats always; recent activity only if user present
            <>
              {user && (
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📊 Recent Activity
                  </Typography>
                  {loadingRecent ? (
                    <Typography>Loading recent activity...</Typography>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2">{activity.game}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Chip size="small" label={`Score: ${activity.score}`} />
                          <Typography variant="caption" color="text.secondary">
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Paper>
              )}

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🎯 Quick Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Games Played:</Typography>
                    <Chip label={loadingProfile ? '...' : (profileStats?.gamesPlayed ?? '0')} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Best Score:</Typography>
                    <Chip label={loadingProfile ? '...' : (profileStats?.bestScore ?? '0')} size="small" color="primary" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Time Played:</Typography>
                    <Chip label={loadingProfile ? '...' : (profileStats?.timePlayed ?? '0h')} size="small" />
                  </Box>
                </Box>
              </Paper>
            </>
          ) : (
            // Backend down or user not logged in: show neutral, helpful content (no mention of backend)
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🔎 Discover More
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Try these popular picks or explore categories to find games you like.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {featuredGames.slice(0, 4).map((g) => (
                    <Button key={g.id} variant="text" onClick={() => navigate(`/play/${g.id}`)} sx={{ justifyContent: 'flex-start' }}>
                      {g.icon} &nbsp; {g.name}
                    </Button>
                  ))}
                </Box>
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  🎯 Quick Links
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={() => navigate('/games')}>View All Games</Button>
                  <Button variant="outlined" size="small" onClick={() => navigate('/games')}>Categories</Button>
                  <Button variant="outlined" size="small" onClick={() => navigate('/games')}>Popular</Button>
                </Box>
              </Paper>
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
