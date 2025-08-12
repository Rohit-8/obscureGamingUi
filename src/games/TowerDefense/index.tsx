import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Home, PlayArrow, Pause, Build, AttachMoney, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Tower {
  id: number;
  x: number;
  y: number;
  type: 'basic' | 'rapid' | 'heavy';
  level: number;
  damage: number;
  range: number;
  cost: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
  pathIndex: number;
}

const TowerDefenseGame: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [wave, setWave] = React.useState(1);
  const [lives, setLives] = React.useState(20);
  const [money, setMoney] = React.useState(100);
  const [score, setScore] = React.useState(0);
  const [selectedTowerType, setSelectedTowerType] = React.useState<'basic' | 'rapid' | 'heavy'>('basic');
  const [towers, setTowers] = React.useState<Tower[]>([]);
  const [enemies, setEnemies] = React.useState<Enemy[]>([]);
  const [isWaveActive, setIsWaveActive] = React.useState(false);

  const towerTypes = {
    basic: { damage: 20, range: 80, cost: 50, color: '#60a5fa', name: 'Basic Tower' },
    rapid: { damage: 10, range: 60, cost: 40, color: '#7ee7c7', name: 'Rapid Fire' },
    heavy: { damage: 50, range: 100, cost: 80, color: '#ff6b6b', name: 'Heavy Cannon' }
  };

  const enemyPath = [
    { x: 0, y: 200 },
    { x: 150, y: 200 },
    { x: 150, y: 100 },
    { x: 300, y: 100 },
    { x: 300, y: 300 },
    { x: 450, y: 300 },
    { x: 450, y: 150 },
    { x: 600, y: 150 }
  ];

  const startGame = () => {
    setIsPlaying(true);
    setWave(1);
    setLives(20);
    setMoney(100);
    setScore(0);
    setTowers([]);
    setEnemies([]);
    setIsWaveActive(false);
  };

  const startWave = () => {
    if (isWaveActive) return;

    setIsWaveActive(true);
    const enemyCount = 5 + wave * 2;

    // Spawn enemies with delay
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        const newEnemy: Enemy = {
          id: Date.now() + i,
          x: enemyPath[0].x,
          y: enemyPath[0].y,
          health: 50 + wave * 20,
          maxHealth: 50 + wave * 20,
          speed: 1 + wave * 0.2,
          reward: 10 + wave * 2,
          pathIndex: 0
        };

        setEnemies(prev => [...prev, newEnemy]);
      }, i * 1000);
    }
  };

  const placeTower = (gridX: number, gridY: number) => {
    if (!isPlaying) return;

    const towerConfig = towerTypes[selectedTowerType];
    if (money < towerConfig.cost) return;

    const x = gridX * 50 + 25;
    const y = gridY * 50 + 25;

    // Check if position is valid (not on path)
    const isOnPath = enemyPath.some(point =>
      Math.abs(point.x - x) < 40 && Math.abs(point.y - y) < 40
    );

    if (isOnPath) return;

    // Check if position is occupied
    const isOccupied = towers.some(tower =>
      Math.abs(tower.x - x) < 30 && Math.abs(tower.y - y) < 30
    );

    if (isOccupied) return;

    const newTower: Tower = {
      id: Date.now(),
      x,
      y,
      type: selectedTowerType,
      level: 1,
      damage: towerConfig.damage,
      range: towerConfig.range,
      cost: towerConfig.cost
    };

    setTowers(prev => [...prev, newTower]);
    setMoney(prev => prev - towerConfig.cost);
  };

  // Game loop for enemy movement and combat
  React.useEffect(() => {
    if (!isPlaying) return;

    const gameLoop = setInterval(() => {
      // Move enemies
      setEnemies(prev => prev.map(enemy => {
        if (enemy.pathIndex >= enemyPath.length - 1) {
          // Enemy reached end
          setLives(lives => Math.max(0, lives - 1));
          return null;
        }

        const target = enemyPath[enemy.pathIndex + 1];
        const dx = target.x - enemy.x;
        const dy = target.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < enemy.speed) {
          // Reached next waypoint
          return {
            ...enemy,
            x: target.x,
            y: target.y,
            pathIndex: enemy.pathIndex + 1
          };
        } else {
          // Move towards target
          return {
            ...enemy,
            x: enemy.x + (dx / distance) * enemy.speed,
            y: enemy.y + (dy / distance) * enemy.speed
          };
        }
      }).filter(Boolean) as Enemy[]);

      // Tower shooting (simplified)
      setEnemies(prev => {
        const updatedEnemies = [...prev];

        towers.forEach(tower => {
          const nearestEnemy = updatedEnemies
            .filter(enemy => {
              const distance = Math.sqrt(
                (enemy.x - tower.x) ** 2 + (enemy.y - tower.y) ** 2
              );
              return distance <= tower.range;
            })
            .sort((a, b) => b.pathIndex - a.pathIndex)[0];

          if (nearestEnemy) {
            nearestEnemy.health -= tower.damage;
            if (nearestEnemy.health <= 0) {
              setMoney(money => money + nearestEnemy.reward);
              setScore(score => score + nearestEnemy.reward * 10);
              const index = updatedEnemies.indexOf(nearestEnemy);
              updatedEnemies.splice(index, 1);
            }
          }
        });

        return updatedEnemies;
      });

      // Check wave completion
      if (isWaveActive && enemies.length === 0) {
        setIsWaveActive(false);
        setWave(wave => wave + 1);
        setMoney(money => money + 25); // Wave completion bonus
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [isPlaying, towers, enemies, isWaveActive, lives]);

  // Check game over
  React.useEffect(() => {
    if (lives <= 0) {
      setIsPlaying(false);
    }
  }, [lives]);

  const renderGameField = () => {
    return (
      <Box
        sx={{
          width: '600px',
          height: '400px',
          border: '2px solid #7ee7c7',
          borderRadius: 2,
          backgroundColor: '#0a1520',
          position: 'relative',
          cursor: 'crosshair'
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const gridX = Math.floor(x / 50);
          const gridY = Math.floor(y / 50);
          placeTower(gridX, gridY);
        }}
      >
        {/* Draw path */}
        <svg width="600" height="400" style={{ position: 'absolute', top: 0, left: 0 }}>
          <polyline
            points={enemyPath.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="20"
          />
        </svg>

        {/* Draw towers */}
        {towers.map(tower => (
          <Box
            key={tower.id}
            sx={{
              position: 'absolute',
              left: tower.x - 15,
              top: tower.y - 15,
              width: 30,
              height: 30,
              backgroundColor: towerTypes[tower.type].color,
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}
          >
            {tower.type === 'basic' ? '🔫' : tower.type === 'rapid' ? '⚡' : '💣'}
          </Box>
        ))}

        {/* Draw enemies */}
        {enemies.map(enemy => (
          <Box
            key={enemy.id}
            sx={{
              position: 'absolute',
              left: enemy.x - 10,
              top: enemy.y - 10,
              width: 20,
              height: 20,
              backgroundColor: '#ff6b6b',
              borderRadius: '50%',
              border: '1px solid white'
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🏰 Tower Defense
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Strategic tower placement game - Defend your base!
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            {renderGameField()}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
            {/* Game Stats */}
            <Box sx={{ mb: 3 }}>
              <Chip icon={<Favorite />} label={`Lives: ${lives}`} variant="outlined" sx={{ mr: 1, mb: 1 }} />
              <Chip icon={<AttachMoney />} label={`Money: $${money}`} variant="outlined" sx={{ mr: 1, mb: 1 }} />
              <Chip label={`Wave: ${wave}`} variant="outlined" sx={{ mr: 1, mb: 1 }} />
              <Chip label={`Score: ${score}`} variant="outlined" sx={{ mb: 1 }} />
            </Box>

            {/* Tower Selection */}
            <Typography variant="h6" gutterBottom>Select Tower</Typography>
            <ToggleButtonGroup
              value={selectedTowerType}
              exclusive
              onChange={(_, value) => value && setSelectedTowerType(value)}
              sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              {Object.entries(towerTypes).map(([type, config]) => (
                <ToggleButton
                  key={type}
                  value={type}
                  sx={{ justifyContent: 'flex-start', p: 2 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography>{config.name}</Typography>
                    <Typography>${config.cost}</Typography>
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* Controls */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {!isPlaying ? (
                <Button
                  variant="contained"
                  onClick={startGame}
                  startIcon={<PlayArrow />}
                  sx={{
                    background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
                    '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' }
                  }}
                >
                  Start Game
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={startWave}
                  disabled={isWaveActive}
                  startIcon={<Build />}
                >
                  {isWaveActive ? 'Wave in Progress' : `Start Wave ${wave}`}
                </Button>
              )}

              <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
                Back to Games
              </Button>
            </Box>

            {/* Game Over */}
            {lives <= 0 && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#ff6b6b', mb: 1 }}>
                  Game Over!
                </Typography>
                <Typography variant="body2">
                  Final Score: {score} points, Wave {wave}
                </Typography>
              </Box>
            )}

            {/* Instructions */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>How to play:</strong><br />
                • Click on the field to place towers<br />
                • Enemies follow the white path<br />
                • Stop enemies before they reach the end<br />
                • Earn money to build more towers
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default TowerDefenseGame;
