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
  ButtonGroup,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  LinearProgress,
} from '@mui/material';
import { 
  Psychology, 
  Waves, 
  RadioButtonUnchecked,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Info,
  Science,
  Visibility
} from '@mui/icons-material';

interface QuantumState {
  amplitude: number;
  phase: number;
  energy: number;
  probability: number;
}

interface WaveFunction {
  x: number;
  real: number;
  imaginary: number;
  probability: number;
}

interface Photon {
  x: number;
  y: number;
  wavelength: number;
  intensity: number;
  polarization: number;
  detected: boolean;
}

export const QuantumPhysics: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [quantumStates, setQuantumStates] = useState<QuantumState[]>([]);
  const [waveFunction, setWaveFunction] = useState<WaveFunction[]>([]);
  const [photons, setPhotons] = useState<Photon[]>([]);
  const [waveLength, setWaveLength] = useState(50);
  const [amplitude, setAmplitude] = useState(1.0);
  const [frequency, setFrequency] = useState(1.0);
  const [barrierHeight, setBarrierHeight] = useState(2.0);
  const [barrierWidth, setBarrierWidth] = useState(50);
  const [slitSeparation, setSlitSeparation] = useState(100);
  const [detectorPosition, setDetectorPosition] = useState(400);
  const [showProbabilityDensity, setShowProbabilityDensity] = useState(true);
  const [showWaveFunction, setShowWaveFunction] = useState(true);
  const [showInterferencePattern, setShowInterferencePattern] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [measurementCount, setMeasurementCount] = useState(0);
  const [detectionCount, setDetectionCount] = useState(0);
  const [score, setScore] = useState(0);
  const [experiments, setExperiments] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;
  const PLANCK_CONSTANT = 6.626e-34;
  const LIGHT_SPEED = 3e8;

  const tabLabels = ['Wave-Particle Duality', 'Quantum Tunneling', 'Superposition', 'Uncertainty Principle'];

  const initializeWaveFunction = () => {
    const newWaveFunction: WaveFunction[] = [];
    const dx = 2;
    
    for (let x = 0; x < CANVAS_WIDTH; x += dx) {
      const k = 2 * Math.PI / waveLength;
      const omega = frequency;
      const t = Date.now() / 1000;
      
      // Gaussian wave packet
      const sigma = 30;
      const x0 = 150;
      const envelope = Math.exp(-((x - x0) ** 2) / (2 * sigma ** 2));
      
      const real = amplitude * envelope * Math.cos(k * x - omega * t);
      const imaginary = amplitude * envelope * Math.sin(k * x - omega * t);
      const probability = real ** 2 + imaginary ** 2;
      
      newWaveFunction.push({ x, real, imaginary, probability });
    }
    
    setWaveFunction(newWaveFunction);
  };

  const initializeQuantumStates = () => {
    const states: QuantumState[] = [];
    
    // Create superposition of energy eigenstates
    for (let n = 1; n <= 5; n++) {
      const energy = n ** 2 * Math.PI ** 2 / (2 * 100); // Particle in a box
      const amplitude = 1 / Math.sqrt(5); // Equal superposition
      const phase = Math.random() * 2 * Math.PI;
      const probability = amplitude ** 2;
      
      states.push({ amplitude, phase, energy, probability });
    }
    
    setQuantumStates(states);
  };

  const generatePhotons = () => {
    if (photons.length < 50) {
      const newPhoton: Photon = {
        x: 50,
        y: CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 200,
        wavelength: 500 + Math.random() * 200, // 500-700nm
        intensity: 0.5 + Math.random() * 0.5,
        polarization: Math.random() * 2 * Math.PI,
        detected: false
      };
      
      setPhotons(prev => [...prev, newPhoton]);
    }
  };

  const updatePhotons = () => {
    if (!isRunning) return;

    setPhotons(prevPhotons => {
      return prevPhotons.map(photon => {
        if (photon.detected) return photon;

        let newPhoton = { ...photon };
        newPhoton.x += 2 * animationSpeed;
        
        // Double-slit interference
        if (newPhoton.x > 200 && newPhoton.x < 220) {
          const slit1Y = CANVAS_HEIGHT / 2 - slitSeparation / 2;
          const slit2Y = CANVAS_HEIGHT / 2 + slitSeparation / 2;
          const slitWidth = 20;
          
          // Check if photon passes through slits
          const passesSlit1 = Math.abs(newPhoton.y - slit1Y) < slitWidth;
          const passesSlit2 = Math.abs(newPhoton.y - slit2Y) < slitWidth;
          
          if (!passesSlit1 && !passesSlit2) {
            // Photon is blocked
            newPhoton.detected = true;
            newPhoton.intensity = 0;
            return newPhoton;
          }
          
          // Create quantum superposition after slits
          if (passesSlit1 && passesSlit2) {
            // Both slits - create interference
            const path1 = Math.sqrt((newPhoton.x - 200) ** 2 + (newPhoton.y - slit1Y) ** 2);
            const path2 = Math.sqrt((newPhoton.x - 200) ** 2 + (newPhoton.y - slit2Y) ** 2);
            const pathDiff = path2 - path1;
            const phase = (2 * Math.PI * pathDiff) / newPhoton.wavelength;
            
            // Interference modifies intensity
            newPhoton.intensity *= (1 + Math.cos(phase)) / 2;
          }
        }
        
        // Detection at screen
        if (newPhoton.x >= detectorPosition && !newPhoton.detected) {
          newPhoton.detected = true;
          setDetectionCount(prev => prev + 1);
          setScore(prev => prev + 5);
        }
        
        // Remove photons that go off screen
        if (newPhoton.x > CANVAS_WIDTH) {
          return null;
        }
        
        return newPhoton;
      }).filter(Boolean) as Photon[];
    });
  };

  const updateWaveFunction = () => {
    if (!isRunning) return;
    
    const newWaveFunction: WaveFunction[] = [];
    const dx = 2;
    const k = 2 * Math.PI / waveLength;
    const omega = frequency;
    const t = Date.now() / 1000 * animationSpeed;
    
    for (let x = 0; x < CANVAS_WIDTH; x += dx) {
      let real = 0;
      let imaginary = 0;
      
      if (currentTab === 1) {
        // Quantum tunneling
        const barrierStart = 300;
        const barrierEnd = barrierStart + barrierWidth;
        
        if (x < barrierStart) {
          // Before barrier
          const envelope = Math.exp(-((x - 100) ** 2) / 1000);
          real = amplitude * envelope * Math.cos(k * x - omega * t);
          imaginary = amplitude * envelope * Math.sin(k * x - omega * t);
        } else if (x >= barrierStart && x <= barrierEnd) {
          // Inside barrier - exponential decay
          const kappa = Math.sqrt(2 * barrierHeight * k);
          const decay = Math.exp(-kappa * (x - barrierStart));
          real = amplitude * 0.3 * decay * Math.cos(k * x - omega * t);
          imaginary = amplitude * 0.3 * decay * Math.sin(k * x - omega * t);
        } else {
          // After barrier - transmitted wave
          const transmission = Math.exp(-Math.sqrt(2 * barrierHeight) * barrierWidth / 10);
          real = amplitude * transmission * Math.cos(k * x - omega * t);
          imaginary = amplitude * transmission * Math.sin(k * x - omega * t);
        }
      } else {
        // Standard wave packet
        const sigma = 50;
        const x0 = 150 + (t * 50) % (CANVAS_WIDTH - 300);
        const envelope = Math.exp(-((x - x0) ** 2) / (2 * sigma ** 2));
        
        real = amplitude * envelope * Math.cos(k * x - omega * t);
        imaginary = amplitude * envelope * Math.sin(k * x - omega * t);
      }
      
      const probability = real ** 2 + imaginary ** 2;
      newWaveFunction.push({ x, real, imaginary, probability });
    }
    
    setWaveFunction(newWaveFunction);
  };

  const drawWaveFunction = (ctx: CanvasRenderingContext2D) => {
    if (!showWaveFunction || waveFunction.length === 0) return;

    const centerY = CANVAS_HEIGHT / 2;
    const scale = 100;
    
    // Draw real part (blue)
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    waveFunction.forEach((point, index) => {
      const y = centerY - point.real * scale;
      if (index === 0) {
        ctx.moveTo(point.x, y);
      } else {
        ctx.lineTo(point.x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw imaginary part (red)
    ctx.strokeStyle = 'rgba(244, 67, 54, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    waveFunction.forEach((point, index) => {
      const y = centerY - point.imaginary * scale;
      if (index === 0) {
        ctx.moveTo(point.x, y);
      } else {
        ctx.lineTo(point.x, y);
      }
    });
    
    ctx.stroke();
  };

  const drawProbabilityDensity = (ctx: CanvasRenderingContext2D) => {
    if (!showProbabilityDensity || waveFunction.length === 0) return;

    const centerY = CANVAS_HEIGHT / 2;
    const scale = 200;
    
    ctx.fillStyle = 'rgba(255, 235, 59, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    waveFunction.forEach(point => {
      const y = centerY - point.probability * scale;
      ctx.lineTo(point.x, y);
    });
    
    ctx.lineTo(CANVAS_WIDTH, centerY);
    ctx.closePath();
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = 'rgba(255, 235, 59, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    waveFunction.forEach((point, index) => {
      const y = centerY - point.probability * scale;
      if (index === 0) {
        ctx.moveTo(point.x, y);
      } else {
        ctx.lineTo(point.x, y);
      }
    });
    
    ctx.stroke();
  };

  const drawPhotons = (ctx: CanvasRenderingContext2D) => {
    photons.forEach(photon => {
      if (photon.detected && photon.intensity === 0) return;
      
      const wavelengthColor = getWavelengthColor(photon.wavelength);
      const alpha = photon.intensity;
      
      ctx.fillStyle = `rgba(${getRGBFromColor(wavelengthColor)}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(photon.x, photon.y, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw wave representation
      if (showWaveFunction) {
        ctx.strokeStyle = `rgba(${getRGBFromColor(wavelengthColor)}, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        
        for (let i = -20; i <= 20; i += 2) {
          const waveX = photon.x + i;
          const waveY = photon.y + 5 * Math.sin((2 * Math.PI * waveX) / photon.wavelength * 10);
          
          if (i === -20) {
            ctx.beginPath();
            ctx.moveTo(waveX, waveY);
          } else {
            ctx.lineTo(waveX, waveY);
          }
        }
        
        ctx.stroke();
      }
    });
  };

  const drawDoubleSlitApparatus = (ctx: CanvasRenderingContext2D) => {
    if (currentTab !== 0) return;

    const slitX = 200;
    const slitWidth = 20;
    const wallWidth = 10;
    
    // Draw wall with slits
    ctx.fillStyle = '#666666';
    ctx.fillRect(slitX, 0, wallWidth, CANVAS_HEIGHT);
    
    // Draw slits (cut out from wall)
    const slit1Y = CANVAS_HEIGHT / 2 - slitSeparation / 2;
    const slit2Y = CANVAS_HEIGHT / 2 + slitSeparation / 2;
    
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(slitX, slit1Y - slitWidth/2, wallWidth, slitWidth);
    ctx.fillRect(slitX, slit2Y - slitWidth/2, wallWidth, slitWidth);
    
    // Draw detection screen
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(detectorPosition, 0, 5, CANVAS_HEIGHT);
  };

  const drawTunnelingBarrier = (ctx: CanvasRenderingContext2D) => {
    if (currentTab !== 1) return;

    const barrierStart = 300;
    const barrierEnd = barrierStart + barrierWidth;
    const barrierHeightPx = barrierHeight * 50;
    
    // Draw potential barrier
    ctx.fillStyle = 'rgba(244, 67, 54, 0.3)';
    ctx.fillRect(barrierStart, CANVAS_HEIGHT/2 - barrierHeightPx/2, 
                barrierWidth, barrierHeightPx);
    
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 2;
    ctx.strokeRect(barrierStart, CANVAS_HEIGHT/2 - barrierHeightPx/2, 
                  barrierWidth, barrierHeightPx);
    
    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Potential Barrier', barrierStart + barrierWidth/2, CANVAS_HEIGHT/2 + barrierHeightPx/2 + 20);
  };

  const drawQuantumStates = (ctx: CanvasRenderingContext2D) => {
    if (currentTab !== 2) return;

    const startX = 50;
    const startY = 100;
    const stateWidth = 150;
    const stateHeight = 60;
    
    quantumStates.forEach((state, index) => {
      const x = startX;
      const y = startY + index * (stateHeight + 20);
      
      // State box
      ctx.fillStyle = `rgba(156, 39, 176, ${state.probability})`;
      ctx.fillRect(x, y, stateWidth * state.amplitude, stateHeight);
      
      ctx.strokeStyle = '#9c27b0';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, stateWidth, stateHeight);
      
      // State label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`|${index + 1}⟩: ${(state.probability * 100).toFixed(1)}%`, x + 5, y + 20);
      ctx.fillText(`E${index + 1} = ${state.energy.toFixed(2)}`, x + 5, y + 35);
      ctx.fillText(`φ = ${state.phase.toFixed(2)}`, x + 5, y + 50);
    });
  };

  const drawUncertaintyVisualization = (ctx: CanvasRenderingContext2D) => {
    if (currentTab !== 3) return;

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    // Position uncertainty
    const deltaX = waveLength / 4;
    const deltaP = PLANCK_CONSTANT / (4 * Math.PI * deltaX);
    
    ctx.fillStyle = 'rgba(255, 152, 0, 0.3)';
    ctx.fillRect(centerX - deltaX, centerY - 50, deltaX * 2, 100);
    
    ctx.strokeStyle = '#ff9800';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - deltaX, centerY - 50, deltaX * 2, 100);
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Position Uncertainty', centerX, centerY - 60);
    ctx.fillText(`Δx ≈ ${deltaX.toFixed(1)}`, centerX, centerY + 70);
    ctx.fillText(`Δp ≈ ${deltaP.toExponential(2)}`, centerX, centerY + 90);
    ctx.fillText('Δx · Δp ≥ ℏ/2', centerX, centerY + 110);
  };

  const drawPhysicsInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(10, 10, 300, 120);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Quantum Physics Lab', 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Wavelength: ${waveLength.toFixed(1)} units`, 20, 50);
    ctx.fillText(`Frequency: ${frequency.toFixed(2)} Hz`, 20, 65);
    ctx.fillText(`Amplitude: ${amplitude.toFixed(2)}`, 20, 80);
    
    if (currentTab === 0) {
      ctx.fillText(`Photons detected: ${detectionCount}`, 20, 95);
      ctx.fillText(`Active photons: ${photons.filter(p => !p.detected).length}`, 20, 110);
    } else if (currentTab === 1) {
      const transmission = Math.exp(-Math.sqrt(2 * barrierHeight) * barrierWidth / 10);
      ctx.fillText(`Transmission: ${(transmission * 100).toFixed(1)}%`, 20, 95);
      ctx.fillText(`Barrier height: ${barrierHeight.toFixed(1)}`, 20, 110);
    }
  };

  const getWavelengthColor = (wavelength: number): string => {
    if (wavelength < 440) return '#8b00ff'; // Violet
    if (wavelength < 490) return '#0000ff'; // Blue
    if (wavelength < 510) return '#00ffff'; // Cyan
    if (wavelength < 580) return '#00ff00'; // Green
    if (wavelength < 645) return '#ffff00'; // Yellow
    return '#ff0000'; // Red
  };

  const getRGBFromColor = (color: string): string => {
    // Simple color to RGB conversion for alpha blending
    const colors: {[key: string]: string} = {
      '#8b00ff': '139, 0, 255',
      '#0000ff': '0, 0, 255',
      '#00ffff': '0, 255, 255',
      '#00ff00': '0, 255, 0',
      '#ffff00': '255, 255, 0',
      '#ff0000': '255, 0, 0'
    };
    return colors[color] || '255, 255, 255';
  };

  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw based on current tab
    switch (currentTab) {
      case 0: // Wave-Particle Duality
        drawDoubleSlitApparatus(ctx);
        drawPhotons(ctx);
        if (showInterferencePattern) {
          drawProbabilityDensity(ctx);
        }
        break;
      case 1: // Quantum Tunneling
        drawTunnelingBarrier(ctx);
        drawWaveFunction(ctx);
        drawProbabilityDensity(ctx);
        break;
      case 2: // Superposition
        drawQuantumStates(ctx);
        drawWaveFunction(ctx);
        break;
      case 3: // Uncertainty Principle
        drawUncertaintyVisualization(ctx);
        drawWaveFunction(ctx);
        drawProbabilityDensity(ctx);
        break;
    }

    // Draw physics info
    drawPhysicsInfo(ctx);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setExperiments(prev => prev + 1);
      setScore(prev => prev + 25);
    }
  };

  const resetExperiment = () => {
    setPhotons([]);
    setMeasurementCount(0);
    setDetectionCount(0);
    setIsRunning(false);
    initializeWaveFunction();
    initializeQuantumStates();
  };

  const measureQuantumState = () => {
    // Simulate quantum measurement collapse
    const totalProb = quantumStates.reduce((sum, state) => sum + state.probability, 0);
    const random = Math.random() * totalProb;
    let cumulative = 0;
    
    const collapsedStates = quantumStates.map((state, index) => {
      cumulative += state.probability;
      if (random <= cumulative && state.probability > 0) {
        return { ...state, amplitude: 1, probability: 1 };
      } else {
        return { ...state, amplitude: 0, probability: 0 };
      }
    });
    
    setQuantumStates(collapsedStates);
    setMeasurementCount(prev => prev + 1);
    setScore(prev => prev + 15);
  };

  useEffect(() => {
    initializeWaveFunction();
    initializeQuantumStates();
  }, []);

  useEffect(() => {
    updateVisualization();
  }, [currentTab, waveFunction, photons, quantumStates, showWaveFunction, showProbabilityDensity, showInterferencePattern]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        updateWaveFunction();
        updatePhotons();
        if (currentTab === 0 && Math.random() < 0.1) {
          generatePhotons();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, currentTab, waveLength, frequency, amplitude, animationSpeed, barrierHeight, barrierWidth, slitSeparation]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.05) 0%, rgba(63, 81, 181, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #673ab7, #3f51b5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        🔬 Quantum Physics Lab
      </Typography>

      <Grid container spacing={3}>
        {/* Experiment Tabs */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(103, 58, 183, 0.15) 0%, rgba(63, 81, 181, 0.05) 100%)',
            border: '1px solid rgba(103, 58, 183, 0.3)',
          }}>
            <CardContent>
              <Tabs 
                value={currentTab} 
                onChange={(_, newValue) => setCurrentTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2 }}
              >
                {tabLabels.map((label, index) => (
                  <Tab key={index} label={label} />
                ))}
              </Tabs>

              {/* Tab-specific controls */}
              {currentTab === 0 && (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" gutterBottom>Slit Separation: {slitSeparation}px</Typography>
                    <Slider
                      value={slitSeparation}
                      onChange={(_, value) => setSlitSeparation(value as number)}
                      min={50}
                      max={200}
                      step={10}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" gutterBottom>Detector Position: {detectorPosition}px</Typography>
                    <Slider
                      value={detectorPosition}
                      onChange={(_, value) => setDetectorPosition(value as number)}
                      min={300}
                      max={500}
                      step={10}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showInterferencePattern}
                          onChange={(e) => setShowInterferencePattern(e.target.checked)}
                        />
                      }
                      label="Interference Pattern"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">Detected: {detectionCount}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(100, (detectionCount / 100) * 100)} 
                    />
                  </Grid>
                </Grid>
              )}

              {currentTab === 1 && (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" gutterBottom>Barrier Height: {barrierHeight.toFixed(1)}</Typography>
                    <Slider
                      value={barrierHeight}
                      onChange={(_, value) => setBarrierHeight(value as number)}
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" gutterBottom>Barrier Width: {barrierWidth}px</Typography>
                    <Slider
                      value={barrierWidth}
                      onChange={(_, value) => setBarrierWidth(value as number)}
                      min={20}
                      max={100}
                      step={5}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2">Transmission Probability</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.exp(-Math.sqrt(2 * barrierHeight) * barrierWidth / 10) * 100} 
                    />
                  </Grid>
                </Grid>
              )}

              {currentTab === 2 && (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      onClick={measureQuantumState}
                      sx={{
                        background: 'linear-gradient(45deg, #9c27b0, #673ab7)',
                        fontWeight: 'bold',
                      }}
                    >
                      📏 Measure State
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">Measurements: {measurementCount}</Typography>
                  </Grid>
                </Grid>
              )}

              <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Wavelength: {waveLength}</Typography>
                  <Slider
                    value={waveLength}
                    onChange={(_, value) => setWaveLength(value as number)}
                    min={20}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Amplitude: {amplitude.toFixed(2)}</Typography>
                  <Slider
                    value={amplitude}
                    onChange={(_, value) => setAmplitude(value as number)}
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Frequency: {frequency.toFixed(2)} Hz</Typography>
                  <Slider
                    value={frequency}
                    onChange={(_, value) => setFrequency(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Animation Speed: {animationSpeed.toFixed(1)}x</Typography>
                  <Slider
                    value={animationSpeed}
                    onChange={(_, value) => setAnimationSpeed(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    valueLabelDisplay="auto"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showWaveFunction}
                      onChange={(e) => setShowWaveFunction(e.target.checked)}
                    />
                  }
                  label="Wave Function"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showProbabilityDensity}
                      onChange={(e) => setShowProbabilityDensity(e.target.checked)}
                    />
                  }
                  label="Probability Density"
                />

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<Psychology />} 
                    label={`Score: ${score}`} 
                    color="primary" 
                    size="small"
                  />
                  <Chip 
                    label={`Experiments: ${experiments}`} 
                    color="success" 
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <Pause /> : <PlayArrow />}
                  onClick={toggleSimulation}
                  sx={{
                    background: isRunning ? 
                      'linear-gradient(45deg, #f44336, #ff9800)' :
                      'linear-gradient(45deg, #4caf50, #8bc34a)',
                    fontWeight: 'bold',
                  }}
                >
                  {isRunning ? '⏸️ Pause' : '▶️ Start'} Quantum Simulation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetExperiment}
                  sx={{ borderColor: '#673ab7', color: '#673ab7' }}
                >
                  🔄 Reset Experiment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={() => setShowHelp(true)}
                  sx={{ borderColor: '#673ab7', color: '#673ab7' }}
                >
                  ❓ Help
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(103, 58, 183, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                border: '1px solid rgba(103, 58, 183, 0.3)',
                borderRadius: '8px',
                width: '100%',
                height: 'auto',
                maxWidth: `${CANVAS_WIDTH}px`,
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md">
        <DialogTitle>🔬 Quantum Physics Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore the fascinating world of quantum mechanics through interactive experiments!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Experiments:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌊➕🔵 <strong>Wave-Particle Duality:</strong> Double-slit experiment showing light's dual nature</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🧱➡️ <strong>Quantum Tunneling:</strong> Particles passing through energy barriers</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡➕⚡ <strong>Superposition:</strong> Quantum states existing in multiple states simultaneously</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>❓📏 <strong>Uncertainty Principle:</strong> Fundamental limit on simultaneous measurements</Typography>
          
          <Typography variant="h6" gutterBottom>Key Concepts:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌊 <strong>Wave Function:</strong> Mathematical description of quantum state</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>📊 <strong>Probability Density:</strong> |ψ|² gives likelihood of finding particle</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🎯 <strong>Measurement:</strong> Causes wave function collapse to definite state</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🔄 <strong>Quantum Effects:</strong> Interference, tunneling, entanglement</Typography>
          
          <Typography variant="h6" gutterBottom>Visualization:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔵 <strong>Blue curve:</strong> Real part of wave function</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔴 <strong>Red curve:</strong> Imaginary part of wave function</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🟡 <strong>Yellow area:</strong> Probability density |ψ|²</Typography>
          
          <Alert severity="success">
            Switch between experiments to explore different quantum phenomena!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};