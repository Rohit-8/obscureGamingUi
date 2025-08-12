import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { useMemoryGame } from './hooks/useMemoryGame';
import { GameGrid } from './components/GameGrid';
import { GameControls } from './components/GameControls';
import { ResultDialog } from './components/ResultDialog';

const MemoryMatchingGame: React.FC = () => {
  const { gameState, initializeGame, startGame, flipCard, closeResultDialog } = useMemoryGame();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🧠 Memory Matching
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find all matching pairs as quickly as possible!
        </Typography>
      </Box>

      <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
        <GameGrid
          cards={gameState.cards}
          onCardClick={flipCard}
          disabled={gameState.gameState !== 'playing' || gameState.flippedCards.length >= 2}
        />

        <GameControls
          gameState={gameState.gameState}
          moves={gameState.moves}
          timeElapsed={gameState.timeElapsed}
          score={gameState.score}
          bestScore={gameState.bestScore}
          onStart={startGame}
          onReset={initializeGame}
        />
      </Paper>

      <ResultDialog
        open={gameState.showResult}
        score={gameState.score}
        moves={gameState.moves}
        timeElapsed={gameState.timeElapsed}
        bestScore={gameState.bestScore}
        isNewBest={gameState.score === gameState.bestScore}
        onClose={closeResultDialog}
        onNewGame={initializeGame}
      />
    </Container>
  );
};

export default MemoryMatchingGame;
