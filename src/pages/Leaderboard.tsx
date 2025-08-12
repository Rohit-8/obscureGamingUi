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

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState('all');

  const leaderboardData = [
    { rank: 1, username: 'GameMaster123', score: 25420, games: 156, avatar: 'G' },
    { rank: 2, username: 'PuzzleQueen', score: 23890, games: 142, avatar: 'P' },
    { rank: 3, username: 'ArcadeKing', score: 22150, games: 138, avatar: 'A' },
    { rank: 4, username: 'BrainTeaser', score: 20980, games: 124, avatar: 'B' },
    { rank: 5, username: 'SpeedRunner', score: 19750, games: 119, avatar: 'S' },
    { rank: 6, username: 'StrategyGuru', score: 18420, games: 103, avatar: 'S' },
    { rank: 7, username: 'CasualGamer', score: 16890, games: 95, avatar: 'C' },
    { rank: 8, username: 'YoungProdigy', score: 15240, games: 87, avatar: 'Y' }
  ];

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
              {leaderboardData.map((player) => (
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
                    {Math.round(player.score / player.games)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default Leaderboard;
