import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { useSudoku } from './hooks/useSudoku';
import { SudokuBoard } from './components/SudokuBoard';
import { NumberPad } from './components/NumberPad';
import { GameControls } from './components/GameControls';
import { CongratsDialog } from './components/CongratsDialog';

const SudokuGame: React.FC = () => {
  const {
    gameState,
    selectCell,
    setNumber,
    clearCell,
    setDifficulty,
    generateSudoku,
    closeCongrats
  } = useSudoku();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🧩 Sudoku
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Fill the 9×9 grid with digits 1-9, no repeats in rows, columns, or 3×3 boxes!
        </Typography>
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <SudokuBoard
              grid={gameState.grid}
              initialGrid={gameState.initialGrid}
              selectedCell={gameState.selectedCell}
              onCellClick={selectCell}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <NumberPad
              onNumberSelect={setNumber}
              onClear={clearCell}
              disabled={gameState.isComplete}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <GameControls
              difficulty={gameState.difficulty}
              time={gameState.time}
              mistakes={gameState.mistakes}
              isComplete={gameState.isComplete}
              onDifficultyChange={setDifficulty}
              onNewGame={generateSudoku}
            />
          </Paper>
        </Grid>
      </Grid>

      <CongratsDialog
        open={gameState.showCongrats}
        time={gameState.time}
        mistakes={gameState.mistakes}
        difficulty={gameState.difficulty}
        onClose={closeCongrats}
        onNewGame={generateSudoku}
      />
    </Container>
  );
};

export default SudokuGame;
