export interface WordSearchGameState {
  grid: string[][];
  words: string[];
  foundWords: string[];
  selectedCells: { row: number; col: number }[];
  isSelecting: boolean;
  score: number;
  timeElapsed: number;
  gameComplete: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  gridSize: number;
}

export interface WordPosition {
  word: string;
  startRow: number;
  startCol: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
}
