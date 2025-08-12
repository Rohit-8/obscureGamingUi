import { useState, useCallback, useEffect, useRef } from 'react';
import { SudokuGrid, SudokuCell, Difficulty, SudokuGameState } from '../types';

export const useSudoku = () => {
  const [gameState, setGameState] = useState<SudokuGameState>({
    grid: [],
    initialGrid: [],
    selectedCell: null,
    isComplete: false,
    showCongrats: false,
    difficulty: 'medium',
    time: 0,
    gameStarted: false,
    mistakes: 0
  });

  const timerRef = useRef<NodeJS.Timeout>();

  const isValidMove = useCallback((grid: SudokuGrid, row: number, col: number, num: number): boolean => {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }, []);

  const solveSudoku = useCallback((grid: SudokuGrid): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValidMove(grid, row, col, num)) {
              grid[row][col] = num;
              if (solveSudoku(grid)) return true;
              grid[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  }, [isValidMove]);

  const createCompleteSudoku = useCallback((): SudokuGrid => {
    const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));

    // Fill diagonal 3x3 boxes first
    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let index = 0;
      for (let row = i; row < i + 3; row++) {
        for (let col = i; col < i + 3; col++) {
          grid[row][col] = nums[index++];
        }
      }
    }

    solveSudoku(grid);
    return grid;
  }, [solveSudoku]);

  const generateSudoku = useCallback(() => {
    const completeGrid = createCompleteSudoku();
    const cellsToRemove = gameState.difficulty === 'easy' ? 40 : gameState.difficulty === 'medium' ? 50 : 60;

    const puzzleGrid = completeGrid.map(row => [...row]);

    // Remove cells randomly
    const cellsToRemoveList: [number, number][] = [];
    while (cellsToRemoveList.length < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (!cellsToRemoveList.some(([r, c]) => r === row && c === col)) {
        cellsToRemoveList.push([row, col]);
      }
    }

    cellsToRemoveList.forEach(([row, col]) => {
      puzzleGrid[row][col] = null;
    });

    setGameState(prev => ({
      ...prev,
      grid: puzzleGrid,
      initialGrid: puzzleGrid.map(row => [...row]),
      selectedCell: null,
      isComplete: false,
      showCongrats: false,
      time: 0,
      gameStarted: false,
      mistakes: 0
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameState.difficulty, createCompleteSudoku]);

  const selectCell = useCallback((row: number, col: number) => {
    if (gameState.initialGrid[row]?.[col] !== null) return; // Can't select pre-filled cells

    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col },
      gameStarted: true
    }));
  }, [gameState.initialGrid]);

  const setNumber = useCallback((num: number) => {
    if (!gameState.selectedCell) return;

    const { row, col } = gameState.selectedCell;
    if (gameState.initialGrid[row][col] !== null) return; // Can't change pre-filled cells

    const newGrid = gameState.grid.map(r => [...r]);
    newGrid[row][col] = num;

    // Check if it's a valid move
    const isValid = isValidMove(gameState.grid, row, col, num);
    const newMistakes = isValid ? gameState.mistakes : gameState.mistakes + 1;

    // Check if puzzle is complete
    const isComplete = newGrid.every(row => row.every(cell => cell !== null));

    setGameState(prev => ({
      ...prev,
      grid: newGrid,
      mistakes: newMistakes,
      isComplete,
      showCongrats: isComplete
    }));

    if (isComplete && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameState.selectedCell, gameState.initialGrid, gameState.grid, gameState.mistakes, isValidMove]);

  const clearCell = useCallback(() => {
    if (!gameState.selectedCell) return;

    const { row, col } = gameState.selectedCell;
    if (gameState.initialGrid[row][col] !== null) return;

    const newGrid = gameState.grid.map(r => [...r]);
    newGrid[row][col] = null;

    setGameState(prev => ({
      ...prev,
      grid: newGrid
    }));
  }, [gameState.selectedCell, gameState.initialGrid, gameState.grid]);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty }));
  }, []);

  const closeCongrats = useCallback(() => {
    setGameState(prev => ({ ...prev, showCongrats: false }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStarted && !gameState.isComplete) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.gameStarted, gameState.isComplete]);

  // Generate initial puzzle
  useEffect(() => {
    generateSudoku();
  }, [gameState.difficulty]);

  return {
    gameState,
    selectCell,
    setNumber,
    clearCell,
    setDifficulty,
    generateSudoku,
    closeCongrats
  };
};
