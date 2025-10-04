import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Slider,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { PlayArrow, Pause, Refresh, Thermostat, Science } from '@mui/icons-material';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'gas' | 'liquid' | 'solid';
  color: string;
  size: number;
}

export const ParticlePlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [particleCount, setParticleCount] = useState(100);
  const [currentState, setCurrentState] = useState<'solid' | 'liquid' | 'gas'>('liquid');
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const MIN_TEMP = 200; // Below this = solid
  const MELT_TEMP = 273; // Ice melting point
  const BOIL_TEMP = 373; // Water boiling point

  const initializeParticles = () => {
    const newParticles: Particle[] = [];
    const state = getStateFromTemperature(temperature);
    
    for (let i = 0; i < particleCount; i++) {
      let x, y, vx, vy, size, color;
      
      switch (state) {
        case 'solid':
          // Arrange in a grid pattern with slight vibration
          const cols = Math.ceil(Math.sqrt(particleCount));
          const spacing = 20;
          const startX = (CANVAS_WIDTH - (cols * spacing)) / 2;
          const startY = (CANVAS_HEIGHT - (Math.ceil(particleCount / cols) * spacing)) / 2;
          
          x = startX + (i % cols) * spacing + (Math.random() - 0.5) * 5;
          y = startY + Math.floor(i / cols) * spacing + (Math.random() - 0.5) * 5;
          vx = (Math.random() - 0.5) * 0.5;
          vy = (Math.random() - 0.5) * 0.5;
          size = 6;
          color = '#9c27b0';
          break;
          
        case 'liquid':
          x = Math.random() * (CANVAS_WIDTH - 20) + 10;
          y = Math.random() * (CANVAS_HEIGHT - 20) + 10;
          const liquidSpeed = Math.sqrt(temperature / 50);
          vx = (Math.random() - 0.5) * liquidSpeed;
          vy = (Math.random() - 0.5) * liquidSpeed;
          size = 5;
          color = '#2196f3';
          break;
          
        case 'gas':
          x = Math.random() * (CANVAS_WIDTH - 20) + 10;
          y = Math.random() * (CANVAS_HEIGHT - 20) + 10;
          const gasSpeed = Math.sqrt(temperature / 20);
          vx = (Math.random() - 0.5) * gasSpeed;
          vy = (Math.random() - 0.5) * gasSpeed;
          size = 4;
          color = '#f44336';
          break;
      }
      
      newParticles.push({
        id: i,
        x,
        y,
        vx,
        vy,
        type: state,
        color,
        size,
      });
    }
    
    setParticles(newParticles);
    setCurrentState(state);
  };

  const getStateFromTemperature = (temp: number): 'solid' | 'liquid' | 'gas' => {
    if (temp < MELT_TEMP) return 'solid';
    if (temp < BOIL_TEMP) return 'liquid';
    return 'gas';
  };

  const updateParticles = () => {
    setParticles(prevParticles => {
      const state = getStateFromTemperature(temperature);
      
      return prevParticles.map(particle => {
        let { x, y, vx, vy } = particle;
        
        // Update velocities based on temperature and state
        const speedFactor = Math.sqrt(temperature / 300);
        
        switch (state) {
          case 'solid':
            // Minimal movement, mostly vibration
            vx += (Math.random() - 0.5) * 0.2;
            vy += (Math.random() - 0.5) * 0.2;
            vx *= 0.9; // Damping
            vy *= 0.9;
            break;
            
          case 'liquid':
            // Moderate movement with some cohesion
            vx += (Math.random() - 0.5) * speedFactor;
            vy += (Math.random() - 0.5) * speedFactor;
            vx *= 0.95;
            vy *= 0.95;
            break;
            
          case 'gas':
            // High movement, mostly random
            vx += (Math.random() - 0.5) * speedFactor * 2;
            vy += (Math.random() - 0.5) * speedFactor * 2;
            vx *= 0.99;
            vy *= 0.99;
            break;
        }
        
        // Update position
        x += vx;
        y += vy;
        
        // Boundary collisions
        if (x <= particle.size || x >= CANVAS_WIDTH - particle.size) {
          vx *= -0.8;
          x = Math.max(particle.size, Math.min(CANVAS_WIDTH - particle.size, x));
        }
        if (y <= particle.size || y >= CANVAS_HEIGHT - particle.size) {
          vy *= -0.8;
          y = Math.max(particle.size, Math.min(CANVAS_HEIGHT - particle.size, y));
        }
        
        // Update appearance based on state
        let color, size;
        switch (state) {
          case 'solid':
            color = `hsl(280, 70%, ${50 + Math.sin(Date.now() * 0.01 + particle.id) * 10}%)`;
            size = 6;
            break;
          case 'liquid':
            color = `hsl(210, 70%, ${50 + Math.sin(Date.now() * 0.005 + particle.id) * 15}%)`;
            size = 5;
            break;
          case 'gas':
            color = `hsl(0, 70%, ${60 + Math.sin(Date.now() * 0.02 + particle.id) * 20}%)`;
            size = 4;
            break;
        }
        
        return {
          ...particle,
          x,
          y,
          vx,
          vy,
          type: state,
          color,
          size,
        };
      });
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background first
    ctx.fillStyle = '#0b1220'; // Dark background to match theme
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw state-specific background overlay
    let bgColor;
    switch (currentState) {
      case 'solid':
        bgColor = 'linear-gradient(135deg, #e1bee7, #f3e5f5)';
        ctx.fillStyle = 'rgba(225, 190, 231, 0.2)'; // Translucent overlay
        break;
      case 'liquid':
        bgColor = 'linear-gradient(135deg, #bbdefb, #e3f2fd)';
        ctx.fillStyle = 'rgba(187, 222, 251, 0.2)'; // Translucent overlay
        break;
      case 'gas':
        bgColor = 'linear-gradient(135deg, #ffcdd2, #ffebee)';
        ctx.fillStyle = 'rgba(255, 205, 210, 0.2)'; // Translucent overlay
        break;
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw particles
    particles.forEach(particle => {
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add glow effect for gas particles
      if (particle.type === 'gas') {
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // Draw temperature indicator
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.font = '16px Arial';
    ctx.fillText(`Temperature: ${temperature}K (${(temperature - 273).toFixed(1)}°C)`, 10, 30);
    ctx.fillText(`State: ${currentState.toUpperCase()}`, 10, 50);
    ctx.fillText(`Particles: ${particles.length}`, 10, 70);
  };

  const animate = () => {
    if (!isPlaying) return;
    
    updateParticles();
    draw();
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    initializeParticles();
  }, [particleCount]);

  useEffect(() => {
    setCurrentState(getStateFromTemperature(temperature));
  }, [temperature]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, particles, temperature]);

  useEffect(() => {
    // Draw initial state
    draw();
  }, [particles]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    initializeParticles();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{
        background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 3,
      }}>
        ⚛️ Particle Playground
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ background: 'rgba(76, 175, 80, 0.1)' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                      onClick={handlePlay}
                      color="success"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip 
                    icon={<Thermostat />} 
                    label={`${temperature}K (${(temperature - 273).toFixed(1)}°C)`}
                    color="primary"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Chip 
                    icon={<Science />} 
                    label={`${currentState.toUpperCase()}`}
                    color={
                      currentState === 'solid' ? 'secondary' :
                      currentState === 'liquid' ? 'primary' : 'error'
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2 }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '800px',
                height: 'auto',
              }}
            />
          </Paper>
        </Grid>

        {/* Settings */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <Thermostat sx={{ mr: 1 }} />
                  Temperature Control
                </Typography>
                
                <Typography variant="body2" gutterBottom>
                  Temperature: {temperature}K ({(temperature - 273).toFixed(1)}°C)
                </Typography>
                <Slider
                  value={temperature}
                  onChange={(_, value) => setTemperature(value as number)}
                  min={200}
                  max={500}
                  step={5}
                  marks={[
                    { value: 273, label: 'Melt' },
                    { value: 373, label: 'Boil' },
                  ]}
                />

                <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                  Particle Count: {particleCount}
                </Typography>
                <Slider
                  value={particleCount}
                  onChange={(_, value) => setParticleCount(value as number)}
                  min={50}
                  max={200}
                  step={10}
                />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  States of Matter
                </Typography>
                <Box sx={{ fontSize: '0.9rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  <div><strong>🟣 Solid (&lt; 273K):</strong> Particles vibrate in fixed positions</div>
                  <div><strong>🔵 Liquid (273-373K):</strong> Particles move freely but stay close</div>
                  <div><strong>🔴 Gas (&gt; 373K):</strong> Particles move rapidly in all directions</div>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              🎯 Explore States of Matter!
            </Typography>
            <Typography variant="body2">
              • Adjust temperature to observe phase transitions
              <br />
              • Watch particle behavior change with temperature
              <br />
              • Observe how kinetic energy affects particle movement
              <br />
              • See real-time visualization of molecular motion theory
              <br />
              • Experiment with different particle counts
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};