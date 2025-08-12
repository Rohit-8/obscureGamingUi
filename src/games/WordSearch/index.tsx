import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { Home, Refresh, Search, Timer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWordSearch } from './hooks/useWordSearch';

const WordSearchGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, startSelection, updateSelection, endSelection, setDifficulty, resetGame } = useWordSearch();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCellSelected = (row: number, col: number) => {
    return gameState.selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const handleMouseDown = (row: number, col: number) => {
    startSelection(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (gameState.isSelecting) {
      updateSelection(row, col);
    }
  };

  const handleMouseUp = () => {
    if (gameState.isSelecting) {
      endSelection();
    }
  };

  const renderGrid = () => {
    const cellSize = gameState.difficulty === 'hard' ? 25 : 30;

    return (
      <Box
        sx={{
          display: 'inline-block',
          border: '2px solid #7ee7c7',
          borderRadius: 2,
          p: 1,
          backgroundColor: '#111',
          userSelect: 'none'
        }}
        onMouseLeave={handleMouseUp}
      >
        {gameState.grid.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ display: 'flex' }}>
            {row.map((letter, colIndex) => (
              <Box
                key={`${rowIndex}-${colIndex}`}
                sx={{
                  width: cellSize,
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: isCellSelected(rowIndex, colIndex)
                    ? 'rgba(96, 165, 250, 0.5)'
                    : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  color: '#fff',
                  transition: 'background-color 0.1s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                onMouseUp={handleMouseUp}
              >
                {letter}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🔍 Word Search
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find hidden words in the letter grid!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            {gameState.grid.length > 0 ? renderGrid() : (
              <Typography>Generating puzzle...</Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Chip
                icon={<Search />}
                label={`Found: ${gameState.foundWords.length}/${gameState.words.length}`}
                variant="outlined"
              />
              <Chip
                icon={<Timer />}
                label={`Time: ${formatTime(gameState.timeElapsed)}`}
                variant="outlined"
              />
              <Chip label={`Score: ${gameState.score}`} variant="outlined" />
            </Box>

            {gameState.gameComplete && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" sx={{ color: '#7ee7c7', mb: 2 }}>
                  🎉 Puzzle Complete!
                </Typography>
                <Typography variant="body1">
                  Final Score: {gameState.score} points in {formatTime(gameState.timeElapsed)}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
            <Typography variant="h6" gutterBottom>Words to Find</Typography>

            <List dense>
              {gameState.words.map((word, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={word}
                    sx={{
                      textDecoration: gameState.foundWords.includes(word) ? 'line-through' : 'none',
                      color: gameState.foundWords.includes(word) ? '#7ee7c7' : 'inherit',
                      '& .MuiListItemText-primary': {
                        fontWeight: gameState.foundWords.includes(word) ? 'bold' : 'normal'
                      }
                    }}
                  />
                  {gameState.foundWords.includes(word) && (
                    <Typography variant="body2" sx={{ color: '#7ee7c7' }}>✓</Typography>
                  )}
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Difficulty</Typography>
              <ToggleButtonGroup
                value={gameState.difficulty}
                exclusive
                onChange={(_, value) => value && setDifficulty(value)}
                sx={{ mb: 3, display: 'flex' }}
                size="small"
              >
                <ToggleButton value="easy">Easy</ToggleButton>
                <ToggleButton value="medium">Medium</ToggleButton>
                <ToggleButton value="hard">Hard</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" onClick={resetGame} startIcon={<Refresh />}>
                New Puzzle
              </Button>
              <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
                Back to Games
              </Button>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>How to play:</strong><br />
                • Click and drag to select words<br />
                • Words can be horizontal, vertical, or diagonal<br />
                • Words may be forwards or backwards<br />
                • Find all words to complete the puzzle
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default WordSearchGame;
