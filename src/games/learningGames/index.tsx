import React, { useState } from 'react';
import { LearningGamesLayout } from './components/LearningGamesLayout';
import { learningGamesData } from './data/gamesData';
import { GameClass, Subject } from './types';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, CircularProgress, Paper } from '@mui/material';
import { PlayArrow, Timer, TrendingUp } from '@mui/icons-material';

// Import Physics Games
import { 
  CircuitBuilder,
  OpticsLab,
  ThermodynamicsLab,
  ProjectileMotion,
  ElectromagneticField,
  QuantumPhysics,
  AtomicStructure,
  GravitySimulator
} from './Physics';
import { RunnerControlMotion } from './Physics/RunnerControlMotion';
import { WaveSimulatorLab } from './Physics/WaveSimulatorLab';

// Import Chemistry Games
import { ParticlePlayground } from './Chemistry';
import { 
  ReactionLab, 
  PhExplorer, 
  MoleculeBondStudio, 
  ReactionDynamics, 
  OrganicSynthesisPath, 
  ElementExplorer, 
  SolutionSpeedway 
} from './Chemistry/ComingSoonGames';

// Import Mathematics Games
import { NumberMaze } from './Mathematics/NumberMaze';
import { 
  PolynomialBuilder, 
  ShapeDesigner, 
  ChanceAndData, 
  CurvedPathRacer, 
  WaveCircleGame, 
  AreaTangentQuest, 
  VectorFlight, 
  OptimizationChallenge 
} from './Mathematics/ComingSoonGames';

const LearningGames: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<GameClass | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGameSelect = async (gameId: string) => {
    setIsLoading(true);
    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setSelectedGame(gameId);
    setIsLoading(false);
  };

  const renderGameComponent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>Loading Game...</Typography>
        </Box>
      );
    }

    switch (selectedGame) {
      // Physics Games
      case 'circuit-builder':
        return <CircuitBuilder />;
      case 'optics-lab':
        return <OpticsLab />;
      case 'thermodynamics-lab':
        return <ThermodynamicsLab />;
      case 'projectile-motion':
        return <ProjectileMotion />;
      case 'electromagnetic-field':
        return <ElectromagneticField />;
      case 'quantum-physics':
        return <QuantumPhysics />;
      case 'atomic-structure':
        return <AtomicStructure />;
      case 'gravity-simulator':
        return <GravitySimulator />;
      case 'runner-control-motion':
        return <RunnerControlMotion />;
      case 'wave-simulator-lab':
        return <WaveSimulatorLab />;

      // Chemistry Games
      case 'particle-playground':
        return <ParticlePlayground />;
      case 'reaction-lab':
        return <ReactionLab />;
      case 'ph-explorer':
        return <PhExplorer />;
      case 'molecule-bond-studio':
        return <MoleculeBondStudio />;
      case 'reaction-dynamics':
        return <ReactionDynamics />;
      case 'organic-synthesis-path':
        return <OrganicSynthesisPath />;
      case 'element-explorer':
        return <ElementExplorer />;
      case 'solution-speedway':
        return <SolutionSpeedway />;

      // Mathematics Games
      case 'number-maze':
        return <NumberMaze />;
      case 'polynomial-builder':
        return <PolynomialBuilder />;
      case 'shape-designer':
        return <ShapeDesigner />;
      case 'chance-and-data':
        return <ChanceAndData />;
      case 'curved-path-racer':
        return <CurvedPathRacer />;
      case 'wave-circle-game':
        return <WaveCircleGame />;
      case 'area-tangent-quest':
        return <AreaTangentQuest />;
      case 'vector-flight':
        return <VectorFlight />;
      case 'optimization-challenge':
        return <OptimizationChallenge />;

      default:
        return <GameSelection />;
    }
  };

  const GameSelection = () => {
    const games = selectedClass && selectedSubject 
      ? learningGamesData[selectedClass]?.[selectedSubject] || []
      : [];

    if (!selectedClass || !selectedSubject) {
      return (
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{
            background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}>
            🎓 Interactive Learning Games
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Select a class and subject from the sidebar to start learning!
          </Typography>
          <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Explore Physics, Chemistry, and Mathematics through engaging interactive games
              designed specifically for classes 9-12 curriculum.
            </Typography>
          </Paper>
        </Box>
      );
    }

    return (
      <Box>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{
            background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
          }}>
            Class {selectedClass} - {selectedSubject} Games
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {games.map((game) => (
            <Grid item xs={12} md={6} lg={4} key={game.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: `0 12px 30px rgba(${
                      selectedSubject === 'Physics' ? '33, 150, 243' :
                      selectedSubject === 'Chemistry' ? '76, 175, 80' :
                      '255, 152, 0'
                    }, 0.4)`,
                    border: `1px solid ${
                      selectedSubject === 'Physics' ? '#2196f3' :
                      selectedSubject === 'Chemistry' ? '#4caf50' :
                      '#ff9800'
                    }`,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {game.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {game.topic}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, minHeight: '60px' }}>
                    {game.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      size="small" 
                      label={game.difficulty}
                      color={
                        game.difficulty === 'Easy' ? 'success' :
                        game.difficulty === 'Medium' ? 'warning' : 'error'
                      }
                      icon={<TrendingUp />}
                    />
                    <Chip 
                      size="small" 
                      label={`${game.estimatedTime} min`}
                      variant="outlined"
                      icon={<Timer />}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlayArrow />}
                    onClick={() => handleGameSelect(game.id)}
                    sx={{
                      background: `linear-gradient(45deg, ${
                        selectedSubject === 'Physics' ? '#2196f3, #21cbf3' :
                        selectedSubject === 'Chemistry' ? '#4caf50, #8bc34a' :
                        '#ff9800, #ffc107'
                      })`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      boxShadow: `0 4px 15px rgba(${
                        selectedSubject === 'Physics' ? '33, 150, 243' :
                        selectedSubject === 'Chemistry' ? '76, 175, 80' :
                        '255, 152, 0'
                      }, 0.3)`,
                      '&:hover': {
                        background: `linear-gradient(45deg, ${
                          selectedSubject === 'Physics' ? '#1976d2, #0288d1' :
                          selectedSubject === 'Chemistry' ? '#388e3c, #689f38' :
                          '#f57c00, #ffa000'
                        })`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 20px rgba(${
                          selectedSubject === 'Physics' ? '33, 150, 243' :
                          selectedSubject === 'Chemistry' ? '76, 175, 80' :
                          '255, 152, 0'
                        }, 0.4)`,
                      },
                    }}
                  >
                    🎮 Play Game
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <LearningGamesLayout
      selectedClass={selectedClass}
      selectedSubject={selectedSubject}
      selectedGame={selectedGame}
      onClassSelect={setSelectedClass}
      onSubjectSelect={setSelectedSubject}
      onGameSelect={handleGameSelect}
      gameData={learningGamesData}
    >
      {renderGameComponent()}
    </LearningGamesLayout>
  );
};

export default LearningGames;