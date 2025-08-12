export interface Mole {
  id: number;
  isVisible: boolean;
  timeLeft: number;
  wasHit: boolean;
}

export type GameState = 'ready' | 'playing' | 'paused' | 'finished';

export interface WhackAMoleGameState {
  moles: Mole[];
  score: number;
  timeLeft: number;
  gameState: GameState;
  highScore: number;
  showResult: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  missedMoles: number;
}
