import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { useDiceGame } from './hooks/useDiceGame';
import { DiceDisplay } from './components/DiceDisplay';
import { GameControls } from './components/GameControls';
import { ScoringRules } from './components/ScoringRules';
import { GameStats } from './components/GameStats';

const DiceGame: React.FC = () => {
  const { gameState, rollDice, resetGame } = useDiceGame();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🎲 Dice Game
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Roll three dice and score points based on patterns!
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <DiceDisplay dice={gameState.dice} />
            <GameControls
              onRoll={rollDice}
              onReset={resetGame}
              rollsLeft={gameState.rollsLeft}
              isRolling={gameState.isRolling}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <ScoringRules />
          <GameStats
            score={gameState.score}
            bestScore={gameState.bestScore}
            rollsLeft={gameState.rollsLeft}
            currentRoundScore={gameState.currentRoundScore}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default DiceGame;
