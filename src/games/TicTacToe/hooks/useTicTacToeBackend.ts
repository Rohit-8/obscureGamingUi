import { useState, useCallback } from 'react';
import { apiService } from '../../../services/ApiService';
import { GameSessionResponse, GameMoveResponse } from '../types/backend';
import { Player } from '../types';

interface BackendGameState {
  session: GameSessionResponse | null;
  board: Player[];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  showResult: boolean;
  isLoading: boolean;
  isAiThinking: boolean;
  error: string | null;
}

export const useTicTacToeBackend = () => {
  const [gameState, setGameState] = useState<BackendGameState>({
    session: null,
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    showResult: false,
    isLoading: false,
    isAiThinking: false,
    error: null,
  });

  const convertBackendBoardToUI = useCallback((backendBoard: string[][]): Player[] => {
    const uiBoard: Player[] = Array(9).fill(null);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = backendBoard[i][j];
        if (cell !== ' ') {
          uiBoard[i * 3 + j] = cell as Player;
        }
      }
    }
    return uiBoard;
  }, []);

  const updateStateFromSession = useCallback((session: GameSessionResponse) => {
    const uiBoard = convertBackendBoardToUI(session.stateData.board);
    const currentSymbol = session.stateData.currentPlayerIndex === 0 ? 'X' : 'O';
    
    let winner: Player | 'draw' | null = null;
    if (session.status === 'completed') {
      if (session.stateData.draw) {
        winner = 'draw';
      } else if (session.stateData.winnerId) {
        const winnerIndex = session.stateData.playerIds.indexOf(session.stateData.winnerId);
        winner = winnerIndex === 0 ? 'X' : 'O';
      }
    }

    setGameState(prev => ({
      ...prev,
      session,
      board: uiBoard,
      currentPlayer: currentSymbol,
      winner,
      showResult: session.status === 'completed',
      isLoading: false,
      isAiThinking: false,
      error: null,
    }));
  }, [convertBackendBoardToUI]);

  const startGame = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await apiService.startGame('tic-tac-toe-backend', true);
      updateStateFromSession(response);
    } catch (error: any) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to start game',
      }));
    }
  }, [updateStateFromSession]);

  const makeMove = useCallback(async (index: number) => {
    if (!gameState.session || gameState.isLoading || gameState.isAiThinking || gameState.winner) {
      return;
    }

    const row = Math.floor(index / 3);
    const col = index % 3;

    setGameState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response: GameMoveResponse = await apiService.makeMove(
        gameState.session.id,
        { row, col }
      );
      
      if (response.success) {
        updateStateFromSession(response.session);
        
        // If AI made a move, update the board again after a brief delay
        if (response.aiMove && response.session.status === 'active') {
          setGameState(prev => ({ ...prev, isAiThinking: true }));
          setTimeout(() => {
            updateStateFromSession(response.session);
          }, 500);
        }
      } else {
        setGameState(prev => ({
          ...prev,
          isLoading: false,
          error: response.message || 'Invalid move',
        }));
      }
    } catch (error: any) {
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: error.response?.data?.message || 'Failed to make move',
      }));
    }
  }, [gameState.session, gameState.isLoading, gameState.isAiThinking, gameState.winner, updateStateFromSession]);

  const resetGame = useCallback(() => {
    startGame();
  }, [startGame]);

  const closeResultDialog = useCallback(() => {
    setGameState(prev => ({ ...prev, showResult: false }));
  }, []);

  return {
    gameState: {
      board: gameState.board,
      currentPlayer: gameState.currentPlayer,
      winner: gameState.winner,
      showResult: gameState.showResult,
      gameMode: 'ai' as const,
      isAiThinking: gameState.isAiThinking,
      score: { X: 0, O: 0, draws: 0 }, // Could track this from session history
    },
    makeMove,
    resetGame,
    startGame,
    closeResultDialog,
    isLoading: gameState.isLoading,
    error: gameState.error,
  };
};
