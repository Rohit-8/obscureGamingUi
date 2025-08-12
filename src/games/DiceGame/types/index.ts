export interface Die {
  value: number;
  isRolling: boolean;
}

export interface DiceGameState {
  dice: Die[];
  score: number;
  bestScore: number;
  rollsLeft: number;
  isRolling: boolean;
  currentRoundScore: number;
}

export type DicePattern = 'triple-same' | 'straight' | 'triple-different' | 'pair' | 'regular';

export interface ScoreCalculation {
  pattern: DicePattern;
  score: number;
  multiplier: number;
}
