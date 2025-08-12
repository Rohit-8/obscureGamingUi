export interface Cell {
  x: number;
  y: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  };
  visited: boolean;
  isPath: boolean;
}

export interface Player {
  x: number;
  y: number;
}

export interface MazeGameState {
  maze: Cell[][];
  player: Player;
  goal: Player;
  isComplete: boolean;
  moves: number;
  timeElapsed: number;
  gameStarted: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  showSolution: boolean;
  solution: { x: number; y: number }[];
}
