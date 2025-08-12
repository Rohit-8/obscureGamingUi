export interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameState = 'ready' | 'playing' | 'finished';

export interface MemoryGameState {
  cards: Card[];
  flippedCards: number[];
  score: number;
  moves: number;
  timeElapsed: number;
  gameState: GameState;
  showResult: boolean;
  bestScore: number;
}
