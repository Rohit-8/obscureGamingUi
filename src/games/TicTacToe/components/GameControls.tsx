import React from 'react';
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip
} from '@mui/material';
import { Home, Refresh, SmartToy, Person } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { GameMode, Player, GameScore } from '../types';

interface GameControlsProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  onReset: () => void;
  currentPlayer: Player;
  isAiThinking: boolean;
  score: GameScore;
}

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  onGameModeChange,
  onReset,
  currentPlayer,
  isAiThinking,
  score
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Current Player Indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
        <Chip
          label={isAiThinking ? 'AI is thinking...' : `Current Player: ${currentPlayer}`}
          color={currentPlayer === 'X' ? 'primary' : 'secondary'}
          variant="outlined"
          sx={{ fontSize: '1rem', py: 2 }}
        />
      </Box>

      {/* Game Mode Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <ToggleButtonGroup
          value={gameMode}
          exclusive
          onChange={(_, value) => value && onGameModeChange(value)}
          sx={{ '& .MuiToggleButton-root': { px: 3 } }}
        >
          <ToggleButton value="ai">
            <SmartToy />
            vs AI
          </ToggleButton>
          <ToggleButton value="human">
            <Person />
            vs Human
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Score Display */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
        <Typography variant="body1">
          X: {score.X}
        </Typography>
        <Typography variant="body1">
          O: {score.O}
        </Typography>
        <Typography variant="body1">
          Draws: {score.draws}
        </Typography>
      </Box>

      {/* Control Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button variant="outlined" onClick={onReset} startIcon={<Refresh />}>
          New Game
        </Button>
        <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
          Back to Games
        </Button>
      </Box>
    </>
  );
};
