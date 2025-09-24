import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import { PlayArrow, Pause, Refresh, Speed, Timeline } from '@mui/icons-material';
import { useRunnerGame } from './hooks/useRunnerGame';
import { MotionCanvas } from './components/MotionCanvas';
import { MotionControls } from './components/MotionControls';
import { MotionEquations } from './components/MotionEquations';

export const RunnerControlMotion: React.FC = () => {
  const {
    gameState,
    startLevel,
    pauseGame,
    resetGame,
    updateVelocity,
    updateAcceleration,
    isPlaying,
    currentLevel,
    score,
    timeElapsed,
    targetsHit,
    totalTargets,
  } = useRunnerGame();

  return (
    <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 203, 243, 0.02) 100%)', minHeight: '100vh' }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}>
        🏃‍♂️ Runner: Control the Motion
      </Typography>

      <Grid container spacing={3}>
        {/* Game Status */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15) 0%, rgba(33, 203, 243, 0.05) 100%)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)',
          }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="h6">Level {currentLevel}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Score: {score}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Targets Hit</Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={(targetsHit / totalTargets) * 100}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="caption">
                    {targetsHit}/{totalTargets}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2">Time</Typography>
                  <Chip 
                    icon={<Timeline />} 
                    label={`${timeElapsed.toFixed(1)}s`}
                    size="small"
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                      onClick={isPlaying ? pauseGame : startLevel}
                      sx={{
                        background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                        fontWeight: 'bold',
                        boxShadow: '0 3px 12px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #388e3c, #689f38)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      {isPlaying ? '⏸️ PAUSE' : '▶️ START'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="medium"
                      startIcon={<Refresh />}
                      onClick={resetGame}
                      sx={{
                        borderColor: '#2196f3',
                        color: '#2196f3',
                        fontWeight: 'bold',
                        '&:hover': {
                          borderColor: '#1976d2',
                          backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      🔄 RESET
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Game Canvas */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ 
            p: 2, 
            minHeight: '450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(33, 150, 243, 0.3)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            overflow: 'hidden',
          }}>
            <MotionCanvas
              gameState={gameState}
              width={600}
              height={400}
            />
          </Paper>
        </Grid>

        {/* Controls */}
        <Grid item xs={12} lg={5}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <MotionControls
                velocity={gameState.player.velocity}
                acceleration={gameState.player.acceleration || { vx: 0, vy: 0 }}
                onVelocityChange={updateVelocity}
                onAccelerationChange={updateAcceleration}
                disabled={!isPlaying}
              />
            </Grid>
            
            <Grid item xs={12}>
              <MotionEquations
                position={gameState.player.position}
                velocity={gameState.player.velocity}
                acceleration={gameState.player.acceleration || { vx: 0, vy: 0 }}
                timeElapsed={timeElapsed}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              🎯 Objective: Control your runner using physics equations!
            </Typography>
            <Typography variant="body2">
              • Use velocity and acceleration controls to move your runner
              <br />
              • Hit all targets to complete the level
              <br />
              • Avoid obstacles that slow you down
              <br />
              • Watch the motion equations update in real-time
              <br />
              • Higher levels have more challenging target positions
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};