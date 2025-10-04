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
  TextField,
} from '@mui/material';
import { 
  Lightbulb, 
  Visibility, 
  Settings,
  Refresh,
  Psychology,
  Info,
  Camera
} from '@mui/icons-material';

interface OpticalElement {
  id: string;
  type: 'mirror' | 'lens' | 'prism' | 'screen' | 'light-source';
  x: number;
  y: number;
  angle: number;
  focalLength?: number;
  refractiveIndex?: number;
  size: number;
}

interface LightRay {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  angle: number;
  intensity: number;
  wavelength: number; // for color
  bounces: number;
}

export const OpticsLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [opticalElements, setOpticalElements] = useState<OpticalElement[]>([]);
  const [lightRays, setLightRays] = useState<LightRay[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('light-source');
  const [lightAngle, setLightAngle] = useState(0);
  const [lightIntensity, setLightIntensity] = useState(100);
  const [wavelength, setWavelength] = useState(550); // Green light
  const [showWavePattern, setShowWavePattern] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [refractiveIndex, setRefractiveIndex] = useState(1.5);
  const [focalLength, setFocalLength] = useState(100);
  const [score, setScore] = useState(0);
  const [experiments, setExperiments] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;
  const MAX_BOUNCES = 10;

  const elementTypes = [
    { type: 'light-source', name: '💡 Light Source', color: '#ffeb3b' },
    { type: 'mirror', name: '🪞 Mirror', color: '#e0e0e0' },
    { type: 'lens', name: '🔍 Lens', color: '#2196f3' },
    { type: 'prism', name: '🔺 Prism', color: '#9c27b0' },
    { type: 'screen', name: '📺 Screen', color: '#4caf50' },
  ];

  const getWavelengthColor = (wl: number): string => {
    // Convert wavelength to RGB color
    if (wl >= 380 && wl < 440) return '#8b00ff'; // Violet
    if (wl >= 440 && wl < 490) return '#0000ff'; // Blue
    if (wl >= 490 && wl < 510) return '#00ffff'; // Cyan
    if (wl >= 510 && wl < 580) return '#00ff00'; // Green
    if (wl >= 580 && wl < 645) return '#ffff00'; // Yellow
    if (wl >= 645 && wl < 750) return '#ff0000'; // Red
    return '#ffffff'; // White light
  };

  const calculateRefraction = (incidentAngle: number, n1: number, n2: number): number => {
    // Snell's law: n1 * sin(θ1) = n2 * sin(θ2)
    const sinTheta2 = (n1 / n2) * Math.sin(incidentAngle);
    if (Math.abs(sinTheta2) > 1) return -1; // Total internal reflection
    return Math.asin(sinTheta2);
  };

  const calculateReflection = (incidentAngle: number, normalAngle: number): number => {
    // Angle of reflection = angle of incidence
    return 2 * normalAngle - incidentAngle;
  };

  const drawOpticalElement = (ctx: CanvasRenderingContext2D, element: OpticalElement) => {
    const { x, y, type, angle, size, focalLength, refractiveIndex } = element;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle * Math.PI / 180);

    switch (type) {
      case 'light-source':
        // Draw light source with rays
        ctx.fillStyle = '#ffeb3b';
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Light rays emanating
        ctx.strokeStyle = getWavelengthColor(wavelength);
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const rayAngle = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(size * 2 * Math.cos(rayAngle), size * 2 * Math.sin(rayAngle));
          ctx.stroke();
        }
        break;

      case 'mirror':
        // Draw mirror surface
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(-size, -5, size * 2, 10);
        ctx.strokeStyle = '#9e9e9e';
        ctx.lineWidth = 2;
        ctx.strokeRect(-size, -5, size * 2, 10);

        // Mirror backing
        ctx.fillStyle = '#424242';
        ctx.fillRect(-size, -3, size * 2, 6);
        break;

      case 'lens':
        // Draw lens shape (biconvex)
        ctx.fillStyle = 'rgba(33, 150, 243, 0.3)';
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(-size/3, 0, size, Math.PI/6, -Math.PI/6);
        ctx.arc(size/3, 0, size, Math.PI - Math.PI/6, Math.PI + Math.PI/6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Focal points
        ctx.fillStyle = '#ff5722';
        ctx.beginPath();
        ctx.arc(focalLength || 100, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-(focalLength || 100), 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'prism':
        // Draw triangular prism
        ctx.fillStyle = 'rgba(156, 39, 176, 0.3)';
        ctx.strokeStyle = '#9c27b0';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(-size, size);
        ctx.lineTo(size, size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'screen':
        // Draw detection screen
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-10, -size, 20, size * 2);
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 3;
        ctx.strokeRect(-10, -size, 20, size * 2);

        // Screen grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = -size; i <= size; i += 20) {
          ctx.beginPath();
          ctx.moveTo(-10, i);
          ctx.lineTo(10, i);
          ctx.stroke();
        }
        break;
    }

    ctx.restore();

    // Draw element info
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type, x, y + size + 20);

    if (type === 'lens' && focalLength) {
      ctx.fillText(`f=${focalLength}mm`, x, y + size + 35);
    }
    if (type === 'prism' && refractiveIndex) {
      ctx.fillText(`n=${refractiveIndex}`, x, y + size + 35);
    }
  };

  const drawLightRay = (ctx: CanvasRenderingContext2D, ray: LightRay) => {
    const alpha = Math.max(0.1, ray.intensity / 100);
    const color = getWavelengthColor(ray.wavelength);
    
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(ray.startX, ray.startY);
    ctx.lineTo(ray.endX, ray.endY);
    ctx.stroke();

    // Draw wave pattern if enabled
    if (showWavePattern) {
      drawWavePattern(ctx, ray);
    }

    ctx.globalAlpha = 1;
  };

  const drawWavePattern = (ctx: CanvasRenderingContext2D, ray: LightRay) => {
    const distance = Math.sqrt((ray.endX - ray.startX) ** 2 + (ray.endY - ray.startY) ** 2);
    const wavelengthPixels = (ray.wavelength / 500) * 20; // Scale wavelength to pixels
    
    ctx.strokeStyle = getWavelengthColor(ray.wavelength);
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.6;

    for (let d = 0; d < distance; d += wavelengthPixels / 4) {
      const t = d / distance;
      const x = ray.startX + t * (ray.endX - ray.startX);
      const y = ray.startY + t * (ray.endY - ray.startY);
      
      const amplitude = 10 * Math.sin((2 * Math.PI * d) / wavelengthPixels + Date.now() / 200);
      const perpX = -(ray.endY - ray.startY) / distance * amplitude;
      const perpY = (ray.endX - ray.startX) / distance * amplitude;

      ctx.beginPath();
      ctx.arc(x + perpX, y + perpY, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  const traceRays = () => {
    const newRays: LightRay[] = [];
    const lightSources = opticalElements.filter(e => e.type === 'light-source');

    lightSources.forEach(source => {
      // Create initial rays from light source
      for (let angle = 0; angle < 360; angle += 15) {
        const ray: LightRay = {
          startX: source.x,
          startY: source.y,
          endX: source.x + 1000 * Math.cos((angle + lightAngle) * Math.PI / 180),
          endY: source.y + 1000 * Math.sin((angle + lightAngle) * Math.PI / 180),
          angle: angle + lightAngle,
          intensity: lightIntensity,
          wavelength: wavelength,
          bounces: 0
        };

        // Trace ray through optical elements
        const tracedRays = traceRayThroughElements(ray);
        newRays.push(...tracedRays);
      }
    });

    setLightRays(newRays);
  };

  const traceRayThroughElements = (ray: LightRay): LightRay[] => {
    const rays: LightRay[] = [];
    let currentRay = { ...ray };

    while (currentRay.bounces < MAX_BOUNCES && currentRay.intensity > 5) {
      const intersection = findNearestIntersection(currentRay);
      
      if (!intersection) {
        // Ray reaches edge of canvas
        currentRay.endX = Math.max(0, Math.min(CANVAS_WIDTH, currentRay.endX));
        currentRay.endY = Math.max(0, Math.min(CANVAS_HEIGHT, currentRay.endY));
        rays.push(currentRay);
        break;
      }

      // Update ray to intersection point
      currentRay.endX = intersection.x;
      currentRay.endY = intersection.y;
      rays.push({ ...currentRay });

      // Calculate new ray based on optical element
      const newRays = interactWithElement(currentRay, intersection.element, intersection.x, intersection.y);
      
      if (newRays.length === 0) break;
      
      currentRay = newRays[0]; // Continue with primary ray
      if (newRays.length > 1) {
        // Add additional rays (e.g., refraction + reflection)
        rays.push(...newRays.slice(1));
      }
    }

    return rays;
  };

  const findNearestIntersection = (ray: LightRay): { x: number; y: number; element: OpticalElement } | null => {
    let nearestDistance = Infinity;
    let nearestIntersection = null;

    opticalElements.forEach(element => {
      if (element.type === 'light-source') return;

      const intersection = calculateIntersection(ray, element);
      if (intersection) {
        const distance = Math.sqrt(
          (intersection.x - ray.startX) ** 2 + (intersection.y - ray.startY) ** 2
        );
        
        if (distance > 1 && distance < nearestDistance) {
          nearestDistance = distance;
          nearestIntersection = { ...intersection, element };
        }
      }
    });

    return nearestIntersection;
  };

  const calculateIntersection = (ray: LightRay, element: OpticalElement): { x: number; y: number } | null => {
    // Simplified intersection calculation
    const dx = ray.endX - ray.startX;
    const dy = ray.endY - ray.startY;
    const rayLength = Math.sqrt(dx * dx + dy * dy);
    
    // Check if ray passes near element
    const distToElement = Math.sqrt((element.x - ray.startX) ** 2 + (element.y - ray.startY) ** 2);
    
    if (distToElement < element.size + 20) {
      return { x: element.x, y: element.y };
    }
    
    return null;
  };

  const interactWithElement = (ray: LightRay, element: OpticalElement, x: number, y: number): LightRay[] => {
    const newRays: LightRay[] = [];

    switch (element.type) {
      case 'mirror':
        // Reflection
        const reflectedAngle = calculateReflection(ray.angle * Math.PI / 180, element.angle * Math.PI / 180);
        newRays.push({
          startX: x,
          startY: y,
          endX: x + 1000 * Math.cos(reflectedAngle),
          endY: y + 1000 * Math.sin(reflectedAngle),
          angle: reflectedAngle * 180 / Math.PI,
          intensity: ray.intensity * 0.9,
          wavelength: ray.wavelength,
          bounces: ray.bounces + 1
        });
        break;

      case 'lens':
        // Lens focusing/defocusing
        const focalPoint = element.focalLength || 100;
        const lensAngle = Math.atan2(y - element.y, x - element.x);
        
        newRays.push({
          startX: x,
          startY: y,
          endX: element.x + focalPoint * Math.cos(lensAngle),
          endY: element.y + focalPoint * Math.sin(lensAngle),
          angle: lensAngle * 180 / Math.PI,
          intensity: ray.intensity * 0.95,
          wavelength: ray.wavelength,
          bounces: ray.bounces + 1
        });
        break;

      case 'prism':
        // Dispersion and refraction
        const prismN = element.refractiveIndex || 1.5;
        const refractedAngle = calculateRefraction(ray.angle * Math.PI / 180, 1.0, prismN);
        
        if (refractedAngle !== -1) {
          // Create dispersed rays for different wavelengths
          const wavelengths = [480, 520, 560, 600, 640]; // Blue to red
          wavelengths.forEach((wl, index) => {
            const dispersionAngle = refractedAngle + (index - 2) * 0.1; // Spread colors
            newRays.push({
              startX: x,
              startY: y,
              endX: x + 1000 * Math.cos(dispersionAngle),
              endY: y + 1000 * Math.sin(dispersionAngle),
              angle: dispersionAngle * 180 / Math.PI,
              intensity: ray.intensity * 0.2,
              wavelength: wl,
              bounces: ray.bounces + 1
            });
          });
        }
        break;

      case 'screen':
        // Ray stops at screen
        break;
    }

    return newRays;
  };

  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    drawGrid(ctx);

    // Draw light rays
    lightRays.forEach(ray => {
      drawLightRay(ctx, ray);
    });

    // Draw optical elements
    opticalElements.forEach(element => {
      drawOpticalElement(ctx, element);
    });

    // Draw info panel
    drawInfoPanel(ctx);
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  };

  const drawInfoPanel = (ctx: CanvasRenderingContext2D) => {
    // Info panel background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 300, 120);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Optics Lab Analysis', 20, 30);

    ctx.font = '12px Arial';
    ctx.fillText(`Light Angle: ${lightAngle}°`, 20, 50);
    ctx.fillText(`Wavelength: ${wavelength}nm (${getColorName(wavelength)})`, 20, 65);
    ctx.fillText(`Intensity: ${lightIntensity}%`, 20, 80);
    ctx.fillText(`Refractive Index: ${refractiveIndex}`, 20, 95);
    ctx.fillText(`Active Rays: ${lightRays.length}`, 20, 110);

    // Color spectrum
    ctx.fillStyle = '#ffff00';
    ctx.font = '10px Arial';
    ctx.fillText('Spectrum: 🔴 🟠 🟡 🟢 🔵 🟣', 200, 125);
  };

  const getColorName = (wl: number): string => {
    if (wl >= 380 && wl < 440) return 'Violet';
    if (wl >= 440 && wl < 490) return 'Blue';
    if (wl >= 490 && wl < 510) return 'Cyan';
    if (wl >= 510 && wl < 580) return 'Green';
    if (wl >= 580 && wl < 645) return 'Yellow';
    if (wl >= 645 && wl < 750) return 'Red';
    return 'White';
  };

  const addOpticalElement = (type: string) => {
    const newElement: OpticalElement = {
      id: `element-${Date.now()}`,
      type: type as any,
      x: Math.random() * (CANVAS_WIDTH - 100) + 50,
      y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
      angle: 0,
      size: type === 'light-source' ? 20 : type === 'lens' ? 40 : type === 'prism' ? 50 : 60,
      focalLength: type === 'lens' ? focalLength : undefined,
      refractiveIndex: type === 'prism' ? refractiveIndex : undefined,
    };

    setOpticalElements(prev => [...prev, newElement]);
    setScore(prev => prev + 15);
    
    if (type !== 'light-source') {
      setExperiments(prev => prev + 1);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    addOpticalElement(selectedTool);
  };

  const clearLab = () => {
    setOpticalElements([]);
    setLightRays([]);
    setScore(0);
    setExperiments(0);
  };

  const runExperiment = () => {
    traceRays();
    setScore(prev => prev + 25);
  };

  useEffect(() => {
    updateVisualization();
  }, [opticalElements, lightRays, showWavePattern]);

  useEffect(() => {
    if (opticalElements.length > 0) {
      traceRays();
    }
  }, [opticalElements, lightAngle, lightIntensity, wavelength, refractiveIndex, focalLength]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (showWavePattern) {
        updateVisualization();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [showWavePattern]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.05) 0%, rgba(103, 58, 183, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #3f51b5, #673ab7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        🔬 Optics Laboratory
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.15) 0%, rgba(103, 58, 183, 0.05) 100%)',
            border: '1px solid rgba(63, 81, 181, 0.3)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lightbulb /> Optical Elements
              </Typography>
              
              <ButtonGroup variant="outlined" sx={{ mb: 2, flexWrap: 'wrap' }}>
                {elementTypes.map((element) => (
                  <Button
                    key={element.type}
                    variant={selectedTool === element.type ? "contained" : "outlined"}
                    onClick={() => setSelectedTool(element.type)}
                    sx={{
                      borderColor: element.color,
                      color: selectedTool === element.type ? '#fff' : element.color,
                      '&:hover': { backgroundColor: `${element.color}20` }
                    }}
                  >
                    {element.name}
                  </Button>
                ))}
              </ButtonGroup>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Light Angle: {lightAngle}°</Typography>
                  <Slider
                    value={lightAngle}
                    onChange={(_, value) => setLightAngle(value as number)}
                    min={-180}
                    max={180}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Wavelength: {wavelength}nm</Typography>
                  <Slider
                    value={wavelength}
                    onChange={(_, value) => setWavelength(value as number)}
                    min={380}
                    max={750}
                    step={10}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Intensity: {lightIntensity}%</Typography>
                  <Slider
                    value={lightIntensity}
                    onChange={(_, value) => setLightIntensity(value as number)}
                    min={10}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showWavePattern}
                          onChange={(e) => setShowWavePattern(e.target.checked)}
                        />
                      }
                      label="Wave Pattern"
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        icon={<Visibility />} 
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
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Camera />}
                  onClick={runExperiment}
                  sx={{
                    background: 'linear-gradient(45deg, #3f51b5, #673ab7)',
                    fontWeight: 'bold',
                  }}
                >
                  🔬 Run Experiment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={clearLab}
                  sx={{ borderColor: '#3f51b5', color: '#3f51b5' }}
                >
                  🗑️ Clear Lab
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={() => setShowHelp(true)}
                  sx={{ borderColor: '#3f51b5', color: '#3f51b5' }}
                >
                  ❓ Help
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Advanced Controls */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚙️ Advanced Settings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Refractive Index"
                    type="number"
                    value={refractiveIndex}
                    onChange={(e) => setRefractiveIndex(parseFloat(e.target.value) || 1.5)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 1.0, max: 3.0, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Focal Length (mm)"
                    type="number"
                    value={focalLength}
                    onChange={(e) => setFocalLength(parseFloat(e.target.value) || 100)}
                    size="small"
                    fullWidth
                    inputProps={{ min: 10, max: 500, step: 10 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Current Setup
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Light Color:</strong> {getColorName(wavelength)} ({wavelength}nm)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Elements:</strong> {opticalElements.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Active Rays:</strong> {lightRays.length}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                Click canvas to place selected optical elements!
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(63, 81, 181, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              style={{
                border: '1px solid rgba(63, 81, 181, 0.3)',
                borderRadius: '8px',
                width: '100%',
                height: 'auto',
                maxWidth: `${CANVAS_WIDTH}px`,
                cursor: 'crosshair',
                display: 'block',
                margin: '0 auto',
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md">
        <DialogTitle>🔬 Optics Lab Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore light behavior with interactive optical elements!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Optical Elements:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>💡 <strong>Light Source:</strong> Emits light rays at specified wavelength</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🪞 <strong>Mirror:</strong> Reflects light following law of reflection</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔍 <strong>Lens:</strong> Focuses or defocuses light rays</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔺 <strong>Prism:</strong> Disperses white light into spectrum</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>📺 <strong>Screen:</strong> Shows where light rays hit</Typography>
          
          <Typography variant="h6" gutterBottom>Physics Concepts:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌈 <strong>Dispersion:</strong> Separation of white light into colors</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔄 <strong>Reflection:</strong> Angle of incidence = angle of reflection</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>↗️ <strong>Refraction:</strong> Light bends when entering different materials</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🌊 <strong>Wave Nature:</strong> Light exhibits wave properties</Typography>
          
          <Alert severity="success">
            Experiment with different setups to understand light behavior!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};