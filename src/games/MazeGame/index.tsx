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
  Switch,
  FormControlLabel
} from '@mui/material';
import { Home, Refresh, Lightbulb, KeyboardArrowUp, KeyboardArrowDown, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMazeGame } from './hooks/useMazeGame';

const MazeGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, movePlayer, setDifficulty, toggleSolution, resetGame } = useMazeGame();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMaze = () => {
    const cellSize = gameState.difficulty === 'hard' ? 20 : gameState.difficulty === 'medium' ? 25 : 30;

    return (
      <Box sx={{ display: 'inline-block', border: '3px solid #7ee7c7', borderRadius: 2, p: 1, backgroundColor: '#000' }}>
        <svg width={gameState.maze[0]?.length * cellSize} height={gameState.maze.length * cellSize}>
          {gameState.maze.map((row, y) =>
            row.map((cell, x) => {
              const isPlayer = gameState.player.x === x && gameState.player.y === y;
              const isGoal = gameState.goal.x === x && gameState.goal.y === y;
              const isOnSolution = gameState.showSolution && gameState.solution.some(pos => pos.x === x && pos.y === y);

              return (
                <g key={`${x}-${y}`}>
                  {/* Cell background */}
                  <rect
                    x={x * cellSize}
                    y={y * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={isOnSolution ? 'rgba(255, 255, 0, 0.3)' : '#111'}
                  />

                  {/* Walls */}
                  {cell.walls.top && (
                    <line
                      x1={x * cellSize}
                      y1={y * cellSize}
                      x2={(x + 1) * cellSize}
                      y2={y * cellSize}
                      stroke="#7ee7c7"
                      strokeWidth="2"
                    />
                  )}
                  {cell.walls.right && (
                    <line
                      x1={(x + 1) * cellSize}
                      y1={y * cellSize}
                      x2={(x + 1) * cellSize}
                      y2={(y + 1) * cellSize}
                      stroke="#7ee7c7"
                      strokeWidth="2"
                    />
                  )}
                  {cell.walls.bottom && (
                    <line
                      x1={x * cellSize}
                      y1={(y + 1) * cellSize}
                      x2={(x + 1) * cellSize}
                      y2={(y + 1) * cellSize}
                      stroke="#7ee7c7"
                      strokeWidth="2"
                    />
                  )}
                  {cell.walls.left && (
                    <line
                      x1={x * cellSize}
                      y1={y * cellSize}
                      x2={x * cellSize}
                      y2={(y + 1) * cellSize}
                      stroke="#7ee7c7"
                      strokeWidth="2"
                    />
                  )}

                  {/* Player */}
                  {isPlayer && (
                    <circle
                      cx={x * cellSize + cellSize / 2}
                      cy={y * cellSize + cellSize / 2}
                      r={cellSize / 3}
                      fill="#60a5fa"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  )}

                  {/* Goal */}
                  {isGoal && (
                    <circle
                      cx={x * cellSize + cellSize / 2}
                      cy={y * cellSize + cellSize / 2}
                      r={cellSize / 3}
                      fill="#ff6b6b"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })
          )}
        </svg>
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
          🧩 Maze Navigator
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Navigate through the maze to reach the red goal!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            {renderMaze()}

            {/* Mobile Controls */}
            <Box sx={{ mt: 3, display: { xs: 'block', md: 'none' } }}>
              <Grid container spacing={1} sx={{ maxWidth: '200px', margin: '0 auto' }}>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={() => movePlayer('up')} sx={{ width: '100%' }}>
                    <KeyboardArrowUp />
                  </Button>
                </Grid>
                <Grid item xs={4}>
                  <Button variant="outlined" onClick={() => movePlayer('left')} sx={{ width: '100%' }}>
                    <KeyboardArrowLeft />
                  </Button>
                </Grid>
                <Grid item xs={4}></Grid>
                <Grid item xs={4}>
                  <Button variant="outlined" onClick={() => movePlayer('right')} sx={{ width: '100%' }}>
                    <KeyboardArrowRight />
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button variant="outlined" onClick={() => movePlayer('down')} sx={{ width: '100%' }}>
                    <KeyboardArrowDown />
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
            <Typography variant="h6" gutterBottom>Game Stats</Typography>

            <Box sx={{ mb: 3 }}>
              <Chip label={`Moves: ${gameState.moves}`} variant="outlined" sx={{ mr: 1, mb: 1 }} />
              <Chip label={`Time: ${formatTime(gameState.timeElapsed)}`} variant="outlined" sx={{ mb: 1 }} />
              {gameState.isComplete && (
                <Chip label="🎉 Complete!" color="success" sx={{ display: 'block', mt: 1 }} />
              )}
            </Box>

            <Typography variant="subtitle2" gutterBottom>Difficulty</Typography>
            <ToggleButtonGroup
              value={gameState.difficulty}
              exclusive
              onChange={(_, value) => value && setDifficulty(value)}
              sx={{ mb: 3, display: 'flex' }}
            >
              <ToggleButton value="easy">Easy</ToggleButton>
              <ToggleButton value="medium">Medium</ToggleButton>
              <ToggleButton value="hard">Hard</ToggleButton>
            </ToggleButtonGroup>

            <FormControlLabel
              control={<Switch checked={gameState.showSolution} onChange={toggleSolution} />}
              label="Show Solution"
              sx={{ mb: 3, display: 'block' }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" onClick={resetGame} startIcon={<Refresh />}>
                New Maze
              </Button>
              <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
                Back to Games
              </Button>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Controls:</strong><br />
                • Arrow keys or WASD to move<br />
                • Blue circle = You<br />
                • Red circle = Goal<br />
                • Yellow path = Solution (if enabled)
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MazeGame;
