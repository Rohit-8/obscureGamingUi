import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Grid,
  Chip,
  Button,
  TextField
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/ApiService';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [loadingStats, setLoadingStats] = React.useState(false);
  const [userStats, setUserStats] = React.useState<{ gamesPlayed?: number; totalScore?: number; timePlayed?: string; achievements?: number } | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        if (!user) {
          setUserStats(null);
          return;
        }
        const profile = await apiService.getUserProfile(user.id);
        if (!mounted) return;
        // types define user.stats: UserStats
        const stats = profile.stats ?? ({} as any);
        setUserStats({
          gamesPlayed: stats.gamesPlayed ?? 0,
          totalScore: stats.totalScore ?? 0,
          timePlayed: (stats as any).timePlayed ?? '0h',
          achievements: (stats as any).achievements ?? 0
        });
      } catch (err) {
        console.error('Failed to load user stats', err);
        if (!mounted) return;
        setUserStats(null);
      } finally {
        if (mounted) setLoadingStats(false);
      }
    };

    loadStats();
    return () => { mounted = false; };
  }, [user]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4">{user?.username}</Typography>
            <Typography variant="body1" color="text.secondary">{user?.email}</Typography>
            <Chip label="Active Player" color="success" sx={{ mt: 1 }} />
          </Box>
          <Button startIcon={<Edit />} onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Save' : 'Edit'}
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Profile Information</Typography>
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Username" defaultValue={user?.username} />
                <TextField label="Email" defaultValue={user?.email} />
                <TextField label="Bio" multiline rows={3} placeholder="Tell us about yourself..." />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Gaming enthusiast exploring the world of interactive entertainment.
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Gaming Stats</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {loadingStats ? (
                <Typography>Loading stats...</Typography>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Games Played:</Typography>
                    <Chip label={userStats?.gamesPlayed ?? '0'} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Total Score:</Typography>
                    <Chip label={userStats?.totalScore ?? '0'} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Time Played:</Typography>
                    <Chip label={userStats?.timePlayed ?? '0h'} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Achievements:</Typography>
                    <Chip label={userStats?.achievements ?? '0'} size="small" />
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
