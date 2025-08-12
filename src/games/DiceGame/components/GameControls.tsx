import React from 'react';
import { Box, Button } from '@mui/material';
import { Casino, Refresh, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface GameControlsProps {
  onRoll: () => void;
  onReset: () => void;
  rollsLeft: number;
  isRolling: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onRoll,
  onReset,
  rollsLeft,
  isRolling
}) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
      <Button
        variant="contained"
        onClick={onRoll}
        disabled={rollsLeft <= 0 || isRolling}
        startIcon={<Casino />}
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
        {isRolling ? 'Rolling...' : `Roll Dice (${rollsLeft} left)`}
      </Button>

      <Button variant="outlined" onClick={onReset} startIcon={<Refresh />}>
        New Game
      </Button>

      <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
        Back to Games
      </Button>
    </Box>
  );
};
