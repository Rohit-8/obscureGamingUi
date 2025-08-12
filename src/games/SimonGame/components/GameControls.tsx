import React from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Typography
} from '@mui/material';
import { Home, PlayArrow, VolumeUp, VolumeOff, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GameState } from '../types';

interface GameControlsProps {
  gameState: GameState;
  level: number;
  highScore: number;
  soundEnabled: boolean;
  onStart: () => void;
  onToggleSound: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  level,
  highScore,
  soundEnabled,
  onStart,
  onToggleSound
}) => {
  const navigate = useNavigate();

  const getStatusMessage = () => {
    switch (gameState) {
      case 'ready':
        return 'Click Start to begin!';
      case 'waiting':
        return 'Watch the sequence...';
      case 'playing':
        return 'Repeat the sequence!';
      case 'game-over':
        return 'Game Over!';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Status Display */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip
          label={getStatusMessage()}
          color={gameState === 'game-over' ? 'error' : 'primary'}
          variant="outlined"
          sx={{ fontSize: '1rem', py: 2 }}
        />
      </Box>

      {/* Score Display */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mb: 3 }}>
        <Typography variant="h6">
          Level: {level}
        </Typography>
        <Typography variant="h6">
          High Score: {highScore}
        </Typography>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          onClick={onStart}
          startIcon={gameState === 'ready' ? <PlayArrow /> : <Refresh />}
          disabled={gameState === 'waiting'}
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
          {gameState === 'ready' ? 'Start Game' : 'New Game'}
        </Button>

        <IconButton
          onClick={onToggleSound}
          sx={{
            color: soundEnabled ? '#7ee7c7' : 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {soundEnabled ? <VolumeUp /> : <VolumeOff />}
        </IconButton>

        <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
          Back to Games
        </Button>
      </Box>
    </>
  );
};
