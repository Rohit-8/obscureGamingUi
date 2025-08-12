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

const OnlinePlayers: React.FC = () => {
  const onlinePlayers = [
    { id: '1', username: 'GameMaster123', status: 'Playing Sudoku', lastSeen: 'now' },
    { id: '2', username: 'PuzzleQueen', status: 'In Lobby', lastSeen: '2 min ago' },
    { id: '3', username: 'ArcadeKing', status: 'Playing Simon Says', lastSeen: 'now' },
    { id: '4', username: 'BrainTeaser', status: 'Playing Tic Tac Toe', lastSeen: '1 min ago' },
    { id: '5', username: 'SpeedRunner', status: 'In Lobby', lastSeen: '3 min ago' },
    { id: '6', username: 'StrategyGuru', status: 'Playing Tower Defense', lastSeen: 'now' }
  ];

  const gameStats = [
    { game: 'Sudoku', players: 15 },
    { game: 'Tic Tac Toe', players: 8 },
    { game: 'Simon Says', players: 6 },
    { game: 'Tower Defense', players: 4 },
    { game: 'Memory Matching', players: 3 }
  ];

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
                {onlinePlayers.length} Players Online
              </Typography>
            </Box>

            <List>
              {onlinePlayers.map((player) => (
                <ListItem key={player.id}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {player.username[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={player.username}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                        <Chip
                          size="small"
                          label={player.status}
                          color={player.status.includes('Playing') ? 'success' : 'default'}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {player.lastSeen}
                        </Typography>
                      </Box>
                    }
                  />
                  <Circle sx={{ color: 'success.main', fontSize: 12 }} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              🎮 Popular Games
            </Typography>
            {gameStats.map((stat, index) => (
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
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OnlinePlayers;
