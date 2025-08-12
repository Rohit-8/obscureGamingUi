import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { useSimonGame } from './hooks/useSimonGame';
import { ColorGrid } from './components/ColorGrid';
import { GameControls } from './components/GameControls';
import { ResultDialog } from './components/ResultDialog';

const SimonGame: React.FC = () => {
  const { gameState, startGame, handleColorClick, toggleSound, closeResultDialog, colorMap } = useSimonGame();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🔴 Simon Says
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Remember and repeat the color sequence!
        </Typography>
      </Box>

      <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
        <ColorGrid
          colorMap={colorMap}
          activeColor={gameState.activeColor}
          onColorClick={handleColorClick}
          disabled={gameState.gameState === 'waiting' || gameState.isDisplaying}
        />

        <GameControls
          gameState={gameState.gameState}
          level={gameState.level}
          highScore={gameState.highScore}
          soundEnabled={gameState.soundEnabled}
          onStart={startGame}
          onToggleSound={toggleSound}
        />
      </Paper>

      <ResultDialog
        open={gameState.showResult}
        level={gameState.level}
        highScore={gameState.highScore}
        isNewHighScore={gameState.level === gameState.highScore}
        onClose={closeResultDialog}
        onNewGame={startGame}
      />
    </Container>
  );
};

export default SimonGame;
