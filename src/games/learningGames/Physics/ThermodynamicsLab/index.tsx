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
  LinearProgress,
} from '@mui/material';
import { 
  Thermostat, 
  Science, 
  LocalFireDepartment,
  AcUnit,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Info
} from '@mui/icons-material';

interface GasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  temperature: number;
}

interface HeatSource {
  x: number;
  y: number;
  temperature: number;
  active: boolean;
  type: 'heater' | 'cooler';
}

export const ThermodynamicsLab: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<GasParticle[]>([]);
  const [heatSources, setHeatSources] = useState<HeatSource[]>([]);
  const [temperature, setTemperature] = useState(300); // Kelvin
  const [pressure, setPressure] = useState(101325); // Pa
  const [volume, setVolume] = useState(1.0); // m³
  const [particleCount, setParticleCount] = useState(100);
  const [selectedTool, setSelectedTool] = useState<string>('heater');
  const [isRunning, setIsRunning] = useState(false);
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [showTemperatureMap, setShowTemperatureMap] = useState(false);
  const [gasType, setGasType] = useState('ideal');
  const [entropy, setEntropy] = useState(0);
  const [internalEnergy, setInternalEnergy] = useState(0);
  const [score, setScore] = useState(0);
  const [experiments, setExperiments] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const CONTAINER_MARGIN = 50;
  const BOLTZMANN_CONSTANT = 1.38e-23;
  const GAS_CONSTANT = 8.314;

  const toolTypes = [
    { type: 'heater', name: '🔥 Heater', color: '#ff5722' },
    { type: 'cooler', name: '❄️ Cooler', color: '#2196f3' },
  ];

  const initializeParticles = () => {
    const newParticles: GasParticle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Maxwell-Boltzmann velocity distribution
      const speed = Math.sqrt((3 * BOLTZMANN_CONSTANT * temperature) / (29e-3 / 6.022e23)); // For air
      const angle = Math.random() * 2 * Math.PI;
      
      const particle: GasParticle = {
        x: CONTAINER_MARGIN + Math.random() * (CANVAS_WIDTH - 2 * CONTAINER_MARGIN),
        y: CONTAINER_MARGIN + Math.random() * (CANVAS_HEIGHT - 2 * CONTAINER_MARGIN),
        vx: speed * Math.cos(angle) * 0.1, // Scaled for visualization
        vy: speed * Math.sin(angle) * 0.1,
        mass: 29e-3 / 6.022e23, // Approximate air molecule mass
        radius: 3,
        temperature: temperature + (Math.random() - 0.5) * 20,
      };
      
      newParticles.push(particle);
    }
    
    setParticles(newParticles);
  };

  const updateParticles = () => {
    if (!isRunning) return;

    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        let newParticle = { ...particle };
        
        // Update position
        newParticle.x += newParticle.vx;
        newParticle.y += newParticle.vy;
        
        // Boundary collisions with energy conservation
        if (newParticle.x <= CONTAINER_MARGIN + newParticle.radius || 
            newParticle.x >= CANVAS_WIDTH - CONTAINER_MARGIN - newParticle.radius) {
          newParticle.vx = -newParticle.vx * 0.98; // Slight energy loss
          newParticle.x = Math.max(CONTAINER_MARGIN + newParticle.radius, 
                                 Math.min(CANVAS_WIDTH - CONTAINER_MARGIN - newParticle.radius, newParticle.x));
        }
        
        if (newParticle.y <= CONTAINER_MARGIN + newParticle.radius || 
            newParticle.y >= CANVAS_HEIGHT - CONTAINER_MARGIN - newParticle.radius) {
          newParticle.vy = -newParticle.vy * 0.98;
          newParticle.y = Math.max(CONTAINER_MARGIN + newParticle.radius, 
                                 Math.min(CANVAS_HEIGHT - CONTAINER_MARGIN - newParticle.radius, newParticle.y));
        }
        
        // Heat source interactions
        heatSources.forEach(source => {
          if (!source.active) return;
          
          const dx = newParticle.x - source.x;
          const dy = newParticle.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 80) { // Heat influence radius
            const influence = Math.exp(-distance / 40); // Exponential decay
            
            if (source.type === 'heater') {
              const energyGain = influence * 0.02;
              newParticle.vx += (Math.random() - 0.5) * energyGain;
              newParticle.vy += (Math.random() - 0.5) * energyGain;
              newParticle.temperature += influence * 2;
            } else {
              const energyLoss = influence * 0.02;
              newParticle.vx *= (1 - energyLoss);
              newParticle.vy *= (1 - energyLoss);
              newParticle.temperature -= influence * 2;
            }
          }
        });
        
        // Particle-particle collisions (simplified)
        const collisionRadius = 20;
        prevParticles.forEach(otherParticle => {
          if (otherParticle === particle) return;
          
          const dx = newParticle.x - otherParticle.x;
          const dy = newParticle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < collisionRadius && distance > 0) {
            // Elastic collision (simplified)
            const collision_angle = Math.atan2(dy, dx);
            const speed1 = Math.sqrt(newParticle.vx ** 2 + newParticle.vy ** 2);
            const speed2 = Math.sqrt(otherParticle.vx ** 2 + otherParticle.vy ** 2);
            
            const direction1 = Math.atan2(newParticle.vy, newParticle.vx);
            const direction2 = Math.atan2(otherParticle.vy, otherParticle.vx);
            
            const new_xspeed_1 = speed1 * Math.cos(direction1 - collision_angle);
            const new_yspeed_1 = speed1 * Math.sin(direction1 - collision_angle);
            const new_xspeed_2 = speed2 * Math.cos(direction2 - collision_angle);
            const new_yspeed_2 = speed2 * Math.sin(direction2 - collision_angle);
            
            const final_xspeed_1 = ((newParticle.mass - otherParticle.mass) * new_xspeed_1 + 
                                   (otherParticle.mass + otherParticle.mass) * new_xspeed_2) / 
                                   (newParticle.mass + otherParticle.mass);
            
            newParticle.vx = Math.cos(collision_angle) * final_xspeed_1 + 
                           Math.cos(collision_angle + Math.PI/2) * new_yspeed_1;
            newParticle.vy = Math.sin(collision_angle) * final_xspeed_1 + 
                           Math.sin(collision_angle + Math.PI/2) * new_yspeed_1;
          }
        });
        
        // Temperature damping towards equilibrium
        newParticle.temperature += (temperature - newParticle.temperature) * 0.001;
        
        return newParticle;
      });
    });
  };

  const calculateThermodynamicProperties = () => {
    if (particles.length === 0) return;

    // Average temperature
    const avgTemp = particles.reduce((sum, p) => sum + p.temperature, 0) / particles.length;
    
    // Average kinetic energy
    const avgKineticEnergy = particles.reduce((sum, p) => {
      return sum + 0.5 * p.mass * (p.vx ** 2 + p.vy ** 2);
    }, 0) / particles.length;
    
    // Ideal gas law: PV = nRT
    const containerVolume = ((CANVAS_WIDTH - 2 * CONTAINER_MARGIN) * 
                           (CANVAS_HEIGHT - 2 * CONTAINER_MARGIN)) / 1e6; // Convert to m²
    const moles = particleCount / 6.022e23 * 1000; // Approximate moles
    const calculatedPressure = (moles * GAS_CONSTANT * avgTemp) / containerVolume;
    
    // Internal energy (for ideal gas: U = (3/2)nRT)
    const U = (3/2) * moles * GAS_CONSTANT * avgTemp;
    
    // Entropy (simplified)
    const S = moles * GAS_CONSTANT * Math.log(containerVolume) + 
             (3/2) * moles * GAS_CONSTANT * Math.log(avgTemp);

    setTemperature(avgTemp);
    setPressure(calculatedPressure);
    setInternalEnergy(U);
    setEntropy(S);
    setVolume(containerVolume);
  };

  const drawContainer = (ctx: CanvasRenderingContext2D) => {
    // Container walls
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(CONTAINER_MARGIN, CONTAINER_MARGIN, 
                  CANVAS_WIDTH - 2 * CONTAINER_MARGIN, 
                  CANVAS_HEIGHT - 2 * CONTAINER_MARGIN);

    // Temperature color mapping for walls
    if (showTemperatureMap) {
      const tempColor = getTemperatureColor(temperature);
      ctx.strokeStyle = tempColor;
      ctx.lineWidth = 8;
      ctx.strokeRect(CONTAINER_MARGIN - 4, CONTAINER_MARGIN - 4, 
                    CANVAS_WIDTH - 2 * CONTAINER_MARGIN + 8, 
                    CANVAS_HEIGHT - 2 * CONTAINER_MARGIN + 8);
    }
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.forEach(particle => {
      // Particle color based on temperature
      const tempColor = getTemperatureColor(particle.temperature);
      ctx.fillStyle = tempColor;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Velocity vectors
      if (showVelocityVectors) {
        ctx.strokeStyle = tempColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + particle.vx * 5, particle.y + particle.vy * 5);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(particle.vy, particle.vx);
        const arrowLength = 5;
        ctx.beginPath();
        ctx.moveTo(particle.x + particle.vx * 5, particle.y + particle.vy * 5);
        ctx.lineTo(particle.x + particle.vx * 5 - arrowLength * Math.cos(angle - Math.PI/6),
                  particle.y + particle.vy * 5 - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(particle.x + particle.vx * 5 - arrowLength * Math.cos(angle + Math.PI/6),
                  particle.y + particle.vy * 5 - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  const drawHeatSources = (ctx: CanvasRenderingContext2D) => {
    heatSources.forEach(source => {
      const radius = 30;
      
      // Heat source base
      ctx.fillStyle = source.active ? 
        (source.type === 'heater' ? '#ff5722' : '#2196f3') : 
        '#666666';
      
      ctx.beginPath();
      ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Heat effect visualization
      if (source.active) {
        const effectRadius = 80;
        const gradient = ctx.createRadialGradient(source.x, source.y, radius, 
                                                source.x, source.y, effectRadius);
        
        if (source.type === 'heater') {
          gradient.addColorStop(0, 'rgba(255, 87, 34, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 87, 34, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(33, 150, 243, 0.3)');
          gradient.addColorStop(1, 'rgba(33, 150, 243, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(source.x, source.y, effectRadius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Icon
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(source.type === 'heater' ? '🔥' : '❄️', source.x, source.y);
    });
  };

  const drawThermodynamicInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(10, 10, 350, 160);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 350, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Thermodynamic Properties', 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Temperature: ${temperature.toFixed(1)} K (${(temperature - 273.15).toFixed(1)} °C)`, 20, 50);
    ctx.fillText(`Pressure: ${(pressure / 1000).toFixed(2)} kPa`, 20, 65);
    ctx.fillText(`Volume: ${volume.toFixed(6)} m³`, 20, 80);
    ctx.fillText(`Internal Energy: ${internalEnergy.toFixed(2)} J`, 20, 95);
    ctx.fillText(`Entropy: ${entropy.toFixed(2)} J/K`, 20, 110);
    ctx.fillText(`Particles: ${particles.length}`, 20, 125);
    ctx.fillText(`Status: ${isRunning ? 'Running' : 'Paused'}`, 20, 140);
    
    ctx.fillText(`Ideal Gas Law: PV = nRT`, 20, 155);

    // Temperature scale
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px Arial';
    ctx.fillText('Temperature Scale:', 250, 50);
    
    const tempScale = [
      { temp: 200, color: '#0000ff', label: '200K' },
      { temp: 300, color: '#00ff00', label: '300K' },
      { temp: 400, color: '#ffff00', label: '400K' },
      { temp: 500, color: '#ff0000', label: '500K' }
    ];
    
    tempScale.forEach((scale, index) => {
      ctx.fillStyle = scale.color;
      ctx.fillRect(250, 60 + index * 15, 15, 10);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(scale.label, 270, 70 + index * 15);
    });
  };

  const getTemperatureColor = (temp: number): string => {
    // Color mapping for temperature visualization
    const normalizedTemp = Math.max(0, Math.min(1, (temp - 200) / 400)); // 200K to 600K range
    
    if (normalizedTemp < 0.25) {
      // Blue to cyan
      const t = normalizedTemp / 0.25;
      return `rgb(${Math.floor(t * 100)}, ${Math.floor(100 + t * 155)}, 255)`;
    } else if (normalizedTemp < 0.5) {
      // Cyan to green
      const t = (normalizedTemp - 0.25) / 0.25;
      return `rgb(${Math.floor(100 - t * 100)}, 255, ${Math.floor(255 - t * 255)})`;
    } else if (normalizedTemp < 0.75) {
      // Green to yellow
      const t = (normalizedTemp - 0.5) / 0.25;
      return `rgb(${Math.floor(t * 155)}, 255, 0)`;
    } else {
      // Yellow to red
      const t = (normalizedTemp - 0.75) / 0.25;
      return `rgb(255, ${Math.floor(255 - t * 155)}, 0)`;
    }
  };

  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw container
    drawContainer(ctx);

    // Draw particles
    drawParticles(ctx);

    // Draw heat sources
    drawHeatSources(ctx);

    // Draw info panel
    drawThermodynamicInfo(ctx);
  };

  const addHeatSource = (type: string) => {
    const newSource: HeatSource = {
      x: Math.random() * (CANVAS_WIDTH - 100) + 50,
      y: Math.random() * (CANVAS_HEIGHT - 100) + 50,
      temperature: type === 'heater' ? 500 : 200,
      active: true,
      type: type as 'heater' | 'cooler',
    };

    setHeatSources(prev => [...prev, newSource]);
    setScore(prev => prev + 10);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    addHeatSource(selectedTool);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setExperiments(prev => prev + 1);
      setScore(prev => prev + 25);
    }
  };

  const resetLab = () => {
    setParticles([]);
    setHeatSources([]);
    setIsRunning(false);
    setTemperature(300);
    setPressure(101325);
    setScore(0);
    setExperiments(0);
    initializeParticles();
  };

  const adjustTemperature = (delta: number) => {
    const newTemp = Math.max(50, Math.min(800, temperature + delta));
    setTemperature(newTemp);
    
    // Adjust particle velocities based on temperature
    setParticles(prev => prev.map(particle => {
      const speedFactor = Math.sqrt(newTemp / particle.temperature);
      return {
        ...particle,
        vx: particle.vx * speedFactor,
        vy: particle.vy * speedFactor,
        temperature: newTemp + (Math.random() - 0.5) * 20,
      };
    }));
  };

  useEffect(() => {
    initializeParticles();
  }, [particleCount]);

  useEffect(() => {
    updateVisualization();
    calculateThermodynamicProperties();
  }, [particles, heatSources, showVelocityVectors, showTemperatureMap, isRunning]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunning) {
        updateParticles();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, particles, heatSources, temperature]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.05) 0%, rgba(244, 67, 54, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #ff5722, #f44336)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        🌡️ Thermodynamics Laboratory
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.15) 0%, rgba(244, 67, 54, 0.05) 100%)',
            border: '1px solid rgba(255, 87, 34, 0.3)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Thermostat /> Heat Sources & Controls
              </Typography>
              
              <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
                {toolTypes.map((tool) => (
                  <Button
                    key={tool.type}
                    variant={selectedTool === tool.type ? "contained" : "outlined"}
                    onClick={() => setSelectedTool(tool.type)}
                    sx={{
                      borderColor: tool.color,
                      color: selectedTool === tool.type ? '#fff' : tool.color,
                      '&:hover': { backgroundColor: `${tool.color}20` }
                    }}
                  >
                    {tool.name}
                  </Button>
                ))}
              </ButtonGroup>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Particle Count: {particleCount}</Typography>
                  <Slider
                    value={particleCount}
                    onChange={(_, value) => setParticleCount(value as number)}
                    min={20}
                    max={200}
                    step={10}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Base Temperature: {temperature.toFixed(0)}K</Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={() => adjustTemperature(-50)}>-50K</Button>
                    <Button size="small" onClick={() => adjustTemperature(50)}>+50K</Button>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showVelocityVectors}
                        onChange={(e) => setShowVelocityVectors(e.target.checked)}
                      />
                    }
                    label="Velocity Vectors"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showTemperatureMap}
                        onChange={(e) => setShowTemperatureMap(e.target.checked)}
                      />
                    }
                    label="Temperature Map"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        icon={<Science />} 
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
                  startIcon={isRunning ? <Pause /> : <PlayArrow />}
                  onClick={toggleSimulation}
                  sx={{
                    background: isRunning ? 
                      'linear-gradient(45deg, #f44336, #ff9800)' :
                      'linear-gradient(45deg, #4caf50, #8bc34a)',
                    fontWeight: 'bold',
                  }}
                >
                  {isRunning ? '⏸️ Pause' : '▶️ Start'} Simulation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetLab}
                  sx={{ borderColor: '#ff5722', color: '#ff5722' }}
                >
                  🔄 Reset Lab
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={() => setShowHelp(true)}
                  sx={{ borderColor: '#ff5722', color: '#ff5722' }}
                >
                  ❓ Help
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* System Properties */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 System Properties
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Temperature:</strong> {temperature.toFixed(1)} K ({(temperature - 273.15).toFixed(1)} °C)
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(temperature - 200) / 400 * 100} 
                sx={{ mb: 2 }}
              />
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Pressure:</strong> {(pressure / 1000).toFixed(2)} kPa
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Volume:</strong> {volume.toFixed(6)} m³
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Internal Energy:</strong> {internalEnergy.toFixed(2)} J
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Entropy:</strong> {entropy.toFixed(2)} J/K
              </Typography>
              
              <Alert severity="info">
                PV = nRT (Ideal Gas Law)
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎮 Lab Status
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Particles:</strong> {particles.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Heat Sources:</strong> {heatSources.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong> {isRunning ? '🏃 Running' : '⏸️ Paused'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Gas Type:</strong> Ideal Gas
              </Typography>
              
              <Alert severity={isRunning ? "success" : "warning"}>
                {isRunning ? 
                  "🌡️ Simulation running! Observe particle behavior and heat transfer." :
                  "🎯 Click canvas to add heat sources, then start simulation!"
                }
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas */}
        <Grid item xs={12}>
          <Paper sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(255, 87, 34, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              style={{
                border: '1px solid rgba(255, 87, 34, 0.3)',
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
        <DialogTitle>🌡️ Thermodynamics Lab Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore thermodynamic properties through particle simulation!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Heat Sources:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔥 <strong>Heater:</strong> Increases particle kinetic energy and temperature</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>❄️ <strong>Cooler:</strong> Decreases particle kinetic energy and temperature</Typography>
          
          <Typography variant="h6" gutterBottom>Key Concepts:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌡️ <strong>Temperature:</strong> Average kinetic energy of particles</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>💨 <strong>Pressure:</strong> Force exerted by particle collisions with walls</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>📦 <strong>Volume:</strong> Space occupied by the gas</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡ <strong>Internal Energy:</strong> Total energy of all particles</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🔄 <strong>Entropy:</strong> Measure of disorder in the system</Typography>
          
          <Typography variant="h6" gutterBottom>Ideal Gas Law:</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>PV = nRT</strong> - Relates pressure, volume, amount, and temperature
          </Typography>
          
          <Alert severity="success">
            Experiment with different temperatures and heat sources to see thermodynamic principles in action!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};