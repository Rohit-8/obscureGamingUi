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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  ButtonGroup,
} from '@mui/material';
import { Lightbulb, Visibility, Science, PlayArrow, Stop, Refresh } from '@mui/icons-material';

interface LightRay {
  x: number;
  y: number;
  angle: number;
  intensity: number;
  wavelength: number;
  id: string;
}

interface OpticalElement {
  type: 'mirror' | 'lens' | 'prism' | 'glass';
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  refractiveIndex: number;
  id: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wavelength: number;
  intensity: number;
}

export const OpticsLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lightSource, setLightSource] = useState({ x: 100, y: 250, angle: 0, intensity: 100, wavelength: 550 });
  const [opticalElements, setOpticalElements] = useState<OpticalElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'mirror' | 'lens' | 'prism' | 'glass'>('mirror');
  const [isRunning, setIsRunning] = useState(true);
  const [showWaveView, setShowWaveView] = useState(false);
  const [lightRays, setLightRays] = useState<LightRay[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const animationFrameRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;

  const challenges = [
    { name: "Focus Light", description: "Use a convex lens to focus parallel rays to a point" },
    { name: "Total Internal Reflection", description: "Create total internal reflection in a prism" },
    { name: "Periscope", description: "Build a periscope using two mirrors" },
    { name: "Rainbow Creation", description: "Use a prism to separate white light into colors" },
  ];

  const wavelengthToColor = (wavelength: number): string => {
    if (wavelength < 400) return '#8B00FF'; // violet
    if (wavelength < 450) return '#4B0082'; // indigo
    if (wavelength < 495) return '#0000FF'; // blue
    if (wavelength < 570) return '#00FF00'; // green
    if (wavelength < 590) return '#FFFF00'; // yellow
    if (wavelength < 620) return '#FF7F00'; // orange
    if (wavelength < 750) return '#FF0000'; // red
    return '#FF69B4'; // infrared (pink)
  };

  const calculateRefraction = (incidentAngle: number, n1: number, n2: number): number => {
    const sinTheta1 = Math.sin(incidentAngle);
    const sinTheta2 = (n1 / n2) * sinTheta1;
    
    // Check for total internal reflection
    if (Math.abs(sinTheta2) > 1) {
      return incidentAngle + Math.PI; // Reflect
    }
    
    return Math.asin(sinTheta2);
  };

  const traceRay = (ray: LightRay): LightRay[] => {
    const rays: LightRay[] = [ray];
    let currentRay = { ...ray };
    
    for (let step = 0; step < 1000 && rays.length < 50; step++) {
      // Move ray forward
      const stepSize = 2;
      const newX = currentRay.x + Math.cos(currentRay.angle) * stepSize;
      const newY = currentRay.y + Math.sin(currentRay.angle) * stepSize;
      
      // Check boundaries
      if (newX < 0 || newX > CANVAS_WIDTH || newY < 0 || newY > CANVAS_HEIGHT) {
        break;
      }
      
      // Check intersections with optical elements
      let intersected = false;
      
      for (const element of opticalElements) {
        if (newX >= element.x && newX <= element.x + element.width &&
            newY >= element.y && newY <= element.y + element.height) {
          
          intersected = true;
          
          // Calculate interaction based on element type
          if (element.type === 'mirror') {
            // Perfect reflection
            const surfaceNormal = element.angle + Math.PI / 2;
            const incidentAngle = currentRay.angle - surfaceNormal;
            const reflectedAngle = surfaceNormal - incidentAngle;
            
            currentRay = {
              x: newX,
              y: newY,
              angle: reflectedAngle,
              intensity: currentRay.intensity * 0.95,
              wavelength: currentRay.wavelength,
              id: `reflected-${step}`
            };
          } else if (element.type === 'lens') {
            // Lens refraction (simplified)
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;
            const distanceFromCenter = Math.sqrt((newX - centerX) ** 2 + (newY - centerY) ** 2);
            const lensStrength = 0.01;
            
            const deflection = lensStrength * distanceFromCenter * (newY < centerY ? -1 : 1);
            currentRay = {
              x: newX,
              y: newY,
              angle: currentRay.angle + deflection,
              intensity: currentRay.intensity * 0.9,
              wavelength: currentRay.wavelength,
              id: `refracted-${step}`
            };
          } else if (element.type === 'prism') {
            // Prism refraction with dispersion
            const n1 = 1.0; // air
            const n2 = element.refractiveIndex + (currentRay.wavelength - 550) * 0.00001; // dispersion
            
            const surfaceAngle = Math.atan2(newY - element.y, newX - element.x);
            const incidentAngle = currentRay.angle - surfaceAngle;
            const refractedAngle = calculateRefraction(incidentAngle, n1, n2);
            
            currentRay = {
              x: newX,
              y: newY,
              angle: surfaceAngle + refractedAngle,
              intensity: currentRay.intensity * 0.85,
              wavelength: currentRay.wavelength,
              id: `dispersed-${step}`
            };
          } else if (element.type === 'glass') {
            // Glass block refraction
            const n1 = 1.0;
            const n2 = element.refractiveIndex;
            
            const refractedAngle = calculateRefraction(currentRay.angle, n1, n2);
            currentRay = {
              x: newX,
              y: newY,
              angle: refractedAngle,
              intensity: currentRay.intensity * 0.92,
              wavelength: currentRay.wavelength,
              id: `glass-${step}`
            };
          }
          
          rays.push({ ...currentRay });
          break;
        }
      }
      
      if (!intersected) {
        currentRay.x = newX;
        currentRay.y = newY;
      }
      
      // Add point to ray path
      if (step % 5 === 0) {
        rays.push({ ...currentRay });
      }
    }
    
    return rays;
  };

  const generateLightRays = () => {
    const rays: LightRay[] = [];
    
    if (showWaveView) {
      // Generate multiple rays for wave visualization
      for (let i = -2; i <= 2; i++) {
        const ray: LightRay = {
          x: lightSource.x,
          y: lightSource.y + i * 10,
          angle: lightSource.angle,
          intensity: lightSource.intensity,
          wavelength: lightSource.wavelength,
          id: `wave-${i}`
        };
        rays.push(...traceRay(ray));
      }
    } else {
      // Single ray
      const ray: LightRay = {
        x: lightSource.x,
        y: lightSource.y,
        angle: lightSource.angle,
        intensity: lightSource.intensity,
        wavelength: lightSource.wavelength,
        id: 'main-ray'
      };
      rays.push(...traceRay(ray));
    }
    
    return rays;
  };

  const updateSimulation = () => {
    if (!isRunning) return;
    
    const newRays = generateLightRays();
    setLightRays(newRays);
    
    // Update particles for wave view
    if (showWaveView) {
      setParticles(prev => {
        const newParticles = [...prev];
        
        // Add new particles
        if (Math.random() < 0.3) {
          newParticles.push({
            x: lightSource.x,
            y: lightSource.y + (Math.random() - 0.5) * 20,
            vx: Math.cos(lightSource.angle) * 3,
            vy: Math.sin(lightSource.angle) * 3,
            wavelength: lightSource.wavelength,
            intensity: lightSource.intensity
          });
        }
        
        // Update existing particles
        return newParticles
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            intensity: p.intensity * 0.99
          }))
          .filter(p => p.x > 0 && p.x < CANVAS_WIDTH && p.y > 0 && p.y < CANVAS_HEIGHT && p.intensity > 1);
      });
    }
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < CANVAS_WIDTH; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Draw optical elements
    opticalElements.forEach(element => {
      ctx.save();
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate(element.angle);
      
      switch (element.type) {
        case 'mirror':
          ctx.fillStyle = 'rgba(192, 192, 192, 0.8)';
          ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height);
          break;
          
        case 'lens':
          ctx.fillStyle = 'rgba(135, 206, 235, 0.6)';
          ctx.beginPath();
          ctx.ellipse(0, 0, element.width / 2, element.height / 2, 0, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#87CEEB';
          ctx.lineWidth = 3;
          ctx.stroke();
          break;
          
        case 'prism':
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.moveTo(-element.width / 2, element.height / 2);
          ctx.lineTo(element.width / 2, element.height / 2);
          ctx.lineTo(0, -element.height / 2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case 'glass':
          ctx.fillStyle = 'rgba(135, 206, 235, 0.4)';
          ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
          ctx.strokeStyle = '#87CEEB';
          ctx.lineWidth = 2;
          ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height);
          break;
      }
      
      ctx.restore();
      
      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(element.type.toUpperCase(), element.x + element.width / 2, element.y - 5);
    });
    
    // Draw light source
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(lightSource.x, lightSource.y, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw light direction indicator
    const dirX = lightSource.x + Math.cos(lightSource.angle) * 30;
    const dirY = lightSource.y + Math.sin(lightSource.angle) * 30;
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lightSource.x, lightSource.y);
    ctx.lineTo(dirX, dirY);
    ctx.stroke();
    
    // Draw arrowhead
    const headlen = 10;
    const angle = Math.atan2(dirY - lightSource.y, dirX - lightSource.x);
    ctx.beginPath();
    ctx.moveTo(dirX, dirY);
    ctx.lineTo(dirX - headlen * Math.cos(angle - Math.PI / 6), dirY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(dirX, dirY);
    ctx.lineTo(dirX - headlen * Math.cos(angle + Math.PI / 6), dirY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
    
    // Draw light rays
    if (showWaveView) {
      // Draw particles for wave view
      particles.forEach(particle => {
        const alpha = particle.intensity / lightSource.intensity;
        const color = wavelengthToColor(particle.wavelength);
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    } else {
      // Draw ray paths
      if (lightRays.length > 1) {
        const color = wavelengthToColor(lightSource.wavelength);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lightRays[0].x, lightRays[0].y);
        
        for (let i = 1; i < lightRays.length; i++) {
          ctx.lineTo(lightRays[i].x, lightRays[i].y);
        }
        ctx.stroke();
      }
    }
    
    // Draw info panel
    drawInfoPanel(ctx);
  };

  const drawInfoPanel = (ctx: CanvasRenderingContext2D) => {
    const panelX = 20;
    const panelY = 20;
    const panelWidth = 250;
    const panelHeight = 120;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
    
    // Title
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('🔬 Optics Lab', panelX + 10, panelY + 25);
    
    // Light source info
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Wavelength: ${lightSource.wavelength}nm`, panelX + 10, panelY + 45);
    ctx.fillText(`Intensity: ${lightSource.intensity}%`, panelX + 10, panelY + 60);
    ctx.fillText(`Angle: ${(lightSource.angle * 180 / Math.PI).toFixed(1)}°`, panelX + 10, panelY + 75);
    
    // Current challenge
    if (challenges[currentChallenge]) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 14px Arial';
      ctx.fillText('Challenge:', panelX + 10, panelY + 95);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Arial';
      ctx.fillText(challenges[currentChallenge].name, panelX + 75, panelY + 95);
      ctx.fillText(challenges[currentChallenge].description, panelX + 10, panelY + 110);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    // Add optical element at click position
    const newElement: OpticalElement = {
      type: selectedTool,
      x: x - 25,
      y: y - 25,
      width: selectedTool === 'lens' ? 50 : selectedTool === 'prism' ? 60 : 80,
      height: selectedTool === 'lens' ? 50 : selectedTool === 'prism' ? 60 : 10,
      angle: 0,
      refractiveIndex: selectedTool === 'prism' ? 1.5 : selectedTool === 'glass' ? 1.33 : 1.0,
      id: `element-${Date.now()}`
    };
    
    setOpticalElements(prev => [...prev, newElement]);
  };

  const clearElements = () => {
    setOpticalElements([]);
    setLightRays([]);
    setParticles([]);
  };

  const nextChallenge = () => {
    setCurrentChallenge(prev => (prev + 1) % challenges.length);
    clearElements();
  };

  const animate = () => {
    updateSimulation();
    drawScene();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, lightSource, opticalElements, showWaveView]);

  useEffect(() => {
    drawScene();
  }, []);

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
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" gutterBottom>Light Source</Typography>
                  <Typography variant="caption">Wavelength: {lightSource.wavelength}nm</Typography>
                  <Slider
                    value={lightSource.wavelength}
                    onChange={(_, value) => setLightSource(prev => ({ ...prev, wavelength: value as number }))}
                    min={400}
                    max={700}
                    step={10}
                    sx={{ 
                      color: wavelengthToColor(lightSource.wavelength),
                      '& .MuiSlider-thumb': {
                        backgroundColor: wavelengthToColor(lightSource.wavelength),
                      }
                    }}
                  />
                  <Typography variant="caption">Intensity: {lightSource.intensity}%</Typography>
                  <Slider
                    value={lightSource.intensity}
                    onChange={(_, value) => setLightSource(prev => ({ ...prev, intensity: value as number }))}
                    min={10}
                    max={100}
                    step={5}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" gutterBottom>Direction</Typography>
                  <Typography variant="caption">Angle: {(lightSource.angle * 180 / Math.PI).toFixed(1)}°</Typography>
                  <Slider
                    value={lightSource.angle * 180 / Math.PI}
                    onChange={(_, value) => setLightSource(prev => ({ ...prev, angle: (value as number) * Math.PI / 180 }))}
                    min={-180}
                    max={180}
                    step={5}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" gutterBottom>Tools</Typography>
                  <ButtonGroup size="small" sx={{ mb: 1 }}>
                    {(['mirror', 'lens', 'prism', 'glass'] as const).map((tool) => (
                      <Button
                        key={tool}
                        variant={selectedTool === tool ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTool(tool)}
                        sx={{ textTransform: 'capitalize' }}
                      >
                        {tool}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" gutterBottom>Controls</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant={isRunning ? "contained" : "outlined"}
                      startIcon={isRunning ? <Stop /> : <PlayArrow />}
                      onClick={() => setIsRunning(!isRunning)}
                      color={isRunning ? "error" : "success"}
                      size="small"
                    >
                      {isRunning ? 'Stop' : 'Start'}
                    </Button>
                    <Button
                      variant={showWaveView ? "contained" : "outlined"}
                      onClick={() => setShowWaveView(!showWaveView)}
                      size="small"
                    >
                      {showWaveView ? '📊 Ray View' : '🌊 Wave View'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas */}
        <Grid item xs={12} lg={8}>
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
                display: 'block',
                margin: '0 auto',
                cursor: 'crosshair',
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              Click to place {selectedTool} • Score: {score}
            </Typography>
          </Paper>
        </Grid>

        {/* Info Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Current Challenge
              </Typography>
              {challenges[currentChallenge] && (
                <>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {challenges[currentChallenge].name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {challenges[currentChallenge].description}
                  </Typography>
                </>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  onClick={nextChallenge}
                  sx={{
                    background: 'linear-gradient(45deg, #3f51b5, #673ab7)',
                    fontWeight: 'bold',
                  }}
                >
                  ⏭️ Next Challenge
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={clearElements}
                  sx={{ borderColor: '#3f51b5', color: '#3f51b5' }}
                >
                  🧹 Clear All
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌈 Light Properties
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 20, 
                    background: `linear-gradient(90deg, 
                      #8B00FF 0%, #4B0082 14%, #0000FF 28%, 
                      #00FF00 42%, #FFFF00 57%, #FF7F00 71%, #FF0000 85%, #FF69B4 100%)`,
                    borderRadius: 1,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${((lightSource.wavelength - 400) / 300) * 100}%`,
                      top: -5,
                      width: 2,
                      height: 30,
                      background: '#ffffff',
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Typography variant="caption">
                  Current: {lightSource.wavelength}nm ({
                    lightSource.wavelength < 450 ? 'Violet' :
                    lightSource.wavelength < 495 ? 'Blue' :
                    lightSource.wavelength < 570 ? 'Green' :
                    lightSource.wavelength < 590 ? 'Yellow' :
                    lightSource.wavelength < 620 ? 'Orange' : 'Red'
                  })
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Adjust wavelength to see different colors and dispersion effects!
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 Optics Guide
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🪞 <strong>Mirror:</strong> Perfect reflection
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🔍 <strong>Lens:</strong> Light focusing/diverging
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🔺 <strong>Prism:</strong> Light dispersion (rainbow)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                🟦 <strong>Glass:</strong> Refraction and bending
              </Typography>
              
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Tip: Use wave view to see light as particles!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};