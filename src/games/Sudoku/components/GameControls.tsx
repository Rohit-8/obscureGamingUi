import React from 'react';
import {
  Box,
  Button,
  Chip,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Home, Refresh, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Difficulty } from '../types';

interface GameControlsProps {
  difficulty: Difficulty;
  time: number;
  mistakes: number;
  isComplete: boolean;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onNewGame: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({
  difficulty,
  time,
  mistakes,
  isComplete,
  onDifficultyChange,
  onNewGame
}) => {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Game Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip
          label={`Time: ${formatTime(time)}`}
          variant="outlined"
          sx={{ fontSize: '1rem' }}
        />
        <Chip
          label={`Mistakes: ${mistakes}`}
          variant="outlined"
          color={mistakes > 5 ? 'error' : 'default'}
          sx={{ fontSize: '1rem' }}
        />
        {isComplete && (
          <Chip
            icon={<CheckCircle />}
            label="Complete!"
            color="success"
            sx={{ fontSize: '1rem' }}
          />
        )}
      </Box>

      {/* Difficulty Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={difficulty}
          exclusive
          onChange={(_, value) => value && onDifficultyChange(value)}
          sx={{ '& .MuiToggleButton-root': { px: 3 } }}
        >
          <ToggleButton value="easy">Easy</ToggleButton>
          <ToggleButton value="medium">Medium</ToggleButton>
          <ToggleButton value="hard">Hard</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={onNewGame}
          startIcon={<Refresh />}
          sx={{
            background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
            '&:hover': {
              background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)',
            },
          }}
        >
          New Game
        </Button>
        <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
          Back to Games
        </Button>
      </Box>
    </>
  );
};
