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
  Switch,
  FormControlLabel,
} from '@mui/material';
import { PlayArrow, Pause, Refresh, Waves, Tune } from '@mui/icons-material';

export const WaveSimulatorLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [wave1, setWave1] = useState({
    frequency: 1,
    amplitude: 50,
    phase: 0,
    color: '#2196f3',
    enabled: true,
  });
  const [wave2, setWave2] = useState({
    frequency: 1.5,
    amplitude: 30,
    phase: 0,
    color: '#f44336',
    enabled: false,
  });
  const [showInterference, setShowInterference] = useState(true);
  const [time, setTime] = useState(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    frequency: number,
    amplitude: number,
    phase: number,
    color: string,
    time: number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const centerY = CANVAS_HEIGHT / 2;
    const wavelength = CANVAS_WIDTH / (frequency * 2);
    
    for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
      const k = (2 * Math.PI) / wavelength;
      const omega = 2 * Math.PI * frequency * 0.5; // Slow down for visibility
      const y = centerY + amplitude * Math.sin(k * x - omega * time + phase);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };

  const drawInterference = (
    ctx: CanvasRenderingContext2D,
    wave1: any,
    wave2: any,
    time: number
  ) => {
    if (!wave1.enabled && !wave2.enabled) return;
    
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const centerY = CANVAS_HEIGHT / 2;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += 2) {
      let y = centerY;
      
      if (wave1.enabled) {
        const wavelength1 = CANVAS_WIDTH / (wave1.frequency * 2);
        const k1 = (2 * Math.PI) / wavelength1;
        const omega1 = 2 * Math.PI * wave1.frequency * 0.5;
        y += wave1.amplitude * Math.sin(k1 * x - omega1 * time + wave1.phase);
      }
      
      if (wave2.enabled) {
        const wavelength2 = CANVAS_WIDTH / (wave2.frequency * 2);
        const k2 = (2 * Math.PI) / wavelength2;
        const omega2 = 2 * Math.PI * wave2.frequency * 0.5;
        y += wave2.amplitude * Math.sin(k2 * x - omega2 * time + wave2.phase);
      }
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
  };

  const animate = () => {
    if (!isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220'; // Dark background to match theme
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw center line
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)'; // Blue-tinted center line
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT / 2);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT / 2);
    ctx.stroke();

    // Draw grid
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    for (let x = 0; x <= CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw individual waves
    if (wave1.enabled) {
      drawWave(ctx, wave1.frequency, wave1.amplitude, wave1.phase, wave1.color, time);
    }
    if (wave2.enabled) {
      drawWave(ctx, wave2.frequency, wave2.amplitude, wave2.phase, wave2.color, time);
    }

    // Draw interference pattern
    if (showInterference && (wave1.enabled || wave2.enabled)) {
      drawInterference(ctx, wave1, wave2, time);
    }

    setTime(prev => prev + 0.1);
    animationRef.current = requestAnimationFrame(animate);
  };

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
  }, [isPlaying, wave1, wave2, showInterference]);

  const handlePlay = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setTime(0);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{
        background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 3,
      }}>
        🌊 Wave Simulator Lab
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ background: 'rgba(33, 150, 243, 0.1)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Pause /> : <PlayArrow />}
                  onClick={handlePlay}
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInterference}
                      onChange={(e) => setShowInterference(e.target.checked)}
                    />
                  }
                  label="Show Interference"
                />
                <Chip 
                  icon={<Waves />} 
                  label={`Time: ${time.toFixed(1)}s`}
                  color="primary"
                />
              </Box>
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
                background: 'white',
                width: '100%',
                maxWidth: '800px',
                height: 'auto',
              }}
            />
          </Paper>
        </Grid>

        {/* Wave Controls */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            {/* Wave 1 Controls */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: `2px solid ${wave1.color}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: wave1.color }}>
                    Wave 1
                  </Typography>
                  <Switch
                    checked={wave1.enabled}
                    onChange={(e) => setWave1(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  Frequency: {wave1.frequency.toFixed(1)} Hz
                </Typography>
                <Slider
                  value={wave1.frequency}
                  onChange={(_, value) => setWave1(prev => ({ ...prev, frequency: value as number }))}
                  min={0.1}
                  max={3}
                  step={0.1}
                  disabled={!wave1.enabled}
                />

                <Typography variant="body2" gutterBottom>
                  Amplitude: {wave1.amplitude} px
                </Typography>
                <Slider
                  value={wave1.amplitude}
                  onChange={(_, value) => setWave1(prev => ({ ...prev, amplitude: value as number }))}
                  min={10}
                  max={100}
                  step={5}
                  disabled={!wave1.enabled}
                />

                <Typography variant="body2" gutterBottom>
                  Phase: {wave1.phase.toFixed(1)} rad
                </Typography>
                <Slider
                  value={wave1.phase}
                  onChange={(_, value) => setWave1(prev => ({ ...prev, phase: value as number }))}
                  min={0}
                  max={2 * Math.PI}
                  step={0.1}
                  disabled={!wave1.enabled}
                />
              </Paper>
            </Grid>

            {/* Wave 2 Controls */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, border: `2px solid ${wave2.color}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: wave2.color }}>
                    Wave 2
                  </Typography>
                  <Switch
                    checked={wave2.enabled}
                    onChange={(e) => setWave2(prev => ({ ...prev, enabled: e.target.checked }))}
                  />
                </Box>
                
                <Typography variant="body2" gutterBottom>
                  Frequency: {wave2.frequency.toFixed(1)} Hz
                </Typography>
                <Slider
                  value={wave2.frequency}
                  onChange={(_, value) => setWave2(prev => ({ ...prev, frequency: value as number }))}
                  min={0.1}
                  max={3}
                  step={0.1}
                  disabled={!wave2.enabled}
                />

                <Typography variant="body2" gutterBottom>
                  Amplitude: {wave2.amplitude} px
                </Typography>
                <Slider
                  value={wave2.amplitude}
                  onChange={(_, value) => setWave2(prev => ({ ...prev, amplitude: value as number }))}
                  min={10}
                  max={100}
                  step={5}
                  disabled={!wave2.enabled}
                />

                <Typography variant="body2" gutterBottom>
                  Phase: {wave2.phase.toFixed(1)} rad
                </Typography>
                <Slider
                  value={wave2.phase}
                  onChange={(_, value) => setWave2(prev => ({ ...prev, phase: value as number }))}
                  min={0}
                  max={2 * Math.PI}
                  step={0.1}
                  disabled={!wave2.enabled}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Instructions */}
        <Grid item xs={12}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
              🎯 Explore Wave Properties and Interference!
            </Typography>
            <Typography variant="body2">
              • Adjust frequency to change wave speed and wavelength
              <br />
              • Modify amplitude to control wave height
              <br />
              • Change phase to shift waves horizontally
              <br />
              • Enable both waves to observe interference patterns
              <br />
              • Green line shows the resultant wave (superposition)
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};