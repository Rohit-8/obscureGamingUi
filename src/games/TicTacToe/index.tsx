import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { useTicTacToe } from './hooks/useTicTacToe';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { ResultDialog } from './components/ResultDialog';

const TicTacToeGame: React.FC = () => {
  const { gameState, makeMove, resetGame, setGameMode, closeResultDialog } = useTicTacToe();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          ⭕ Tic Tac Toe
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Classic strategy game - Get three in a row to win!
        </Typography>
      </Box>

      <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
        <GameBoard
          board={gameState.board}
          onCellClick={makeMove}
          isAiThinking={gameState.isAiThinking}
        />

        <GameControls
          gameMode={gameState.gameMode}
          onGameModeChange={setGameMode}
          onReset={resetGame}
          currentPlayer={gameState.currentPlayer}
          isAiThinking={gameState.isAiThinking}
          score={gameState.score}
        />
      </Paper>

      <ResultDialog
        open={gameState.showResult}
        winner={gameState.winner}
        onClose={closeResultDialog}
        onNewGame={resetGame}
      />
    </Container>
  );
};

export default TicTacToeGame;
