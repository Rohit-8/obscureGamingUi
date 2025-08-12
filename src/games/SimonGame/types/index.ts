export type GameColor = 'red' | 'blue' | 'green' | 'yellow';

export type GameState = 'ready' | 'playing' | 'waiting' | 'game-over';

export interface ColorConfig {
  bg: string;
  active: string;
  sound: number;
}

export interface SimonGameState {
  sequence: GameColor[];
  playerSequence: GameColor[];
  isDisplaying: boolean;
  activeColor: GameColor | null;
  gameState: GameState;
  level: number;
  highScore: number;
  showResult: boolean;
  soundEnabled: boolean;
}
