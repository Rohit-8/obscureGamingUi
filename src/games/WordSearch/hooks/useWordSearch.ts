import { useState, useCallback, useEffect, useRef } from 'react';
import { WordSearchGameState, WordPosition } from '../types';

const wordLists = {
  easy: ['CAT', 'DOG', 'SUN', 'CAR', 'TREE', 'BOOK', 'FISH', 'BIRD'],
  medium: ['COMPUTER', 'ELEPHANT', 'MOUNTAIN', 'RAINBOW', 'KITCHEN', 'GARDEN', 'PENCIL'],
  hard: ['JAVASCRIPT', 'ALGORITHM', 'DEVELOPMENT', 'PROGRAMMING', 'TECHNOLOGY', 'FRAMEWORK']
};

export const useWordSearch = () => {
  const [gameState, setGameState] = useState<WordSearchGameState>({
    grid: [],
    words: [],
    foundWords: [],
    selectedCells: [],
    isSelecting: false,
    score: 0,
    timeElapsed: 0,
    gameComplete: false,
    difficulty: 'medium',
    gridSize: 15
  });

  const timerRef = useRef<NodeJS.Timeout>();
  const wordPositions = useRef<WordPosition[]>([]);

  const generateGrid = useCallback(() => {
    const size = gameState.difficulty === 'easy' ? 12 : gameState.difficulty === 'medium' ? 15 : 18;
    const words = wordLists[gameState.difficulty].slice(0, gameState.difficulty === 'easy' ? 6 : 7);

    // Create empty grid
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    wordPositions.current = [];

    // Place words in grid
    words.forEach(word => {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 3); // 0: horizontal, 1: vertical, 2: diagonal
        const reverse = Math.random() < 0.5;
        const actualWord = reverse ? word.split('').reverse().join('') : word;

        let startRow, startCol, deltaRow, deltaCol;

        if (direction === 0) { // horizontal
          startRow = Math.floor(Math.random() * size);
          startCol = Math.floor(Math.random() * (size - word.length + 1));
          deltaRow = 0;
          deltaCol = 1;
        } else if (direction === 1) { // vertical
          startRow = Math.floor(Math.random() * (size - word.length + 1));
          startCol = Math.floor(Math.random() * size);
          deltaRow = 1;
          deltaCol = 0;
        } else { // diagonal
          startRow = Math.floor(Math.random() * (size - word.length + 1));
          startCol = Math.floor(Math.random() * (size - word.length + 1));
          deltaRow = 1;
          deltaCol = 1;
        }

        // Check if word can be placed
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const row = startRow + i * deltaRow;
          const col = startCol + i * deltaCol;
          if (grid[row][col] !== '' && grid[row][col] !== actualWord[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          // Place the word
          for (let i = 0; i < word.length; i++) {
            const row = startRow + i * deltaRow;
            const col = startCol + i * deltaCol;
            grid[row][col] = actualWord[i];
          }

          wordPositions.current.push({
            word,
            startRow,
            startCol,
            direction: direction === 0 ? 'horizontal' : direction === 1 ? 'vertical' : 'diagonal'
          });

          placed = true;
        }

        attempts++;
      }
    });

    // Fill empty cells with random letters
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (grid[row][col] === '') {
          grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGameState(prev => ({
      ...prev,
      grid,
      words,
      foundWords: [],
      selectedCells: [],
      isSelecting: false,
      score: 0,
      timeElapsed: 0,
      gameComplete: false,
      gridSize: size
    }));

    if (timerRef.current) clearInterval(timerRef.current);
  }, [gameState.difficulty]);

  const startSelection = useCallback((row: number, col: number) => {
    setGameState(prev => ({
      ...prev,
      selectedCells: [{ row, col }],
      isSelecting: true
    }));
  }, []);

  const updateSelection = useCallback((row: number, col: number) => {
    if (!gameState.isSelecting || gameState.selectedCells.length === 0) return;

    const start = gameState.selectedCells[0];
    const cells: { row: number; col: number }[] = [start];

    // Determine direction and create line
    const deltaRow = row === start.row ? 0 : (row > start.row ? 1 : -1);
    const deltaCol = col === start.col ? 0 : (col > start.col ? 1 : -1);

    // Only allow horizontal, vertical, or diagonal lines
    if (deltaRow !== 0 && deltaCol !== 0 && Math.abs(row - start.row) !== Math.abs(col - start.col)) {
      return;
    }

    let currentRow = start.row + deltaRow;
    let currentCol = start.col + deltaCol;

    while (
      currentRow >= 0 && currentRow < gameState.gridSize &&
      currentCol >= 0 && currentCol < gameState.gridSize &&
      (currentRow !== row + deltaRow || currentCol !== col + deltaCol)
    ) {
      cells.push({ row: currentRow, col: currentCol });
      currentRow += deltaRow;
      currentCol += deltaCol;
    }

    setGameState(prev => ({ ...prev, selectedCells: cells }));
  }, [gameState.isSelecting, gameState.selectedCells, gameState.gridSize]);

  const endSelection = useCallback(() => {
    if (!gameState.isSelecting || gameState.selectedCells.length < 2) {
      setGameState(prev => ({ ...prev, selectedCells: [], isSelecting: false }));
      return;
    }

    // Check if selected cells form a word
    const selectedWord = gameState.selectedCells.map(cell => gameState.grid[cell.row][cell.col]).join('');
    const reverseWord = selectedWord.split('').reverse().join('');

    const foundWord = gameState.words.find(word =>
      word === selectedWord || word === reverseWord
    );

    if (foundWord && !gameState.foundWords.includes(foundWord)) {
      const newFoundWords = [...gameState.foundWords, foundWord];
      const newScore = gameState.score + foundWord.length * 10;

      setGameState(prev => ({
        ...prev,
        foundWords: newFoundWords,
        score: newScore,
        selectedCells: [],
        isSelecting: false,
        gameComplete: newFoundWords.length === prev.words.length
      }));

      if (newFoundWords.length === gameState.words.length && timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      setGameState(prev => ({ ...prev, selectedCells: [], isSelecting: false }));
    }
  }, [gameState.isSelecting, gameState.selectedCells, gameState.grid, gameState.words, gameState.foundWords, gameState.score]);

  const setDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    setGameState(prev => ({ ...prev, difficulty }));
  }, []);

  const resetGame = useCallback(() => {
    generateGrid();
  }, [generateGrid]);

  // Timer effect
  useEffect(() => {
    if (gameState.words.length > 0 && !gameState.gameComplete) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.words.length, gameState.gameComplete]);

  // Initialize game
  useEffect(() => {
    generateGrid();
  }, [gameState.difficulty]);

  return {
    gameState,
    startSelection,
    updateSelection,
    endSelection,
    setDifficulty,
    resetGame
  };
};
