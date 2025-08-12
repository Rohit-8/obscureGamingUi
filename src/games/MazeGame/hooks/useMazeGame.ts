import { useState, useCallback, useEffect, useRef } from 'react';
import { Cell, Player, MazeGameState } from '../types';

export const useMazeGame = () => {
  const [gameState, setGameState] = useState<MazeGameState>({
    maze: [],
    player: { x: 0, y: 0 },
    goal: { x: 0, y: 0 },
    isComplete: false,
    moves: 0,
    timeElapsed: 0,
    gameStarted: false,
    difficulty: 'medium',
    showSolution: false,
    solution: []
  });

  const timerRef = useRef<NodeJS.Timeout>();

  const getMazeSize = useCallback(() => {
    switch (gameState.difficulty) {
      case 'easy': return { width: 10, height: 10 };
      case 'medium': return { width: 15, height: 15 };
      case 'hard': return { width: 20, height: 20 };
    }
  }, [gameState.difficulty]);

  const createMaze = useCallback((width: number, height: number): Cell[][] => {
    const maze: Cell[][] = [];

    // Initialize grid
    for (let y = 0; y < height; y++) {
      maze[y] = [];
      for (let x = 0; x < width; x++) {
        maze[y][x] = {
          x,
          y,
          walls: { top: true, right: true, bottom: true, left: true },
          visited: false,
          isPath: false
        };
      }
    }

    // Recursive backtracking algorithm
    const stack: Cell[] = [];
    let current = maze[0][0];
    current.visited = true;

    const getNeighbors = (cell: Cell): Cell[] => {
      const neighbors: Cell[] = [];
      const { x, y } = cell;

      if (y > 0 && !maze[y - 1][x].visited) neighbors.push(maze[y - 1][x]); // top
      if (x < width - 1 && !maze[y][x + 1].visited) neighbors.push(maze[y][x + 1]); // right
      if (y < height - 1 && !maze[y + 1][x].visited) neighbors.push(maze[y + 1][x]); // bottom
      if (x > 0 && !maze[y][x - 1].visited) neighbors.push(maze[y][x - 1]); // left

      return neighbors;
    };

    const removeWall = (current: Cell, neighbor: Cell) => {
      const dx = current.x - neighbor.x;
      const dy = current.y - neighbor.y;

      if (dx === 1) { // neighbor is left
        current.walls.left = false;
        neighbor.walls.right = false;
      } else if (dx === -1) { // neighbor is right
        current.walls.right = false;
        neighbor.walls.left = false;
      } else if (dy === 1) { // neighbor is top
        current.walls.top = false;
        neighbor.walls.bottom = false;
      } else if (dy === -1) { // neighbor is bottom
        current.walls.bottom = false;
        neighbor.walls.top = false;
      }
    };

    while (true) {
      const neighbors = getNeighbors(current);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        next.visited = true;
        stack.push(current);
        removeWall(current, next);
        current = next;
      } else if (stack.length > 0) {
        current = stack.pop()!;
      } else {
        break;
      }
    }

    return maze;
  }, []);

  const findPath = useCallback((maze: Cell[][], start: Player, end: Player): { x: number; y: number }[] => {
    const queue: { cell: Player; path: { x: number; y: number }[] }[] = [{ cell: start, path: [start] }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { cell, path } = queue.shift()!;
      const key = `${cell.x},${cell.y}`;

      if (visited.has(key)) continue;
      visited.add(key);

      if (cell.x === end.x && cell.y === end.y) {
        return path;
      }

      const mazeCell = maze[cell.y][cell.x];
      const neighbors: Player[] = [];

      if (!mazeCell.walls.top && cell.y > 0) neighbors.push({ x: cell.x, y: cell.y - 1 });
      if (!mazeCell.walls.right && cell.x < maze[0].length - 1) neighbors.push({ x: cell.x + 1, y: cell.y });
      if (!mazeCell.walls.bottom && cell.y < maze.length - 1) neighbors.push({ x: cell.x, y: cell.y + 1 });
      if (!mazeCell.walls.left && cell.x > 0) neighbors.push({ x: cell.x - 1, y: cell.y });

      neighbors.forEach(neighbor => {
        if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
          queue.push({ cell: neighbor, path: [...path, neighbor] });
        }
      });
    }

    return [];
  }, []);

  const generateMaze = useCallback(() => {
    const { width, height } = getMazeSize();
    const newMaze = createMaze(width, height);
    const goal = { x: width - 1, y: height - 1 };
    const solution = findPath(newMaze, { x: 0, y: 0 }, goal);

    setGameState(prev => ({
      ...prev,
      maze: newMaze,
      player: { x: 0, y: 0 },
      goal,
      solution,
      isComplete: false,
      moves: 0,
      timeElapsed: 0,
      gameStarted: false,
      showSolution: false
    }));

    if (timerRef.current) clearInterval(timerRef.current);
  }, [getMazeSize, createMaze, findPath]);

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.isComplete) return;

    const { player, maze } = gameState;
    const currentCell = maze[player.y][player.x];
    let newX = player.x;
    let newY = player.y;
    let canMove = false;

    switch (direction) {
      case 'up':
        if (!currentCell.walls.top && player.y > 0) {
          newY = player.y - 1;
          canMove = true;
        }
        break;
      case 'down':
        if (!currentCell.walls.bottom && player.y < maze.length - 1) {
          newY = player.y + 1;
          canMove = true;
        }
        break;
      case 'left':
        if (!currentCell.walls.left && player.x > 0) {
          newX = player.x - 1;
          canMove = true;
        }
        break;
      case 'right':
        if (!currentCell.walls.right && player.x < maze[0].length - 1) {
          newX = player.x + 1;
          canMove = true;
        }
        break;
    }

    if (canMove) {
      const newPlayer = { x: newX, y: newY };
      const isComplete = newX === gameState.goal.x && newY === gameState.goal.y;

      setGameState(prev => ({
        ...prev,
        player: newPlayer,
        moves: prev.moves + 1,
        isComplete,
        gameStarted: true
      }));

      if (isComplete && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [gameState.player, gameState.maze, gameState.goal, gameState.isComplete]);

  const setDifficulty = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    setGameState(prev => ({ ...prev, difficulty }));
  }, []);

  const toggleSolution = useCallback(() => {
    setGameState(prev => ({ ...prev, showSolution: !prev.showSolution }));
  }, []);

  const resetGame = useCallback(() => {
    generateMaze();
  }, [generateMaze]);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStarted && !gameState.isComplete) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.gameStarted, gameState.isComplete]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  // Initialize maze
  useEffect(() => {
    generateMaze();
  }, [gameState.difficulty]);

  return {
    gameState,
    movePlayer,
    setDifficulty,
    toggleSolution,
    resetGame
  };
};
