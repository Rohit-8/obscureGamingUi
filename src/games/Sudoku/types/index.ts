export type SudokuCell = number | null;
export type SudokuGrid = SudokuCell[][];
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SudokuGameState {
  grid: SudokuGrid;
  initialGrid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  isComplete: boolean;
  showCongrats: boolean;
  difficulty: Difficulty;
  time: number;
  gameStarted: boolean;
  mistakes: number;
}
