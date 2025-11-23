export interface GameSessionResponse {
  id: string;
  gameId: string;
  status: 'active' | 'completed' | 'abandoned';
  currentTurn: number;
  currentPlayerId: string;
  winnerId: string | null;
  stateData: TicTacToeStateData;
  isYourTurn: boolean;
  startedAt: string;
  endedAt: string | null;
}

export interface TicTacToeStateData {
  board: string[][];
  playerIds: string[];
  currentPlayerIndex: number;
  winnerId: string | null;
  terminal: boolean;
  draw: boolean;
}

export interface GameMoveRequest {
  moveData: {
    row: number;
    col: number;
  };
}

export interface GameMoveResponse {
  success: boolean;
  session: GameSessionResponse;
  aiMove?: {
    row: number;
    col: number;
  };
  message?: string;
}

export interface StartGameRequest {
  vsAi: boolean;
}
