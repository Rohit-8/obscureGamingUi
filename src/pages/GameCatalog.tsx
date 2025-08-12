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
  TextField,
  InputAdornment
} from '@mui/material';
import { PlayArrow, Search, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const GameCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');

  const allGames = [
    { id: 'dice', name: 'Dice Game', icon: '🎲', category: 'Luck', difficulty: 'Easy', description: 'Roll dice and score points with patterns' },
    { id: 'tictactoe', name: 'Tic Tac Toe', icon: '⭕', category: 'Strategy', difficulty: 'Easy', description: 'Classic strategy game with AI opponent' },
    { id: 'simon', name: 'Simon Says', icon: '🔴', category: 'Memory', difficulty: 'Medium', description: 'Remember and repeat color sequences' },
    { id: 'memory', name: 'Memory Matching', icon: '🧠', category: 'Memory', difficulty: 'Easy', description: 'Find matching pairs as quickly as possible' },
    { id: 'sudoku', name: 'Sudoku', icon: '🧩', category: 'Puzzle', difficulty: 'Hard', description: 'Fill the grid with numbers 1-9' },
    { id: 'whackamole', name: 'Whack-A-Mole', icon: '🔨', category: 'Arcade', difficulty: 'Medium', description: 'Hit the moles as fast as you can' },
    { id: 'maze', name: 'Maze Navigator', icon: '🧩', category: 'Puzzle', difficulty: 'Medium', description: 'Navigate through generated mazes' },
    { id: 'physics', name: 'Physics Interactive', icon: '⚗️', category: 'Educational', difficulty: 'Medium', description: 'Interactive physics simulations' },
    { id: 'trivia', name: 'Trivia Quiz', icon: '🧠', category: 'Knowledge', difficulty: 'Medium', description: 'Test your knowledge with trivia questions' },
    { id: 'wordsearch', name: 'Word Search', icon: '🔍', category: 'Puzzle', difficulty: 'Easy', description: 'Find hidden words in letter grids' },
    { id: 'mindful', name: 'Mindful Fractal', icon: '🌀', category: 'Relaxation', difficulty: 'Easy', description: 'Meditation with animated fractals' },
    { id: 'rockthebeat', name: 'Rock The Beat', icon: '🎵', category: 'Rhythm', difficulty: 'Hard', description: 'Hit beats in rhythm with music' },
    { id: 'tower', name: 'Tower Defense', icon: '🏰', category: 'Strategy', difficulty: 'Hard', description: 'Defend your base with strategic towers' }
  ];

  const filteredGames = allGames.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🎮 Game Catalog
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Discover and play amazing games
        </Typography>

        <TextField
          fullWidth
          placeholder="Search games or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredGames.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>{game.icon}</Typography>
                  <Box>
                    <Typography variant="h6">{game.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {game.category}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {game.description}
                </Typography>

                <Chip
                  label={game.difficulty}
                  size="small"
                  color={getDifficultyColor(game.difficulty) as any}
                />
              </CardContent>

              <CardActions>
                <Button
                  startIcon={<PlayArrow />}
                  onClick={() => navigate(`/play/${game.id}`)}
                  sx={{
                    background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
                    color: 'white',
                    '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' }
                  }}
                >
                  Play Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredGames.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No games found matching your search.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default GameCatalog;
