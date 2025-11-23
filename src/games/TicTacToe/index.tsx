import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useTicTacToe } from './hooks/useTicTacToe';
import { useTicTacToeBackend } from './hooks/useTicTacToeBackend';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { ResultDialog } from './components/ResultDialog';

const TicTacToeGame: React.FC = () => {
  const [useBackend, setUseBackend] = useState(true);
  
  const localGame = useTicTacToe();
  const backendGame = useTicTacToeBackend();
  
  const game = useBackend ? backendGame : localGame;
  const gameState = game.gameState;
  const makeMove = game.makeMove;
  const resetGame = game.resetGame;
  const closeResultDialog = game.closeResultDialog;
  const setGameMode = 'setGameMode' in game ? game.setGameMode : undefined;
  const isLoading = 'isLoading' in game ? game.isLoading : false;
  const error = 'error' in game ? game.error : null;
  const startGame = 'startGame' in game ? game.startGame : undefined;

  useEffect(() => {
    if (useBackend && startGame) {
      startGame();
    }
  }, [useBackend, startGame]);

  const handleBackendToggle = () => {
    setUseBackend(prev => !prev);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          {useBackend ? '⭕ Tic-Tac-Toe-Backend' : '⭕ Tic Tac Toe'}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {useBackend 
            ? 'Play against unbeatable AI - Powered by minimax algorithm' 
            : 'Classic strategy game - Get three in a row to win!'}
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={useBackend}
              onChange={handleBackendToggle}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {useBackend ? '🌐 Backend AI' : '💻 Local AI'}
            </Typography>
          }
          sx={{ mt: 2 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {isLoading && !gameState.board.some(cell => cell !== null) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
          <GameBoard
            board={gameState.board}
            onCellClick={makeMove}
            isAiThinking={gameState.isAiThinking || isLoading}
          />

          {!useBackend && (
            <GameControls
              gameMode={gameState.gameMode}
              onGameModeChange={setGameMode || (() => {})}
              onReset={resetGame}
              currentPlayer={gameState.currentPlayer}
              isAiThinking={gameState.isAiThinking || isLoading}
              score={gameState.score}
            />
          )}
          
          {useBackend && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Playing against Backend AI
              </Typography>
              <GameControls
                gameMode="ai"
                onGameModeChange={() => {}}
                onReset={resetGame}
                currentPlayer={gameState.currentPlayer}
                isAiThinking={gameState.isAiThinking || isLoading}
                score={gameState.score}
              />
            </Box>
          )}
        </Paper>
      )}

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
