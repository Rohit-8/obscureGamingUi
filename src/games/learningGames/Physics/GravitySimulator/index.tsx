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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Public, 
  Add,
  Remove,
  RadioButtonUnchecked,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Info,
  FlashOn,
  Rocket,
  Visibility,
  Timeline
} from '@mui/icons-material';

interface CelestialBody {
  id: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  color: string;
  trail: { x: number; y: number }[];
  fixed: boolean;
  type: 'star' | 'planet' | 'moon' | 'asteroid' | 'spacecraft';
}

interface GravityField {
  x: number;
  y: number;
  strength: number;
}

interface Orbit {
  body: string;
  semiMajorAxis: number;
  eccentricity: number;
  period: number;
  aphelion: number;
  perihelion: number;
}

export const GravitySimulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bodies, setBodies] = useState<CelestialBody[]>([]);
  const [gravityFields, setGravityFields] = useState<GravityField[]>([]);
  const [orbits, setOrbits] = useState<Orbit[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeStep, setTimeStep] = useState(0.01);
  const [gravitationalConstant, setGravitationalConstant] = useState(0.5);
  const [showTrails, setShowTrails] = useState(true);
  const [showGravityField, setShowGravityField] = useState(false);
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [showOrbitalPaths, setShowOrbitalPaths] = useState(false);
  const [selectedBody, setSelectedBody] = useState<string>('');
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);
  const [zoom, setZoom] = useState(1.0);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [presetSystem, setPresetSystem] = useState('solar');
  const [score, setScore] = useState(0);
  const [stableOrbits, setStableOrbits] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [dragState, setDragState] = useState<{ isDragging: boolean; bodyId: string; startX: number; startY: number }>({
    isDragging: false,
    bodyId: '',
    startX: 0,
    startY: 0
  });

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;
  const G = 6.67430e-11; // Real gravitational constant (scaled for simulation)
  const AU = 150; // Astronomical unit in pixels
  const MAX_TRAIL_LENGTH = 200;

  const presetSystems = {
    solar: 'Solar System',
    binary: 'Binary Stars',
    trojan: 'Trojan Asteroids',
    lagrange: 'Lagrange Points',
    custom: 'Custom System'
  };

  const createSolarSystem = () => {
    const newBodies: CelestialBody[] = [
      {
        id: 'sun',
        name: 'Sun',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 0,
        mass: 1000,
        radius: 20,
        color: '#ffeb3b',
        trail: [],
        fixed: true,
        type: 'star'
      },
      {
        id: 'mercury',
        name: 'Mercury',
        x: CANVAS_WIDTH / 2 + 80,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 2.5,
        mass: 1,
        radius: 4,
        color: '#8c7853',
        trail: [],
        fixed: false,
        type: 'planet'
      },
      {
        id: 'venus',
        name: 'Venus',
        x: CANVAS_WIDTH / 2 + 110,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 2.2,
        mass: 2,
        radius: 6,
        color: '#ffc649',
        trail: [],
        fixed: false,
        type: 'planet'
      },
      {
        id: 'earth',
        name: 'Earth',
        x: CANVAS_WIDTH / 2 + 150,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 2.0,
        mass: 3,
        radius: 8,
        color: '#4f94cd',
        trail: [],
        fixed: false,
        type: 'planet'
      },
      {
        id: 'mars',
        name: 'Mars',
        x: CANVAS_WIDTH / 2 + 200,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 1.8,
        mass: 1.5,
        radius: 6,
        color: '#cd5c5c',
        trail: [],
        fixed: false,
        type: 'planet'
      }
    ];
    
    setBodies(newBodies);
    setScore(prev => prev + 50);
  };

  const createBinarySystem = () => {
    const newBodies: CelestialBody[] = [
      {
        id: 'star1',
        name: 'Star A',
        x: CANVAS_WIDTH / 2 - 100,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 1.5,
        mass: 800,
        radius: 18,
        color: '#ff6b6b',
        trail: [],
        fixed: false,
        type: 'star'
      },
      {
        id: 'star2',
        name: 'Star B',
        x: CANVAS_WIDTH / 2 + 100,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: -1.5,
        mass: 600,
        radius: 15,
        color: '#4ecdc4',
        trail: [],
        fixed: false,
        type: 'star'
      },
      {
        id: 'planet',
        name: 'Circumbinary Planet',
        x: CANVAS_WIDTH / 2 + 250,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 1.2,
        mass: 5,
        radius: 8,
        color: '#95e1d3',
        trail: [],
        fixed: false,
        type: 'planet'
      }
    ];
    
    setBodies(newBodies);
    setScore(prev => prev + 75);
  };

  const createTrojanSystem = () => {
    const newBodies: CelestialBody[] = [
      {
        id: 'sun',
        name: 'Sun',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 0,
        mass: 1000,
        radius: 20,
        color: '#ffeb3b',
        trail: [],
        fixed: true,
        type: 'star'
      },
      {
        id: 'jupiter',
        name: 'Jupiter',
        x: CANVAS_WIDTH / 2 + 200,
        y: CANVAS_HEIGHT / 2,
        vx: 0,
        vy: 1.5,
        mass: 50,
        radius: 15,
        color: '#d2691e',
        trail: [],
        fixed: false,
        type: 'planet'
      },
      {
        id: 'trojan1',
        name: 'Trojan L4',
        x: CANVAS_WIDTH / 2 + 100,
        y: CANVAS_HEIGHT / 2 - 173,
        vx: 1.3,
        vy: 0.75,
        mass: 0.1,
        radius: 3,
        color: '#a0a0a0',
        trail: [],
        fixed: false,
        type: 'asteroid'
      },
      {
        id: 'trojan2',
        name: 'Trojan L5',
        x: CANVAS_WIDTH / 2 + 100,
        y: CANVAS_HEIGHT / 2 + 173,
        vx: -1.3,
        vy: 0.75,
        mass: 0.1,
        radius: 3,
        color: '#a0a0a0',
        trail: [],
        fixed: false,
        type: 'asteroid'
      }
    ];
    
    setBodies(newBodies);
    setScore(prev => prev + 100);
  };

  const addCelestialBody = (type: CelestialBody['type']) => {
    const mouseX = Math.random() * (CANVAS_WIDTH - 100) + 50;
    const mouseY = Math.random() * (CANVAS_HEIGHT - 100) + 50;
    
    const bodyConfigs = {
      star: { mass: 500, radius: 18, color: '#ffeb3b' },
      planet: { mass: 10, radius: 8, color: '#4f94cd' },
      moon: { mass: 1, radius: 4, color: '#c0c0c0' },
      asteroid: { mass: 0.1, radius: 2, color: '#a0a0a0' },
      spacecraft: { mass: 0.01, radius: 1, color: '#ffffff' }
    };
    
    const config = bodyConfigs[type];
    const newBody: CelestialBody = {
      id: `${type}-${Date.now()}`,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${bodies.length + 1}`,
      x: mouseX,
      y: mouseY,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      mass: config.mass,
      radius: config.radius,
      color: config.color,
      trail: [],
      fixed: type === 'star' && bodies.length === 0,
      type
    };
    
    setBodies(prev => [...prev, newBody]);
    setScore(prev => prev + 10);
  };

  const removeCelestialBody = () => {
    if (bodies.length > 0) {
      setBodies(prev => prev.slice(0, -1));
    }
  };

  const calculateGravitationalForce = (body1: CelestialBody, body2: CelestialBody) => {
    const dx = body2.x - body1.x;
    const dy = body2.y - body1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < body1.radius + body2.radius) {
      // Collision - merge bodies
      return { fx: 0, fy: 0, collision: true };
    }
    
    const force = (gravitationalConstant * body1.mass * body2.mass) / (distance * distance);
    const fx = force * (dx / distance);
    const fy = force * (dy / distance);
    
    return { fx, fy, collision: false };
  };

  const updateOrbitalElements = () => {
    const newOrbits: Orbit[] = [];
    
    bodies.forEach(body => {
      if (!body.fixed) {
        // Find the most massive nearby body (primary)
        let primary = bodies.find(b => b.fixed) || 
                     bodies.reduce((max, b) => b.mass > max.mass && b.id !== body.id ? b : max, bodies[0]);
        
        if (primary && primary.id !== body.id) {
          const dx = body.x - primary.x;
          const dy = body.y - primary.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate orbital velocity
          const vx = body.vx - primary.vx;
          const vy = body.vy - primary.vy;
          const velocity = Math.sqrt(vx * vx + vy * vy);
          
          // Calculate specific orbital energy
          const mu = gravitationalConstant * primary.mass;
          const specificEnergy = (velocity * velocity) / 2 - mu / distance;
          
          if (specificEnergy < 0) { // Bound orbit
            const semiMajorAxis = -mu / (2 * specificEnergy);
            const angularMomentum = Math.abs(dx * vy - dy * vx);
            const eccentricity = Math.sqrt(1 + (2 * specificEnergy * angularMomentum * angularMomentum) / (mu * mu));
            const period = 2 * Math.PI * Math.sqrt((semiMajorAxis ** 3) / mu);
            const aphelion = semiMajorAxis * (1 + eccentricity);
            const perihelion = semiMajorAxis * (1 - eccentricity);
            
            newOrbits.push({
              body: body.name,
              semiMajorAxis,
              eccentricity,
              period,
              aphelion,
              perihelion
            });
            
            // Check for stable orbit
            if (eccentricity < 0.3 && period > 10) {
              setStableOrbits(prev => prev + 1);
              setScore(prev => prev + 20);
            }
          }
        }
      }
    });
    
    setOrbits(newOrbits);
  };

  const updatePhysics = () => {
    if (!isRunning) return;

    setBodies(prevBodies => {
      const newBodies = prevBodies.map(body => ({ ...body }));
      
      // Calculate forces and update positions
      newBodies.forEach((body, i) => {
        if (body.fixed) return;
        
        let totalFx = 0;
        let totalFy = 0;
        
        newBodies.forEach((otherBody, j) => {
          if (i !== j) {
            const { fx, fy, collision } = calculateGravitationalForce(body, otherBody);
            
            if (collision) {
              // Merge bodies (simplified)
              const totalMass = body.mass + otherBody.mass;
              const newVx = (body.mass * body.vx + otherBody.mass * otherBody.vx) / totalMass;
              const newVy = (body.mass * body.vy + otherBody.mass * otherBody.vy) / totalMass;
              
              body.mass = totalMass;
              body.radius = Math.sqrt(body.radius * body.radius + otherBody.radius * otherBody.radius);
              body.vx = newVx;
              body.vy = newVy;
              
              // Mark other body for removal
              otherBody.mass = 0;
              setScore(prev => prev + 50);
            } else {
              totalFx += fx;
              totalFy += fy;
            }
          }
        });
        
        // Update velocity and position
        const ax = totalFx / body.mass;
        const ay = totalFy / body.mass;
        
        body.vx += ax * timeStep * simulationSpeed;
        body.vy += ay * timeStep * simulationSpeed;
        body.x += body.vx * timeStep * simulationSpeed;
        body.y += body.vy * timeStep * simulationSpeed;
        
        // Update trail
        if (showTrails) {
          body.trail.push({ x: body.x, y: body.y });
          if (body.trail.length > MAX_TRAIL_LENGTH) {
            body.trail.shift();
          }
        }
        
        // Keep bodies on screen (optional)
        if (body.x < 0 || body.x > CANVAS_WIDTH || body.y < 0 || body.y > CANVAS_HEIGHT) {
          // Reflect or wrap around
          if (body.x < 0 || body.x > CANVAS_WIDTH) body.vx *= -0.8;
          if (body.y < 0 || body.y > CANVAS_HEIGHT) body.vy *= -0.8;
          body.x = Math.max(body.radius, Math.min(CANVAS_WIDTH - body.radius, body.x));
          body.y = Math.max(body.radius, Math.min(CANVAS_HEIGHT - body.radius, body.y));
        }
      });
      
      // Remove merged bodies
      return newBodies.filter(body => body.mass > 0);
    });
  };

  const calculateGravityField = () => {
    const fields: GravityField[] = [];
    const gridSize = 40;
    
    for (let x = 0; x < CANVAS_WIDTH; x += gridSize) {
      for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
        let totalFx = 0;
        let totalFy = 0;
        
        bodies.forEach(body => {
          const dx = x - body.x;
          const dy = y - body.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > body.radius) {
            const force = (gravitationalConstant * body.mass) / (distance * distance);
            totalFx -= force * (dx / distance);
            totalFy -= force * (dy / distance);
          }
        });
        
        const strength = Math.sqrt(totalFx * totalFx + totalFy * totalFy);
        fields.push({ x, y, strength: Math.min(strength, 10) });
      }
    }
    
    setGravityFields(fields);
  };

  const drawCelestialBody = (ctx: CanvasRenderingContext2D, body: CelestialBody) => {
    // Draw body
    ctx.fillStyle = body.color;
    ctx.beginPath();
    ctx.arc(body.x, body.y, body.radius * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Add glow effect for stars
    if (body.type === 'star') {
      const gradient = ctx.createRadialGradient(
        body.x, body.y, 0,
        body.x, body.y, body.radius * zoom * 3
      );
      gradient.addColorStop(0, body.color + '40');
      gradient.addColorStop(1, body.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius * zoom * 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(body.name, body.x, body.y - body.radius * zoom - 5);

    // Draw selection indicator
    if (selectedBody === body.id) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(body.x, body.y, body.radius * zoom + 5, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawTrail = (ctx: CanvasRenderingContext2D, body: CelestialBody) => {
    if (!showTrails || body.trail.length < 2) return;

    ctx.strokeStyle = body.color + '80';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    body.trail.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    
    ctx.stroke();
  };

  const drawVelocityVector = (ctx: CanvasRenderingContext2D, body: CelestialBody) => {
    if (!showVelocityVectors) return;

    const scale = 20;
    const endX = body.x + body.vx * scale;
    const endY = body.y + body.vy * scale;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(body.x, body.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Arrow head
    const angle = Math.atan2(body.vy, body.vx);
    const arrowLength = 8;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const drawGravityField = (ctx: CanvasRenderingContext2D) => {
    if (!showGravityField) return;

    gravityFields.forEach(field => {
      const alpha = Math.min(field.strength / 5, 1);
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`;
      ctx.fillRect(field.x - 20, field.y - 20, 40, 40);
    });
  };

  const drawOrbitalPaths = (ctx: CanvasRenderingContext2D) => {
    if (!showOrbitalPaths) return;

    bodies.forEach(body => {
      if (!body.fixed) {
        const primary = bodies.find(b => b.fixed) || bodies[0];
        if (primary && primary.id !== body.id) {
          const dx = body.x - primary.x;
          const dy = body.y - primary.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Draw circular approximation of orbit
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.arc(primary.x, primary.y, distance, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    });
  };

  const drawSystemInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(10, 10, 300, 160);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Gravity Simulator', 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Bodies: ${bodies.length}`, 20, 50);
    ctx.fillText(`Time Step: ${timeStep.toFixed(3)}`, 20, 65);
    ctx.fillText(`Gravity Constant: ${gravitationalConstant.toFixed(2)}`, 20, 80);
    ctx.fillText(`Simulation Speed: ${simulationSpeed.toFixed(1)}x`, 20, 95);
    
    // Total system energy (simplified)
    let totalKE = 0;
    let totalPE = 0;
    
    bodies.forEach(body => {
      totalKE += 0.5 * body.mass * (body.vx * body.vx + body.vy * body.vy);
    });
    
    bodies.forEach((body1, i) => {
      bodies.slice(i + 1).forEach(body2 => {
        const distance = Math.sqrt((body1.x - body2.x) ** 2 + (body1.y - body2.y) ** 2);
        totalPE -= (gravitationalConstant * body1.mass * body2.mass) / distance;
      });
    });
    
    ctx.fillText(`Kinetic Energy: ${totalKE.toFixed(1)}`, 20, 115);
    ctx.fillText(`Potential Energy: ${totalPE.toFixed(1)}`, 20, 130);
    ctx.fillText(`Total Energy: ${(totalKE + totalPE).toFixed(1)}`, 20, 145);
  };

  const drawOrbitalData = (ctx: CanvasRenderingContext2D) => {
    if (orbits.length === 0) return;

    // Orbital data panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(CANVAS_WIDTH - 250, 10, 240, Math.min(orbits.length * 60 + 20, 200));
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH - 250, 10, 240, Math.min(orbits.length * 60 + 20, 200));

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Orbital Elements', CANVAS_WIDTH - 240, 30);
    
    ctx.font = '10px Arial';
    orbits.slice(0, 3).forEach((orbit, index) => {
      const y = 50 + index * 60;
      ctx.fillText(`${orbit.body}:`, CANVAS_WIDTH - 240, y);
      ctx.fillText(`a: ${orbit.semiMajorAxis.toFixed(1)}`, CANVAS_WIDTH - 240, y + 12);
      ctx.fillText(`e: ${orbit.eccentricity.toFixed(3)}`, CANVAS_WIDTH - 240, y + 24);
      ctx.fillText(`T: ${orbit.period.toFixed(1)}`, CANVAS_WIDTH - 240, y + 36);
      ctx.fillText(`Ap: ${orbit.aphelion.toFixed(1)}`, CANVAS_WIDTH - 140, y + 12);
      ctx.fillText(`Pe: ${orbit.perihelion.toFixed(1)}`, CANVAS_WIDTH - 140, y + 24);
    });
  };

  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw gravity field
    drawGravityField(ctx);

    // Draw orbital paths
    drawOrbitalPaths(ctx);

    // Draw trails
    bodies.forEach(body => drawTrail(ctx, body));

    // Draw celestial bodies
    bodies.forEach(body => drawCelestialBody(ctx, body));

    // Draw velocity vectors
    bodies.forEach(body => drawVelocityVector(ctx, body));

    // Draw UI elements
    drawSystemInfo(ctx);
    drawOrbitalData(ctx);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked body
    const clickedBody = bodies.find(body => {
      const distance = Math.sqrt((x - body.x) ** 2 + (y - body.y) ** 2);
      return distance <= body.radius + 5;
    });

    if (clickedBody) {
      setSelectedBody(clickedBody.id);
    } else {
      setSelectedBody('');
    }
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const resetSimulation = () => {
    setBodies([]);
    setOrbits([]);
    setGravityFields([]);
    setIsRunning(false);
    setSelectedBody('');
  };

  const loadPreset = (preset: string) => {
    resetSimulation();
    setPresetSystem(preset);
    
    switch (preset) {
      case 'solar':
        createSolarSystem();
        break;
      case 'binary':
        createBinarySystem();
        break;
      case 'trojan':
        createTrojanSystem();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    createSolarSystem();
  }, []);

  useEffect(() => {
    updateVisualization();
  }, [bodies, showTrails, showGravityField, showVelocityVectors, showOrbitalPaths, selectedBody, zoom]);

  useEffect(() => {
    const interval = setInterval(() => {
      updatePhysics();
      if (Math.random() < 0.1) {
        updateOrbitalElements();
      }
      if (showGravityField && Math.random() < 0.05) {
        calculateGravityField();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isRunning, timeStep, gravitationalConstant, simulationSpeed, showGravityField]);

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
        🌌 Gravity Simulator
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
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Preset System</InputLabel>
                    <Select
                      value={presetSystem}
                      onChange={(e) => loadPreset(e.target.value)}
                    >
                      {Object.entries(presetSystems).map(([key, label]) => (
                        <MenuItem key={key} value={key}>{label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <ButtonGroup variant="contained" size="small">
                    <Button onClick={() => addCelestialBody('star')} startIcon={<Add />}>
                      ⭐ Star
                    </Button>
                    <Button onClick={() => addCelestialBody('planet')}>
                      🪐 Planet
                    </Button>
                  </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <ButtonGroup variant="outlined" size="small">
                    <Button onClick={() => addCelestialBody('moon')}>
                      🌙 Moon
                    </Button>
                    <Button onClick={() => addCelestialBody('asteroid')}>
                      🪨 Asteroid
                    </Button>
                  </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" gutterBottom>Time Step: {timeStep.toFixed(3)}</Typography>
                  <Slider
                    value={timeStep}
                    onChange={(_, value) => setTimeStep(value as number)}
                    min={0.001}
                    max={0.05}
                    step={0.001}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" gutterBottom>Gravity: {gravitationalConstant.toFixed(2)}</Typography>
                  <Slider
                    value={gravitationalConstant}
                    onChange={(_, value) => setGravitationalConstant(value as number)}
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" gutterBottom>Speed: {simulationSpeed.toFixed(1)}x</Typography>
                  <Slider
                    value={simulationSpeed}
                    onChange={(_, value) => setSimulationSpeed(value as number)}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTrails}
                      onChange={(e) => setShowTrails(e.target.checked)}
                    />
                  }
                  label="Orbital Trails"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showGravityField}
                      onChange={(e) => setShowGravityField(e.target.checked)}
                    />
                  }
                  label="Gravity Field"
                />
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
                      checked={showOrbitalPaths}
                      onChange={(e) => setShowOrbitalPaths(e.target.checked)}
                    />
                  }
                  label="Orbital Paths"
                />

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<Public />} 
                    label={`Score: ${score}`} 
                    color="primary" 
                    size="small"
                  />
                  <Chip 
                    icon={<Timeline />}
                    label={`Stable Orbits: ${stableOrbits}`} 
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
                  {isRunning ? '⏸️ Pause' : '▶️ Start'} Simulation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetSimulation}
                  sx={{ borderColor: '#3f51b5', color: '#3f51b5' }}
                >
                  🔄 Reset System
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Remove />}
                  onClick={removeCelestialBody}
                  sx={{ borderColor: '#f44336', color: '#f44336' }}
                >
                  🗑️ Remove Body
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
                display: 'block',
                margin: '0 auto',
                cursor: 'crosshair',
              }}
            />
          </Paper>
        </Grid>

        {/* Selected Body Info */}
        {selectedBody && (
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(103, 58, 183, 0.05) 100%)',
              border: '1px solid rgba(63, 81, 181, 0.2)',
            }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌟 Selected Body
                </Typography>
                {(() => {
                  const body = bodies.find(b => b.id === selectedBody);
                  if (!body) return null;
                  
                  const velocity = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
                  const orbit = orbits.find(o => o.body === body.name);
                  
                  return (
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', color: body.color }}>
                        {body.name}
                      </Typography>
                      <Typography variant="body2">Type: {body.type}</Typography>
                      <Typography variant="body2">Mass: {body.mass.toFixed(2)}</Typography>
                      <Typography variant="body2">Radius: {body.radius}</Typography>
                      <Typography variant="body2">Velocity: {velocity.toFixed(2)}</Typography>
                      <Typography variant="body2">Position: ({body.x.toFixed(1)}, {body.y.toFixed(1)})</Typography>
                      {orbit && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Orbital Elements:</Typography>
                          <Typography variant="body2">Semi-major axis: {orbit.semiMajorAxis.toFixed(1)}</Typography>
                          <Typography variant="body2">Eccentricity: {orbit.eccentricity.toFixed(3)}</Typography>
                          <Typography variant="body2">Period: {orbit.period.toFixed(1)}</Typography>
                        </Box>
                      )}
                    </Box>
                  );
                })()}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* System Statistics */}
        <Grid item xs={12} md={selectedBody ? 6 : 12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(63, 81, 181, 0.1) 0%, rgba(103, 58, 183, 0.05) 100%)',
            border: '1px solid rgba(63, 81, 181, 0.2)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 System Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Total Bodies: {bodies.length}</Typography>
                  <Typography variant="body2">Stars: {bodies.filter(b => b.type === 'star').length}</Typography>
                  <Typography variant="body2">Planets: {bodies.filter(b => b.type === 'planet').length}</Typography>
                  <Typography variant="body2">Moons: {bodies.filter(b => b.type === 'moon').length}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Stable Orbits: {stableOrbits}</Typography>
                  <Typography variant="body2">Active Trails: {bodies.filter(b => b.trail.length > 0).length}</Typography>
                  <Typography variant="body2">Fixed Bodies: {bodies.filter(b => b.fixed).length}</Typography>
                  <Typography variant="body2">Current Score: {score}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md">
        <DialogTitle>🌌 Gravity Simulator Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore gravitational physics and orbital mechanics through interactive simulation!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Adding Bodies:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⭐ <strong>Stars:</strong> Massive, typically fixed central bodies</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🪐 <strong>Planets:</strong> Medium mass, orbital bodies</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌙 <strong>Moons:</strong> Small mass, satellite bodies</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🪨 <strong>Asteroids:</strong> Very small mass, debris</Typography>
          
          <Typography variant="h6" gutterBottom>Preset Systems:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌞 <strong>Solar System:</strong> Sun with planetary orbits</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⭐⭐ <strong>Binary Stars:</strong> Two stars orbiting each other</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🛸 <strong>Trojan Points:</strong> Stable Lagrange point system</Typography>
          
          <Typography variant="h6" gutterBottom>Visualization:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🛤️ <strong>Orbital Trails:</strong> Path history of bodies</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌊 <strong>Gravity Field:</strong> Gravitational force visualization</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>➡️ <strong>Velocity Vectors:</strong> Speed and direction arrows</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>⭕ <strong>Orbital Paths:</strong> Predicted orbit circles</Typography>
          
          <Alert severity="success">
            Click on bodies to select them and view detailed orbital information!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};