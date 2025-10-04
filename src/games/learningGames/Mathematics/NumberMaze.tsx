import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { PlayArrow, Refresh, EmojiEvents, Timer, Category } from '@mui/icons-material';

type NumberType = 'natural' | 'whole' | 'integer' | 'rational' | 'irrational' | 'real';

interface MazeCell {
  type: 'wall' | 'path' | 'number' | 'target' | 'start';
  value?: number;
  classifications?: NumberType[];
  visited?: boolean;
}

interface Position {
  row: number;
  col: number;
}

export const NumberMaze: React.FC = () => {
  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ row: 0, col: 0 });
  const [targetPos, setTargetPos] = useState<Position>({ row: 0, col: 0 });
  const [requiredType, setRequiredType] = useState<NumberType>('rational');
  const [collectedNumbers, setCollectedNumbers] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameMessage, setGameMessage] = useState<string>('');

  const MAZE_SIZE = 15;

  const classifyNumber = (num: number): NumberType[] => {
    const classifications: NumberType[] = ['real'];
    
    // Check if it's a perfect square root or rational
    if (Number.isInteger(num)) {
      classifications.push('integer');
      if (num >= 0) {
        classifications.push('whole');
        if (num > 0) {
          classifications.push('natural');
        }
      }
      classifications.push('rational');
    } else {
      // Check if it's rational (can be expressed as a fraction)
      const decimalPart = Math.abs(num % 1);
      const decimalStr = decimalPart.toString();
      
      // Simple check for common irrational numbers
      if (
        Math.abs(num - Math.PI) < 0.001 ||
        Math.abs(num - Math.E) < 0.001 ||
        Math.abs(num - Math.sqrt(2)) < 0.001 ||
        Math.abs(num - Math.sqrt(3)) < 0.001 ||
        Math.abs(num - Math.sqrt(5)) < 0.001
      ) {
        classifications.push('irrational');
      } else {
        // For this game, treat decimal numbers as rational
        classifications.push('rational');
      }
    }
    
    return classifications;
  };

  const generateMaze = useCallback(() => {
    const newMaze: MazeCell[][] = Array(MAZE_SIZE).fill(null).map(() =>
      Array(MAZE_SIZE).fill(null).map(() => ({ type: 'wall' as const }))
    );

    // Create a simple maze pattern
    for (let row = 1; row < MAZE_SIZE - 1; row += 2) {
      for (let col = 1; col < MAZE_SIZE - 1; col += 2) {
        newMaze[row][col] = { type: 'path' };
        
        // Randomly create corridors
        if (Math.random() > 0.3) {
          if (row + 1 < MAZE_SIZE - 1) newMaze[row + 1][col] = { type: 'path' };
        }
        if (Math.random() > 0.3) {
          if (col + 1 < MAZE_SIZE - 1) newMaze[row][col + 1] = { type: 'path' };
        }
      }
    }

    // Add start position
    newMaze[1][1] = { type: 'start' };
    setPlayerPos({ row: 1, col: 1 });

    // Add target position
    const targetRow = MAZE_SIZE - 2;
    const targetCol = MAZE_SIZE - 2;
    newMaze[targetRow][targetCol] = { type: 'target' };
    setTargetPos({ row: targetRow, col: targetCol });

    // Add numbers throughout the maze
    const numbers = generateNumbers();
    let numberIndex = 0;

    for (let row = 0; row < MAZE_SIZE; row++) {
      for (let col = 0; col < MAZE_SIZE; col++) {
        if (newMaze[row][col].type === 'path' && numberIndex < numbers.length) {
          if (Math.random() > 0.6) { // Only place numbers in some path cells
            newMaze[row][col] = {
              type: 'number',
              value: numbers[numberIndex],
              classifications: classifyNumber(numbers[numberIndex]),
            };
            numberIndex++;
          }
        }
      }
    }

    setMaze(newMaze);
  }, [level]);

  const generateNumbers = (): number[] => {
    const numbers: number[] = [];
    const numCount = 8 + level * 2;

    for (let i = 0; i < numCount; i++) {
      const rand = Math.random();
      let num: number;

      if (rand < 0.3) {
        // Natural numbers
        num = Math.floor(Math.random() * 20) + 1;
      } else if (rand < 0.5) {
        // Integers (including negative)
        num = Math.floor(Math.random() * 40) - 20;
      } else if (rand < 0.7) {
        // Rational decimals
        num = Math.round((Math.random() * 20 - 10) * 100) / 100;
      } else if (rand < 0.85) {
        // Common fractions
        const numerator = Math.floor(Math.random() * 10) + 1;
        const denominator = Math.floor(Math.random() * 10) + 2;
        num = Math.round((numerator / denominator) * 100) / 100;
      } else {
        // Irrational numbers (approximations)
        const irrationals = [Math.PI, Math.E, Math.sqrt(2), Math.sqrt(3), Math.sqrt(5)];
        num = Math.round(irrationals[Math.floor(Math.random() * irrationals.length)] * 100) / 100;
      }

      numbers.push(num);
    }

    return numbers;
  };

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!isPlaying) return;

    const newPos = { ...playerPos };
    
    switch (direction) {
      case 'up':
        newPos.row = Math.max(0, newPos.row - 1);
        break;
      case 'down':
        newPos.row = Math.min(MAZE_SIZE - 1, newPos.row + 1);
        break;
      case 'left':
        newPos.col = Math.max(0, newPos.col - 1);
        break;
      case 'right':
        newPos.col = Math.min(MAZE_SIZE - 1, newPos.col + 1);
        break;
    }

    const cell = maze[newPos.row][newPos.col];
    
    if (cell.type === 'wall') return; // Can't move through walls

    setPlayerPos(newPos);

    // Check if player collected a number
    if (cell.type === 'number' && cell.value !== undefined && cell.classifications) {
      if (cell.classifications.includes(requiredType)) {
        setCollectedNumbers(prev => [...prev, cell.value!]);
        setScore(prev => prev + 10 * level);
        setGameMessage(`Correct! ${cell.value} is ${requiredType}`);
        
        // Mark cell as visited
        setMaze(prevMaze => {
          const newMaze = [...prevMaze];
          newMaze[newPos.row][newPos.col] = { ...cell, type: 'path', visited: true };
          return newMaze;
        });
      } else {
        setScore(prev => Math.max(0, prev - 5));
        setGameMessage(`Incorrect! ${cell.value} is not ${requiredType}`);
      }
      
      setTimeout(() => setGameMessage(''), 2000);
    }

    // Check if reached target
    if (newPos.row === targetPos.row && newPos.col === targetPos.col) {
      if (collectedNumbers.length >= 3) {
        setScore(prev => prev + 50 * level);
        setLevel(prev => prev + 1);
        setGameMessage('Level Complete! Moving to next level...');
        setTimeout(() => {
          nextLevel();
        }, 2000);
      } else {
        setGameMessage(`Collect at least 3 ${requiredType} numbers first!`);
        setTimeout(() => setGameMessage(''), 2000);
      }
    }
  }, [isPlaying, playerPos, maze, requiredType, collectedNumbers.length, level, targetPos]);

  const nextLevel = () => {
    setCollectedNumbers([]);
    setRequiredType(prev => {
      const types: NumberType[] = ['natural', 'whole', 'integer', 'rational', 'irrational', 'real'];
      const currentIndex = types.indexOf(prev);
      return types[(currentIndex + 1) % types.length];
    });
    generateMaze();
    setGameMessage('');
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeElapsed(0);
    setScore(0);
    setLevel(1);
    setCollectedNumbers([]);
    setRequiredType('rational');
    generateMaze();
  };

  const resetGame = () => {
    setIsPlaying(false);
    setTimeElapsed(0);
    setScore(0);
    setLevel(1);
    setCollectedNumbers([]);
    setGameMessage('');
    generateMaze();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          event.preventDefault();
          movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
          event.preventDefault();
          movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
          event.preventDefault();
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
          event.preventDefault();
          movePlayer('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Initialize maze on component mount
  useEffect(() => {
    generateMaze();
  }, [generateMaze]);

  const getCellDisplay = (cell: MazeCell, row: number, col: number) => {
    if (row === playerPos.row && col === playerPos.col) {
      return '🧑';
    }
    
    switch (cell.type) {
      case 'wall':
        return '⬛';
      case 'start':
        return '🟢';
      case 'target':
        return '🎯';
      case 'number':
        return cell.visited ? '✅' : cell.value?.toString() || '';
      case 'path':
        return cell.visited ? '👣' : '⬜';
      default:
        return '⬜';
    }
  };

  const getCellColor = (cell: MazeCell, row: number, col: number) => {
    if (row === playerPos.row && col === playerPos.col) {
      return '#2196f3';
    }
    
    switch (cell.type) {
      case 'wall':
        return '#424242';
      case 'start':
        return '#4caf50';
      case 'target':
        return '#f44336';
      case 'number':
        if (cell.visited) return '#4caf50';
        return cell.classifications?.includes(requiredType) ? '#ffeb3b' : '#ff9800';
      case 'path':
        return cell.visited ? '#e8f5e8' : '#f5f5f5';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{
        background: 'linear-gradient(45deg, #ff9800, #ffc107)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 3,
      }}>
        🔢 Number Maze
      </Typography>

      <Grid container spacing={3}>
        {/* Game Status */}
        <Grid item xs={12}>
          <Card sx={{ background: 'rgba(255, 152, 0, 0.1)' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">Level {level}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score: {score}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Chip 
                    icon={<Category />} 
                    label={`Find: ${requiredType.toUpperCase()}`}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Chip 
                    icon={<EmojiEvents />} 
                    label={`Collected: ${collectedNumbers.length}/3`}
                    color="success"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Chip 
                    icon={<Timer />} 
                    label={`${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`}
                    color="secondary"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Controls */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={startGame}
              disabled={isPlaying}
            >
              Start Game
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={resetGame}
            >
              Reset
            </Button>
          </Box>
        </Grid>

        {/* Game Message */}
        {gameMessage && (
          <Grid item xs={12}>
            <Alert severity={gameMessage.includes('Correct') ? 'success' : gameMessage.includes('Incorrect') ? 'error' : 'info'}>
              {gameMessage}
            </Alert>
          </Grid>
        )}

        {/* Maze */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${MAZE_SIZE}, 1fr)`,
              gap: '2px',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              {maze.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Box
                    key={`${rowIndex}-${colIndex}`}
                    sx={{
                      width: '30px',
                      height: '30px',
                      backgroundColor: getCellColor(cell, rowIndex, colIndex),
                      border: '1px solid #ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'default',
                    }}
                  >
                    {getCellDisplay(cell, rowIndex, colIndex)}
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Number Classifications
                </Typography>
                <Box sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                  <div><strong>Natural:</strong> 1, 2, 3, 4, ...</div>
                  <div><strong>Whole:</strong> 0, 1, 2, 3, ...</div>
                  <div><strong>Integer:</strong> ..., -2, -1, 0, 1, 2, ...</div>
                  <div><strong>Rational:</strong> Can be written as a/b</div>
                  <div><strong>Irrational:</strong> π, e, √2, √3, ...</div>
                  <div><strong>Real:</strong> All rational and irrational numbers</div>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Controls
                </Typography>
                <Box sx={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                  <div>🔑 <strong>Arrow Keys:</strong> Move player</div>
                  <div>🔑 <strong>WASD:</strong> Alternative movement</div>
                  <div>🎯 <strong>Goal:</strong> Collect 3+ {requiredType} numbers</div>
                  <div>🏁 <strong>Finish:</strong> Reach the target (🎯)</div>
                </Box>
              </Paper>
            </Grid>

            {collectedNumbers.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Collected Numbers
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {collectedNumbers.map((num, index) => (
                      <Chip
                        key={index}
                        label={num}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              🎯 Navigate the maze and collect the right type of numbers!
            </Typography>
            <Typography variant="body2">
              • Use arrow keys or WASD to move through the maze
              <br />
              • Collect numbers that match the required classification
              <br />
              • Yellow numbers are correct, orange numbers are incorrect
              <br />
              • Collect at least 3 correct numbers to complete the level
              <br />
              • Reach the target (🎯) to finish the level
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};