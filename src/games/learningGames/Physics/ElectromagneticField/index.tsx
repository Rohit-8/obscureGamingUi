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
  FlashOn, 
  RadioButtonChecked, 
  Timeline,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Info,
  Explore
} from '@mui/icons-material';

interface Charge {
  id: string;
  x: number;
  y: number;
  charge: number; // In Coulombs
  fixed: boolean;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
}

interface Magnet {
  id: string;
  x: number;
  y: number;
  strength: number;
  polarity: 'north' | 'south';
  rotation: number;
}

interface FieldLine {
  points: { x: number; y: number }[];
  type: 'electric' | 'magnetic';
}

export const ElectromagneticField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [magnets, setMagnets] = useState<Magnet[]>([]);
  const [fieldLines, setFieldLines] = useState<FieldLine[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('positive-charge');
  const [chargeStrength, setChargeStrength] = useState(1e-6);
  const [magnetStrength, setMagnetStrength] = useState(0.1);
  const [showElectricField, setShowElectricField] = useState(true);
  const [showMagneticField, setShowMagneticField] = useState(true);
  const [showFieldLines, setShowFieldLines] = useState(true);
  const [showForceVectors, setShowForceVectors] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [animateFields, setAnimateFields] = useState(false);
  const [fieldDensity, setFieldDensity] = useState(20);
  const [timeScale, setTimeScale] = useState(1.0);
  const [score, setScore] = useState(0);
  const [experiments, setExperiments] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 650;
  const K_ELECTRIC = 8.99e9; // Coulomb's constant
  const MU_0 = 4 * Math.PI * 1e-7; // Permeability of free space

  const toolTypes = [
    { type: 'positive-charge', name: '⊕ Positive Charge', color: '#f44336' },
    { type: 'negative-charge', name: '⊖ Negative Charge', color: '#2196f3' },
    { type: 'north-magnet', name: '🧲 North Magnet', color: '#ff5722' },
    { type: 'south-magnet', name: '🧲 South Magnet', color: '#3f51b5' },
  ];

  const calculateElectricField = (x: number, y: number): { Ex: number; Ey: number } => {
    let Ex = 0, Ey = 0;
    
    charges.forEach(charge => {
      const dx = x - charge.x;
      const dy = y - charge.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r > 10) { // Avoid singularity at charge location
        const E_magnitude = K_ELECTRIC * Math.abs(charge.charge) / (r * r);
        const E_direction = charge.charge > 0 ? 1 : -1;
        
        Ex += E_direction * E_magnitude * (dx / r);
        Ey += E_direction * E_magnitude * (dy / r);
      }
    });
    
    return { Ex, Ey };
  };

  const calculateMagneticField = (x: number, y: number): { Bx: number; By: number } => {
    let Bx = 0, By = 0;
    
    magnets.forEach(magnet => {
      const dx = x - magnet.x;
      const dy = y - magnet.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      
      if (r > 20) { // Avoid singularity
        const B_magnitude = MU_0 * magnet.strength / (4 * Math.PI * r * r);
        const polarity_factor = magnet.polarity === 'north' ? 1 : -1;
        
        // Simplified dipole field
        const cos_theta = dx / r;
        const sin_theta = dy / r;
        
        Bx += polarity_factor * B_magnitude * (3 * cos_theta * cos_theta - 1);
        By += polarity_factor * B_magnitude * (3 * cos_theta * sin_theta);
      }
    });
    
    return { Bx, By };
  };

  const calculateLorentzForce = (charge: Charge): { Fx: number; Fy: number } => {
    const { Ex, Ey } = calculateElectricField(charge.x, charge.y);
    const { Bx, By } = calculateMagneticField(charge.x, charge.y);
    
    // F = q(E + v × B)
    const qEx = charge.charge * Ex;
    const qEy = charge.charge * Ey;
    
    // v × B (cross product in 2D, assuming vz = 0, Bz component)
    const qvxB = charge.charge * (charge.vy * Bx - charge.vx * By);
    
    return {
      Fx: qEx + qvxB * 0.1, // Scale factor for visualization
      Fy: qEy + qvxB * 0.1
    };
  };

  const generateFieldLines = () => {
    const newFieldLines: FieldLine[] = [];
    
    if (showFieldLines) {
      // Electric field lines from positive charges
      charges.filter(c => c.charge > 0).forEach(charge => {
        for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 8) {
          const fieldLine: FieldLine = {
            points: [],
            type: 'electric'
          };
          
          let x = charge.x + 15 * Math.cos(angle);
          let y = charge.y + 15 * Math.sin(angle);
          
          for (let step = 0; step < 100; step++) {
            const { Ex, Ey } = calculateElectricField(x, y);
            const magnitude = Math.sqrt(Ex * Ex + Ey * Ey);
            
            if (magnitude < 1e3 || x < 0 || x > CANVAS_WIDTH || y < 0 || y > CANVAS_HEIGHT) {
              break;
            }
            
            fieldLine.points.push({ x, y });
            
            // Move along field direction
            const stepSize = 2;
            x += stepSize * (Ex / magnitude);
            y += stepSize * (Ey / magnitude);
          }
          
          if (fieldLine.points.length > 5) {
            newFieldLines.push(fieldLine);
          }
        }
      });
      
      // Magnetic field lines around magnets
      magnets.forEach(magnet => {
        for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 6) {
          const fieldLine: FieldLine = {
            points: [],
            type: 'magnetic'
          };
          
          let x = magnet.x + 30 * Math.cos(angle);
          let y = magnet.y + 30 * Math.sin(angle);
          
          for (let step = 0; step < 80; step++) {
            const { Bx, By } = calculateMagneticField(x, y);
            const magnitude = Math.sqrt(Bx * Bx + By * By);
            
            if (magnitude < 1e-12 || x < 0 || x > CANVAS_WIDTH || y < 0 || y > CANVAS_HEIGHT) {
              break;
            }
            
            fieldLine.points.push({ x, y });
            
            // Move along field direction
            const stepSize = 3;
            x += stepSize * (Bx / magnitude) * 1e6; // Scale for visualization
            y += stepSize * (By / magnitude) * 1e6;
          }
          
          if (fieldLine.points.length > 3) {
            newFieldLines.push(fieldLine);
          }
        }
      });
    }
    
    setFieldLines(newFieldLines);
  };

  const updateChargeMotion = () => {
    if (!isRunning) return;

    setCharges(prevCharges => {
      return prevCharges.map(charge => {
        if (charge.fixed) return charge;

        let newCharge = { ...charge };
        
        // Add current position to trail
        newCharge.trail = [...charge.trail, { x: charge.x, y: charge.y }];
        if (newCharge.trail.length > 30) {
          newCharge.trail = newCharge.trail.slice(-30);
        }
        
        // Calculate forces
        const { Fx, Fy } = calculateLorentzForce(charge);
        
        // Simple physics integration (Euler method)
        const mass = Math.abs(charge.charge) * 1e6; // Scaled mass
        const dt = 0.016 * timeScale; // 60 FPS scaled
        
        const ax = Fx / mass;
        const ay = Fy / mass;
        
        // Update velocity
        newCharge.vx += ax * dt;
        newCharge.vy += ay * dt;
        
        // Apply damping to prevent runaway motion
        newCharge.vx *= 0.99;
        newCharge.vy *= 0.99;
        
        // Update position
        newCharge.x += newCharge.vx * dt;
        newCharge.y += newCharge.vy * dt;
        
        // Boundary conditions (bounce off walls)
        if (newCharge.x <= 20 || newCharge.x >= CANVAS_WIDTH - 20) {
          newCharge.vx = -newCharge.vx * 0.8;
          newCharge.x = Math.max(20, Math.min(CANVAS_WIDTH - 20, newCharge.x));
        }
        
        if (newCharge.y <= 20 || newCharge.y >= CANVAS_HEIGHT - 20) {
          newCharge.vy = -newCharge.vy * 0.8;
          newCharge.y = Math.max(20, Math.min(CANVAS_HEIGHT - 20, newCharge.y));
        }
        
        return newCharge;
      });
    });
  };

  const drawCharge = (ctx: CanvasRenderingContext2D, charge: Charge) => {
    const radius = Math.min(15, Math.max(8, Math.abs(charge.charge) * 1e7));
    
    // Draw trail
    if (charge.trail.length > 1) {
      ctx.strokeStyle = charge.charge > 0 ? 'rgba(244, 67, 54, 0.5)' : 'rgba(33, 150, 243, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 1; i < charge.trail.length; i++) {
        if (i === 1) {
          ctx.moveTo(charge.trail[i-1].x, charge.trail[i-1].y);
        }
        ctx.lineTo(charge.trail[i].x, charge.trail[i].y);
      }
      
      ctx.stroke();
    }
    
    // Draw charge
    ctx.fillStyle = charge.charge > 0 ? '#f44336' : '#2196f3';
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw charge symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(charge.charge > 0 ? '+' : '−', charge.x, charge.y);
    
    // Draw velocity vector
    if (showForceVectors && !charge.fixed) {
      const scale = 100;
      const endX = charge.x + charge.vx * scale;
      const endY = charge.y + charge.vy * scale;
      
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(charge.x, charge.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Arrow head
      const angle = Math.atan2(charge.vy, charge.vx);
      const arrowLength = 8;
      
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI/6),
                endY - arrowLength * Math.sin(angle - Math.PI/6));
      ctx.lineTo(endX - arrowLength * Math.cos(angle + Math.PI/6),
                endY - arrowLength * Math.sin(angle + Math.PI/6));
      ctx.closePath();
      ctx.fill();
    }
  };

  const drawMagnet = (ctx: CanvasRenderingContext2D, magnet: Magnet) => {
    const size = 25;
    
    ctx.save();
    ctx.translate(magnet.x, magnet.y);
    ctx.rotate(magnet.rotation * Math.PI / 180);
    
    // Draw magnet body
    ctx.fillStyle = magnet.polarity === 'north' ? '#ff5722' : '#3f51b5';
    ctx.fillRect(-size, -size/2, size * 2, size);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-size, -size/2, size * 2, size);
    
    // Draw poles
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (magnet.polarity === 'north') {
      ctx.fillText('N', -size/2, 0);
      ctx.fillText('S', size/2, 0);
    } else {
      ctx.fillText('S', -size/2, 0);
      ctx.fillText('N', size/2, 0);
    }
    
    ctx.restore();
  };

  const drawFieldLines = (ctx: CanvasRenderingContext2D) => {
    fieldLines.forEach(fieldLine => {
      if (fieldLine.points.length < 2) return;
      
      ctx.strokeStyle = fieldLine.type === 'electric' ? 
        'rgba(255, 235, 59, 0.7)' : 'rgba(156, 39, 176, 0.7)';
      ctx.lineWidth = fieldLine.type === 'electric' ? 2 : 1.5;
      
      ctx.beginPath();
      ctx.moveTo(fieldLine.points[0].x, fieldLine.points[0].y);
      
      for (let i = 1; i < fieldLine.points.length; i++) {
        ctx.lineTo(fieldLine.points[i].x, fieldLine.points[i].y);
      }
      
      ctx.stroke();
      
      // Draw arrow heads along the line
      if (fieldLine.points.length > 5) {
        const midIndex = Math.floor(fieldLine.points.length / 2);
        const p1 = fieldLine.points[midIndex - 1];
        const p2 = fieldLine.points[midIndex + 1];
        
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const arrowLength = 6;
        const arrowX = fieldLine.points[midIndex].x;
        const arrowY = fieldLine.points[midIndex].y;
        
        ctx.fillStyle = ctx.strokeStyle;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - arrowLength * Math.cos(angle - Math.PI/6),
                  arrowY - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(arrowX - arrowLength * Math.cos(angle + Math.PI/6),
                  arrowY - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  const drawFieldVectorGrid = (ctx: CanvasRenderingContext2D) => {
    if (!showElectricField && !showMagneticField) return;

    const gridSpacing = fieldDensity;
    
    for (let x = gridSpacing; x < CANVAS_WIDTH; x += gridSpacing) {
      for (let y = gridSpacing; y < CANVAS_HEIGHT; y += gridSpacing) {
        if (showElectricField) {
          const { Ex, Ey } = calculateElectricField(x, y);
          const E_magnitude = Math.sqrt(Ex * Ex + Ey * Ey);
          
          if (E_magnitude > 1e3) {
            const scale = Math.min(gridSpacing * 0.4, E_magnitude / 1e6);
            const endX = x + (Ex / E_magnitude) * scale;
            const endY = y + (Ey / E_magnitude) * scale;
            
            ctx.strokeStyle = 'rgba(255, 235, 59, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
        
        if (showMagneticField) {
          const { Bx, By } = calculateMagneticField(x, y);
          const B_magnitude = Math.sqrt(Bx * Bx + By * By);
          
          if (B_magnitude > 1e-12) {
            const scale = Math.min(gridSpacing * 0.3, B_magnitude * 1e8);
            const endX = x + (Bx / B_magnitude) * scale;
            const endY = y + (By / B_magnitude) * scale;
            
            ctx.strokeStyle = 'rgba(156, 39, 176, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
      }
    }
  };

  const drawPhysicsInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(10, 10, 320, 120);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 320, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Electromagnetic Field Analysis', 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Charges: ${charges.length} | Magnets: ${magnets.length}`, 20, 50);
    ctx.fillText(`Charge Strength: ${chargeStrength.toExponential(2)} C`, 20, 65);
    ctx.fillText(`Magnet Strength: ${magnetStrength.toFixed(3)} T`, 20, 80);
    ctx.fillText(`Time Scale: ${timeScale.toFixed(1)}x`, 20, 95);
    ctx.fillText(`Status: ${isRunning ? 'Running' : 'Paused'}`, 20, 110);
    
    // Legend
    ctx.fillStyle = '#ffeb3b';
    ctx.font = '10px Arial';
    ctx.fillText('🟡 Electric Field  🟣 Magnetic Field  🟨 Velocity', 20, 125);
  };

  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw field vector grid
    drawFieldVectorGrid(ctx);

    // Draw field lines
    if (showFieldLines) {
      drawFieldLines(ctx);
    }

    // Draw charges
    charges.forEach(charge => {
      drawCharge(ctx, charge);
    });

    // Draw magnets
    magnets.forEach(magnet => {
      drawMagnet(ctx, magnet);
    });

    // Draw physics info
    drawPhysicsInfo(ctx);
  };

  const addElement = (type: string) => {
    const x = Math.random() * (CANVAS_WIDTH - 100) + 50;
    const y = Math.random() * (CANVAS_HEIGHT - 100) + 50;

    if (type.includes('charge')) {
      const newCharge: Charge = {
        id: `charge-${Date.now()}`,
        x,
        y,
        charge: type === 'positive-charge' ? chargeStrength : -chargeStrength,
        fixed: false,
        vx: 0,
        vy: 0,
        trail: [],
      };
      
      setCharges(prev => [...prev, newCharge]);
    } else if (type.includes('magnet')) {
      const newMagnet: Magnet = {
        id: `magnet-${Date.now()}`,
        x,
        y,
        strength: magnetStrength,
        polarity: type === 'north-magnet' ? 'north' : 'south',
        rotation: Math.random() * 360,
      };
      
      setMagnets(prev => [...prev, newMagnet]);
    }

    setScore(prev => prev + 10);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    addElement(selectedTool);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      setExperiments(prev => prev + 1);
      setScore(prev => prev + 25);
    }
  };

  const clearLab = () => {
    setCharges([]);
    setMagnets([]);
    setFieldLines([]);
    setIsRunning(false);
    setScore(0);
    setExperiments(0);
  };

  const presetConfiguration = (config: string) => {
    clearLab();
    
    switch (config) {
      case 'dipole':
        setCharges([
          { id: 'pos', x: 300, y: 300, charge: chargeStrength, fixed: true, vx: 0, vy: 0, trail: [] },
          { id: 'neg', x: 500, y: 300, charge: -chargeStrength, fixed: true, vx: 0, vy: 0, trail: [] }
        ]);
        break;
      case 'parallel':
        setCharges([
          { id: 'pos1', x: 200, y: 200, charge: chargeStrength, fixed: true, vx: 0, vy: 0, trail: [] },
          { id: 'pos2', x: 200, y: 400, charge: chargeStrength, fixed: true, vx: 0, vy: 0, trail: [] }
        ]);
        break;
      case 'magnetic':
        setMagnets([
          { id: 'north', x: 300, y: 300, strength: magnetStrength, polarity: 'north', rotation: 0 },
          { id: 'south', x: 500, y: 300, strength: magnetStrength, polarity: 'south', rotation: 180 }
        ]);
        break;
    }
    
    setScore(prev => prev + 15);
  };

  useEffect(() => {
    generateFieldLines();
  }, [charges, magnets, showFieldLines]);

  useEffect(() => {
    updateVisualization();
  }, [charges, magnets, fieldLines, showElectricField, showMagneticField, showFieldLines, showForceVectors]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateChargeMotion();
      if (animateFields) {
        generateFieldLines();
      }
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [isRunning, charges, magnets, timeScale, animateFields]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(103, 58, 183, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #9c27b0, #673ab7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        ⚡ Electromagnetic Field Lab
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(103, 58, 183, 0.05) 100%)',
            border: '1px solid rgba(156, 39, 176, 0.3)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FlashOn /> Field Elements
              </Typography>
              
              <ButtonGroup variant="outlined" sx={{ mb: 2, flexWrap: 'wrap' }}>
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
                  <Typography variant="body2" gutterBottom>Charge: {chargeStrength.toExponential(2)} C</Typography>
                  <Slider
                    value={Math.log10(chargeStrength * 1e6)}
                    onChange={(_, value) => setChargeStrength(Math.pow(10, value as number) * 1e-6)}
                    min={-2}
                    max={1}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${Math.pow(10, value).toFixed(2)}e-6`}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Magnet: {magnetStrength.toFixed(3)} T</Typography>
                  <Slider
                    value={magnetStrength}
                    onChange={(_, value) => setMagnetStrength(value as number)}
                    min={0.01}
                    max={1.0}
                    step={0.01}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Field Density: {fieldDensity}px</Typography>
                  <Slider
                    value={fieldDensity}
                    onChange={(_, value) => setFieldDensity(value as number)}
                    min={15}
                    max={50}
                    step={5}
                    valueLabelDisplay="auto"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Time Scale: {timeScale.toFixed(1)}x</Typography>
                  <Slider
                    value={timeScale}
                    onChange={(_, value) => setTimeScale(value as number)}
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
                      checked={showElectricField}
                      onChange={(e) => setShowElectricField(e.target.checked)}
                    />
                  }
                  label="Electric Field"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showMagneticField}
                      onChange={(e) => setShowMagneticField(e.target.checked)}
                    />
                  }
                  label="Magnetic Field"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showFieldLines}
                      onChange={(e) => setShowFieldLines(e.target.checked)}
                    />
                  }
                  label="Field Lines"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showForceVectors}
                      onChange={(e) => setShowForceVectors(e.target.checked)}
                    />
                  }
                  label="Force Vectors"
                />

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<Explore />} 
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
                  {isRunning ? '⏸️ Pause' : '▶️ Start'} Simulation
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => presetConfiguration('dipole')}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  🔴🔵 Dipole
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => presetConfiguration('parallel')}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  🔴🔴 Parallel
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => presetConfiguration('magnetic')}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  🧲🧲 Magnets
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={clearLab}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
                >
                  🗑️ Clear
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={() => setShowHelp(true)}
                  sx={{ borderColor: '#9c27b0', color: '#9c27b0' }}
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
            border: '2px solid rgba(156, 39, 176, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              style={{
                border: '1px solid rgba(156, 39, 176, 0.3)',
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
        <DialogTitle>⚡ Electromagnetic Field Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Explore electromagnetic fields and forces through interactive simulation!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Elements:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⊕ <strong>Positive Charge:</strong> Creates outward electric field</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⊖ <strong>Negative Charge:</strong> Creates inward electric field</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🧲N <strong>North Magnet:</strong> Creates magnetic field lines from N to S</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🧲S <strong>South Magnet:</strong> Magnetic field lines enter from N</Typography>
          
          <Typography variant="h6" gutterBottom>Physics Concepts:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡ <strong>Electric Field:</strong> Force per unit charge (E = F/q)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🧲 <strong>Magnetic Field:</strong> Affects moving charges (Lorentz force)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌀 <strong>Field Lines:</strong> Show field direction and strength</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>⚡🧲 <strong>Lorentz Force:</strong> F = q(E + v × B)</Typography>
          
          <Typography variant="h6" gutterBottom>Visualization:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🟡 <strong>Yellow vectors:</strong> Electric field direction</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🟣 <strong>Purple vectors:</strong> Magnetic field direction</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🟨 <strong>Yellow trails:</strong> Charge velocity vectors</Typography>
          
          <Alert severity="success">
            Place charges and magnets, then start simulation to see electromagnetic interactions!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};