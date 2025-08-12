import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography
} from '@mui/material';
import { Home, PlayArrow, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../types';

interface GameControlsProps {
  gameState: GameState;
  moves: number;
  timeElapsed: number;
  score: number;
  bestScore: number;
  onStart: () => void;
  onReset: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  moves,
  timeElapsed,
  score,
  bestScore,
  onStart,
  onReset
}) => {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Game Status */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
        <Chip
          label={`Moves: ${moves}`}
          variant="outlined"
          sx={{ fontSize: '1rem' }}
        />
        <Chip
          label={`Time: ${formatTime(timeElapsed)}`}
          variant="outlined"
          sx={{ fontSize: '1rem' }}
        />
        {gameState === 'finished' && (
          <Chip
            label={`Score: ${score}`}
            color="primary"
            sx={{ fontSize: '1rem' }}
          />
        )}
      </Box>

      {/* Best Score */}
      <Typography variant="h6" sx={{ textAlign: 'center', mb: 3 }}>
        Best Score: {bestScore}
      </Typography>

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {gameState === 'ready' ? (
          <Button
            variant="contained"
            onClick={onStart}
            startIcon={<PlayArrow />}
            sx={{
              background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
              '&:hover': {
                background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)',
              },
              fontSize: '1.1rem',
              py: 1.5,
              px: 3,
            }}
          >
            Start Game
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={onReset}
            startIcon={<Refresh />}
          >
            New Game
          </Button>
        )}

        <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
          Back to Games
        </Button>
      </Box>
    </>
  );
};
