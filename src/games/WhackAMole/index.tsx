import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Home, PlayArrow, Pause, Stop } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWhackAMole } from './hooks/useWhackAMole';

const WhackAMoleGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, startGame, pauseGame, resumeGame, endGame, resetGame, whackMole, closeResult } = useWhackAMole();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🔨 Whack-A-Mole
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Hit the moles as fast as you can!
        </Typography>
      </Box>

      <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
        {/* Game Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
          <Chip label={`Score: ${gameState.score}`} variant="outlined" sx={{ fontSize: '1rem' }} />
          <Chip label={`Time: ${gameState.timeLeft}s`} variant="outlined" sx={{ fontSize: '1rem' }} />
          <Chip label={`High Score: ${gameState.highScore}`} variant="outlined" sx={{ fontSize: '1rem' }} />
        </Box>

        {/* Time Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={(gameState.timeLeft / 60) * 100}
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />

        {/* Mole Grid */}
        <Grid container spacing={2} sx={{ maxWidth: '400px', margin: '0 auto', mb: 3 }}>
          {gameState.moles.map((mole) => (
            <Grid item xs={4} key={mole.id}>
              <Box
                onClick={() => whackMole(mole.id)}
                sx={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  backgroundColor: mole.isVisible ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: 2,
                  cursor: mole.isVisible ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  transform: mole.isVisible ? 'scale(1.1)' : 'scale(1)',
                  '&:hover': {
                    backgroundColor: mole.isVisible ? 'rgba(255, 107, 107, 0.5)' : undefined,
                  },
                }}
              >
                {mole.isVisible ? '🐹' : '🕳️'}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {gameState.gameState === 'ready' && (
            <Button
              variant="contained"
              onClick={startGame}
              startIcon={<PlayArrow />}
              sx={{
                background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
                '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' },
              }}
            >
              Start Game
            </Button>
          )}

          {gameState.gameState === 'playing' && (
            <>
              <Button variant="outlined" onClick={pauseGame} startIcon={<Pause />}>
                Pause
              </Button>
              <Button variant="outlined" onClick={endGame} startIcon={<Stop />}>
                End Game
              </Button>
            </>
          )}

          {gameState.gameState === 'paused' && (
            <Button variant="contained" onClick={resumeGame} startIcon={<PlayArrow />}>
              Resume
            </Button>
          )}

          {(gameState.gameState === 'finished' || gameState.gameState === 'paused') && (
            <Button variant="outlined" onClick={resetGame}>
              New Game
            </Button>
          )}

          <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
            Back to Games
          </Button>
        </Box>
      </Paper>

      {/* Result Dialog */}
      <Dialog open={gameState.showResult} onClose={closeResult}>
        <DialogTitle sx={{ textAlign: 'center' }}>🎉 Game Over!</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Final Score: {gameState.score}</Typography>
          {gameState.score === gameState.highScore && (
            <Typography variant="h6" sx={{ color: '#7ee7c7', mb: 2 }}>🏆 New High Score!</Typography>
          )}
          <Typography>Missed Moles: {gameState.missedMoles}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" onClick={() => { resetGame(); closeResult(); }}>
            Play Again
          </Button>
          <Button variant="outlined" onClick={closeResult}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WhackAMoleGame;
