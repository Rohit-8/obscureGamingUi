import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Circle } from '@mui/icons-material';
import { apiService } from '../services/ApiService';

const OnlinePlayers: React.FC = () => {
  const [onlinePlayers, setOnlinePlayers] = React.useState<any[]>([]);
  const [gameStats, setGameStats] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [users, popular] = await Promise.all([apiService.getOnlineUsers(), apiService.getPopularGames()]);
        if (!mounted) return;
        setOnlinePlayers(users || []);
        // map popular games to simple stat objects
        setGameStats((popular || []).slice(0, 10).map((g: any) => ({ game: g.name, players: g.playCount ?? g.playCount ?? 0 })));
      } catch (err) {
        console.error('Failed to load online players or game stats', err);
        if (!mounted) return;
        setOnlinePlayers([]);
        setGameStats([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🌐 Online Players
        </Typography>
        <Typography variant="h6" color="text.secondary">
          See who's playing right now
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Circle sx={{ color: 'success.main', mr: 1, fontSize: 12 }} />
              <Typography variant="h6">
                {loading ? '...' : onlinePlayers.length} Players Online
              </Typography>
            </Box>

            <List>
              {loading ? (
                <Typography>Loading players...</Typography>
              ) : (
                onlinePlayers.map((player: any) => (
                  <ListItem key={player.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {player.username?.[0] ?? '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={player.username}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            size="small"
                            label={player.currentAction || player.status || 'In Lobby'}
                            color={(player.currentAction || player.status || '').includes('Playing') ? 'success' : 'default'}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {player.lastSeen ?? 'recently'}
                          </Typography>
                        </Box>
                      }
                    />
                    <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎮 Popular Games
            </Typography>
            {loading ? (
              <Typography>Loading game stats...</Typography>
            ) : (
              gameStats.map((stat: any, index: number) => (
                <Card key={index} sx={{ mb: 2, bgcolor: 'background.default' }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2">{stat.game}</Typography>
                      <Chip
                        size="small"
                        label={`${stat.players} playing`}
                        color="primary"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OnlinePlayers;
