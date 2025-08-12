import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
} from '@mui/material';
import { Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePhysicsSimulation } from './hooks/usePhysicsSimulation';
import { PhysicsCanvas } from './components/PhysicsCanvas';
import { ControlPanel } from './components/ControlPanel';

const PhysicsInteractiveGame: React.FC = () => {
  const navigate = useNavigate();
  const {
    gameState,
    addBall,
    clearBalls,
    startSimulation,
    stopSimulation,
    setSimulationType,
    updateSettings,
    toggleTrails,
    toggleVectors
  } = usePhysicsSimulation();

  const handleCanvasClick = (x: number, y: number) => {
    // Add some random velocity for more interesting physics
    const vx = (Math.random() - 0.5) * 10;
    const vy = (Math.random() - 0.5) * 10;
    addBall(x, y, vx, vy);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          ⚗️ Physics Interactive
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Interactive physics experiments and simulations
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <PhysicsCanvas
            balls={gameState.balls}
            showTrails={gameState.showTrails}
            showVectors={gameState.showVectors}
            width={gameState.canvasWidth}
            height={gameState.canvasHeight}
            onCanvasClick={handleCanvasClick}
          />
        </Grid>

        <Grid item xs={12} lg={4}>
          <ControlPanel
            isRunning={gameState.isRunning}
            simulationType={gameState.simulationType}
            settings={gameState.settings}
            showTrails={gameState.showTrails}
            showVectors={gameState.showVectors}
            onStart={startSimulation}
            onStop={stopSimulation}
            onClear={clearBalls}
            onSimulationTypeChange={setSimulationType}
            onSettingsChange={updateSettings}
            onToggleTrails={toggleTrails}
            onToggleVectors={toggleVectors}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
          Back to Games
        </Button>
      </Box>
    </Container>
  );
};

export default PhysicsInteractiveGame;
