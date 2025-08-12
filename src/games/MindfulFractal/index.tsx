import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Slider,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Home, PlayArrow, Pause, VolumeUp, VolumeOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const MindfulFractalGame: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = React.useState(false);
  const [sessionDuration, setSessionDuration] = React.useState(5);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  const [breathPhase, setBreathPhase] = React.useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [breathCount, setBreathCount] = React.useState(0);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [complexity, setComplexity] = React.useState(5);
  const [colorShift, setColorShift] = React.useState(0);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animationRef = React.useRef<number>();

  const drawFractal = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const time = Date.now() * 0.001;

    // Draw mandala-like fractal pattern
    for (let i = 0; i < complexity * 20; i++) {
      const angle = (i / (complexity * 20)) * Math.PI * 2;
      const radius = 50 + Math.sin(time + i * 0.1) * 30;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      const hue = (colorShift + i * 10 + time * 50) % 360;
      const saturation = 70;
      const lightness = 60 + Math.sin(time + i * 0.2) * 20;

      ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      ctx.beginPath();
      ctx.arc(x, y, 3 + Math.sin(time + i * 0.3) * 2, 0, Math.PI * 2);
      ctx.fill();

      // Draw connecting lines
      if (i > 0) {
        const prevAngle = ((i - 1) / (complexity * 20)) * Math.PI * 2;
        const prevRadius = 50 + Math.sin(time + (i - 1) * 0.1) * 30;
        const prevX = centerX + Math.cos(prevAngle) * prevRadius;
        const prevY = centerY + Math.sin(prevAngle) * prevRadius;

        ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness * 0.5}%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    if (isActive) {
      animationRef.current = requestAnimationFrame(drawFractal);
    }
  }, [complexity, colorShift, isActive]);

  const startSession = () => {
    setIsActive(true);
    setTimeRemaining(sessionDuration * 60);
    setBreathCount(0);
  };

  const stopSession = () => {
    setIsActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  React.useEffect(() => {
    if (isActive) {
      drawFractal();

      // Breathing timer
      const breathTimer = setInterval(() => {
        setBreathPhase(prev => {
          switch (prev) {
            case 'inhale': return 'hold';
            case 'hold': return 'exhale';
            case 'exhale': return 'pause';
            case 'pause':
              setBreathCount(c => c + 1);
              return 'inhale';
            default: return 'inhale';
          }
        });
      }, 4000); // 4 seconds per phase = 16 second breath cycle

      // Session timer
      const sessionTimer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(breathTimer);
        clearInterval(sessionTimer);
      };
    }
  }, [isActive, drawFractal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale': return '🌬️ Breathe In...';
      case 'hold': return '⏸️ Hold...';
      case 'exhale': return '💨 Breathe Out...';
      case 'pause': return '⏸️ Pause...';
    }
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
          🌀 Mindful Fractal
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Relaxing fractal meditation experience
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              style={{
                border: '2px solid rgba(126, 231, 199, 0.3)',
                borderRadius: '8px',
                background: 'radial-gradient(circle at center, #001122, #000011)'
              }}
            />

            {isActive && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h5" sx={{ mb: 2, color: '#7ee7c7' }}>
                  {getBreathInstruction()}
                </Typography>
                <Chip
                  label={`Breaths: ${breathCount}`}
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
                <Chip
                  label={`Time: ${formatTime(timeRemaining)}`}
                  variant="outlined"
                />
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
            <Typography variant="h6" gutterBottom>Session Controls</Typography>

            {!isActive ? (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" gutterBottom>
                    Duration: {sessionDuration} minutes
                  </Typography>
                  <Slider
                    value={sessionDuration}
                    onChange={(_, value) => setSessionDuration(value as number)}
                    min={1}
                    max={30}
                    step={1}
                    marks={[
                      { value: 5, label: '5m' },
                      { value: 15, label: '15m' },
                      { value: 30, label: '30m' }
                    ]}
                  />
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={startSession}
                  startIcon={<PlayArrow />}
                  sx={{
                    background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
                    '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' },
                    mb: 2
                  }}
                >
                  Start Session
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                fullWidth
                onClick={stopSession}
                startIcon={<Pause />}
                sx={{ mb: 2 }}
              >
                End Session
              </Button>
            )}

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Visual Settings</Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Complexity: {complexity}
              </Typography>
              <Slider
                value={complexity}
                onChange={(_, value) => setComplexity(value as number)}
                min={1}
                max={10}
                step={1}
                disabled={isActive}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Color Shift: {colorShift}
              </Typography>
              <Slider
                value={colorShift}
                onChange={(_, value) => setColorShift(value as number)}
                min={0}
                max={360}
                step={10}
                disabled={isActive}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  icon={<VolumeOff />}
                  checkedIcon={<VolumeUp />}
                />
              }
              label="Ambient Sounds"
              sx={{ mb: 3 }}
            />

            <Button variant="outlined" fullWidth onClick={() => navigate('/games')} startIcon={<Home />}>
              Back to Games
            </Button>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Meditation Guide:</strong><br />
                • Focus on the moving patterns<br />
                • Follow the breathing instructions<br />
                • Let your mind relax and wander<br />
                • Adjust visuals to your preference
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default MindfulFractalGame;
