export type Player = 'X' | 'O' | null;
export type GameMode = 'ai' | 'human';

export interface GameScore {
  X: number;
  O: number;
  draws: number;
}

export interface TicTacToeState {
  board: Player[];
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  showResult: boolean;
  gameMode: GameMode;
  isAiThinking: boolean;
  score: GameScore;
}
