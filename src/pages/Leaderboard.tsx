import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { EmojiEvents, Star } from '@mui/icons-material';
import { apiService } from '../services/ApiService';

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState('all');
  const [leaderboardData, setLeaderboardData] = React.useState<Array<any>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const users = await apiService.getLeaderboard();
        if (!mounted) return;
        const mapped = (users || []).map((u: any, idx: number) => ({
          rank: idx + 1,
          username: u.username,
          score: u.totalScore ?? u.score ?? (u.stats?.totalScore ?? 0),
          games: u.stats?.gamesPlayed ?? u.gamesPlayed ?? 0,
          avatar: u.username?.[0] ?? '?'
        }));
        setLeaderboardData(mapped);
      } catch (err: any) {
        console.error('Failed to load leaderboard', err);
        if (!mounted) return;
        setError('Could not load leaderboard');
        setLeaderboardData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [timeframe]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <EmojiEvents sx={{ color: '#FFD700' }} />;
      case 2: return <EmojiEvents sx={{ color: '#C0C0C0' }} />;
      case 3: return <EmojiEvents sx={{ color: '#CD7F32' }} />;
      default: return <Star sx={{ color: 'text.secondary' }} />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🏆 Leaderboard
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Top players and their achievements
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <ToggleButtonGroup
          value={timeframe}
          exclusive
          onChange={(_, value) => value && setTimeframe(value)}
        >
          <ToggleButton value="today">Today</ToggleButton>
          <ToggleButton value="week">This Week</ToggleButton>
          <ToggleButton value="month">This Month</ToggleButton>
          <ToggleButton value="all">All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="right">Total Score</TableCell>
                <TableCell align="right">Games Played</TableCell>
                <TableCell align="right">Avg Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5}><Typography>Loading leaderboard...</Typography></TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={5}><Typography color="error">{error}</Typography></TableCell></TableRow>
              ) : (
                leaderboardData.map((player) => (
                <TableRow key={player.rank} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRankIcon(player.rank)}
                      <Typography variant="h6">#{player.rank}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>{player.avatar}</Avatar>
                      <Typography variant="subtitle1">{player.username}</Typography>
                      {player.rank <= 3 && (
                        <Chip
                          size="small"
                          label="Elite"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="h6" color="primary">
                      {player.score.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{player.games}</TableCell>
                  <TableCell align="right">
                    {player.games ? Math.round(player.score / player.games) : 0}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Leaderboard;
