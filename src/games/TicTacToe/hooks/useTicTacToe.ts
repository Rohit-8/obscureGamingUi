import { useState, useEffect, useCallback } from 'react';
import { Player, GameMode, TicTacToeState } from '../types';

export const useTicTacToe = () => {
  const [gameState, setGameState] = useState<TicTacToeState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    showResult: false,
    gameMode: 'ai',
    isAiThinking: false,
    score: { X: 0, O: 0, draws: 0 }
  });

  const checkWinner = useCallback((board: Player[]): Player | 'draw' | null => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    if (board.every(cell => cell !== null)) {
      return 'draw';
    }

    return null;
  }, []);

  const minimax = useCallback((board: Player[], depth: number, isMaximizing: boolean): number => {
    const winner = checkWinner(board);

    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const score = minimax(board, depth + 1, false);
          board[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const score = minimax(board, depth + 1, true);
          board[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }, [checkWinner]);

  const getBestMove = useCallback((board: Player[]): number => {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, 0, false);
        board[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }, [minimax]);

  const makeMove = useCallback((index: number) => {
    if (gameState.board[index] || gameState.winner || (gameState.gameMode === 'ai' && gameState.currentPlayer === 'O')) {
      return;
    }

    setGameState(prev => ({
      ...prev,
      board: prev.board.map((cell, i) => i === index ? prev.currentPlayer : cell),
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X'
    }));
  }, [gameState.board, gameState.winner, gameState.gameMode, gameState.currentPlayer]);

  const makeAiMove = useCallback(() => {
    setGameState(prev => ({ ...prev, isAiThinking: true }));

    const bestMove = getBestMove(gameState.board);

    setTimeout(() => {
      if (bestMove !== -1) {
        setGameState(prev => ({
          ...prev,
          board: prev.board.map((cell, i) => i === bestMove ? 'O' : cell),
          currentPlayer: 'X',
          isAiThinking: false
        }));
      }
    }, 500);
  }, [gameState.board, getBestMove]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      showResult: false,
      isAiThinking: false
    }));
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    setGameState(prev => ({
      ...prev,
      gameMode: mode,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      showResult: false,
      isAiThinking: false
    }));
  }, []);

  const closeResultDialog = useCallback(() => {
    setGameState(prev => ({ ...prev, showResult: false }));
  }, []);

  // Effect to handle game winner and AI moves
  useEffect(() => {
    const result = checkWinner(gameState.board);
    if (result) {
      setGameState(prev => ({
        ...prev,
        winner: result,
        showResult: true,
        score: result !== 'draw'
          ? { ...prev.score, [result]: prev.score[result as 'X' | 'O'] + 1 }
          : { ...prev.score, draws: prev.score.draws + 1 }
      }));
    } else if (gameState.gameMode === 'ai' && gameState.currentPlayer === 'O' && !result) {
      makeAiMove();
    }
  }, [gameState.board, gameState.currentPlayer, gameState.gameMode, checkWinner, makeAiMove]);

  return {
    gameState,
    makeMove,
    resetGame,
    setGameMode,
    closeResultDialog
  };
};
