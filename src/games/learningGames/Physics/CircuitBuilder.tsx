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
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { ElectricalServices, Power, Lightbulb, PlayArrow, Stop, Refresh } from '@mui/icons-material';

interface CircuitComponent {
  type: 'resistor' | 'battery' | 'led' | 'capacitor' | 'switch' | 'wire';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  value: number; // resistance, voltage, capacitance
  id: string;
  connections: string[];
  isOn?: boolean; // for switches
}

interface Wire {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id: string;
  current: number;
}

interface CircuitNode {
  x: number;
  y: number;
  voltage: number;
  id: string;
  components: string[];
}

export const CircuitBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [selectedTool, setSelectedTool] = useState<'resistor' | 'battery' | 'led' | 'capacitor' | 'switch' | 'wire'>('battery');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [totalVoltage, setTotalVoltage] = useState(0);
  const [totalCurrent, setTotalCurrent] = useState(0);
  const [totalPower, setTotalPower] = useState(0);
  const [wireStart, setWireStart] = useState<{x: number, y: number} | null>(null);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [showMultimeter, setShowMultimeter] = useState(false);
  const animationFrameRef = useRef<number>();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 500;
  const GRID_SIZE = 20;

  const challenges = [
    { name: "Simple Circuit", description: "Connect a battery to an LED with proper polarity" },
    { name: "Series Resistors", description: "Create a series circuit with 3 resistors" },
    { name: "Parallel LEDs", description: "Connect 2 LEDs in parallel to a battery" },
    { name: "Switch Control", description: "Add a switch to control an LED circuit" },
  ];

  const componentLibrary = {
    resistor: { symbol: '🔧', color: '#8B4513', defaultValue: 100 },
    battery: { symbol: '🔋', color: '#FF4500', defaultValue: 9 },
    led: { symbol: '💡', color: '#FFD700', defaultValue: 2.5 },
    capacitor: { symbol: '⚡', color: '#4169E1', defaultValue: 100 },
    switch: { symbol: '🔀', color: '#808080', defaultValue: 0 },
    wire: { symbol: '📏', color: '#000000', defaultValue: 0 }
  };

  const calculateCircuitValues = () => {
    if (!isSimulating || components.length === 0) return;

    // Simple circuit analysis for educational purposes
    const batteries = components.filter(c => c.type === 'battery');
    const resistors = components.filter(c => c.type === 'resistor');
    const leds = components.filter(c => c.type === 'led');
    
    if (batteries.length === 0) {
      setTotalVoltage(0);
      setTotalCurrent(0);
      setTotalPower(0);
      return;
    }

    const sourceVoltage = batteries.reduce((sum, b) => sum + b.value, 0);
    const totalResistance = Math.max(1, resistors.reduce((sum, r) => sum + r.value, 0) + 
                                         leds.reduce((sum, l) => sum + 50, 0)); // LEDs have ~50 ohm internal resistance
    
    const current = sourceVoltage / totalResistance;
    const power = sourceVoltage * current;

    setTotalVoltage(sourceVoltage);
    setTotalCurrent(current);
    setTotalPower(power);
  };

  const drawComponent = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    ctx.save();
    ctx.translate(component.x + component.width / 2, component.y + component.height / 2);
    ctx.rotate(component.rotation);

    const isActive = isSimulating && totalCurrent > 0;
    
    switch (component.type) {
      case 'battery':
        // Battery symbol
        ctx.strokeStyle = isActive ? '#FF6600' : '#FF4500';
        ctx.lineWidth = 4;
        
        // Positive terminal (longer line)
        ctx.beginPath();
        ctx.moveTo(-15, -20);
        ctx.lineTo(-15, 20);
        ctx.stroke();
        
        // Negative terminal (shorter line)
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(15, -15);
        ctx.lineTo(15, 15);
        ctx.stroke();
        
        // Voltage label
        if (showValues) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}V`, 0, 35);
        }
        
        // Connection points
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(-15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'resistor':
        // Resistor zigzag
        ctx.strokeStyle = isActive ? '#FFD700' : '#8B4513';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(-15, 0);
        
        // Zigzag pattern
        for (let i = 0; i < 6; i++) {
          const x = -15 + (i * 5);
          const y = (i % 2 === 0) ? -8 : 8;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(15, 0);
        ctx.stroke();
        
        // Resistance value
        if (showValues) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}Ω`, 0, 25);
        }
        
        // Connection points
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(-25, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(25, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'led':
        // LED symbol (triangle + line)
        const isLit = isActive && totalCurrent > 0.01;
        ctx.fillStyle = isLit ? '#FFFF00' : '#666666';
        ctx.strokeStyle = isLit ? '#FFD700' : '#999999';
        ctx.lineWidth = 3;
        
        // Triangle (anode)
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Line (cathode)
        ctx.beginPath();
        ctx.moveTo(8, -10);
        ctx.lineTo(8, 10);
        ctx.stroke();
        
        // Glow effect when lit
        if (isLit) {
          ctx.shadowColor = '#FFFF00';
          ctx.shadowBlur = 20;
          ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, 20, 0, 2 * Math.PI);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        
        // Forward voltage
        if (showValues) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}V`, 0, 30);
        }
        
        // Connection points
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(-15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'capacitor':
        // Capacitor symbol (two parallel lines)
        ctx.strokeStyle = isActive ? '#00BFFF' : '#4169E1';
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(-5, -15);
        ctx.lineTo(-5, 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(5, -15);
        ctx.lineTo(5, 15);
        ctx.stroke();
        
        // Capacitance value
        if (showValues) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`${component.value}μF`, 0, 30);
        }
        
        // Connection points
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(-15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case 'switch':
        const isClosed = component.isOn || false;
        ctx.strokeStyle = isClosed ? '#00FF00' : '#FF0000';
        ctx.lineWidth = 3;
        
        // Connection points
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.arc(-15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Switch lever
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        if (isClosed) {
          ctx.lineTo(15, 0); // Closed position
        } else {
          ctx.lineTo(10, -8); // Open position
        }
        ctx.stroke();
        
        // Switch base
        ctx.fillStyle = '#808080';
        ctx.fillRect(-2, -3, 4, 6);
        
        // Status label
        if (showValues) {
          ctx.fillStyle = isClosed ? '#00FF00' : '#FF0000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(isClosed ? 'CLOSED' : 'OPEN', 0, 25);
        }
        break;
    }
    
    ctx.restore();
    
    // Component border when selected
    if (component.id === 'selected') {
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(component.x - 2, component.y - 2, component.width + 4, component.height + 4);
    }
  };

  const drawWire = (ctx: CanvasRenderingContext2D, wire: Wire) => {
    const current = Math.abs(wire.current);
    const isActive = isSimulating && current > 0.001;
    
    ctx.strokeStyle = isActive ? '#00FF00' : '#333333';
    ctx.lineWidth = isActive ? 3 : 2;
    
    // Add flowing effect for current
    if (isActive) {
      ctx.setLineDash([5, 5]);
      ctx.lineDashOffset = Date.now() * 0.01;
    } else {
      ctx.setLineDash([]);
    }
    
    ctx.beginPath();
    ctx.moveTo(wire.startX, wire.startY);
    ctx.lineTo(wire.endX, wire.endY);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Current value annotation
    if (showValues && isActive) {
      const midX = (wire.startX + wire.endX) / 2;
      const midY = (wire.startY + wire.endY) / 2;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${current.toFixed(3)}A`, midX, midY - 5);
    }
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y < CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  };

  const drawMultimeter = (ctx: CanvasRenderingContext2D) => {
    if (!showMultimeter) return;
    
    const meterX = CANVAS_WIDTH - 200;
    const meterY = 20;
    const meterWidth = 180;
    const meterHeight = 150;
    
    // Multimeter background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
    
    // Display
    ctx.fillStyle = '#000000';
    ctx.fillRect(meterX + 10, meterY + 20, meterWidth - 20, 40);
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX + 10, meterY + 20, meterWidth - 20, 40);
    
    // Readings
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${totalVoltage.toFixed(2)} V`, meterX + meterWidth / 2, meterY + 45);
    
    // Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Current: ${totalCurrent.toFixed(3)} A`, meterX + 10, meterY + 80);
    ctx.fillText(`Power: ${totalPower.toFixed(2)} W`, meterX + 10, meterY + 100);
    ctx.fillText(`Resistance: ${totalCurrent > 0 ? (totalVoltage / totalCurrent).toFixed(1) : '∞'} Ω`, meterX + 10, meterY + 120);
    
    // Title
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('📟 MULTIMETER', meterX + meterWidth / 2, meterY + 15);
  };

  const drawScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear with dark background
    ctx.fillStyle = '#0f1419';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw wires first (behind components)
    wires.forEach(wire => drawWire(ctx, wire));
    
    // Draw wire in progress
    if (wireStart) {
      ctx.strokeStyle = '#FFFF00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(wireStart.x, wireStart.y);
      // This would need mouse position, simplified for now
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw components
    components.forEach(component => drawComponent(ctx, component));
    
    // Draw multimeter
    drawMultimeter(ctx);
    
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
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ Circuit Builder', panelX + 10, panelY + 25);
    
    // Circuit stats
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`Components: ${components.length}`, panelX + 10, panelY + 45);
    ctx.fillText(`Connections: ${wires.length}`, panelX + 10, panelY + 60);
    ctx.fillText(`Status: ${isSimulating ? 'RUNNING' : 'STOPPED'}`, panelX + 10, panelY + 75);
    
    // Current challenge
    if (challenges[currentChallenge]) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('Challenge:', panelX + 10, panelY + 95);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Arial';
      ctx.fillText(challenges[currentChallenge].name, panelX + 75, panelY + 95);
      ctx.fillText(challenges[currentChallenge].description, panelX + 10, panelY + 110);
    }
  };

  const snapToGrid = (pos: number): number => {
    return Math.round(pos / GRID_SIZE) * GRID_SIZE;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = snapToGrid((event.clientX - rect.left) * scaleX);
    const y = snapToGrid((event.clientY - rect.top) * scaleY);
    
    if (selectedTool === 'wire') {
      if (wireStart) {
        // Complete wire
        const newWire: Wire = {
          startX: wireStart.x,
          startY: wireStart.y,
          endX: x,
          endY: y,
          current: 0,
          id: `wire-${Date.now()}`
        };
        setWires(prev => [...prev, newWire]);
        setWireStart(null);
      } else {
        // Start wire
        setWireStart({ x, y });
      }
    } else {
      // Add component
      const componentSize = selectedTool === 'battery' ? 60 : selectedTool === 'resistor' ? 80 : 50;
      const newComponent: CircuitComponent = {
        type: selectedTool,
        x: x - componentSize / 2,
        y: y - componentSize / 2,
        width: componentSize,
        height: selectedTool === 'resistor' ? 30 : selectedTool === 'battery' ? 40 : componentSize,
        rotation: 0,
        value: componentLibrary[selectedTool].defaultValue,
        connections: [],
        isOn: selectedTool === 'switch' ? false : undefined,
        id: `${selectedTool}-${Date.now()}`
      };
      
      setComponents(prev => [...prev, newComponent]);
    }
  };

  const handleComponentDoubleClick = (componentId: string) => {
    if (componentId.includes('switch')) {
      setComponents(prev => prev.map(comp => 
        comp.id === componentId ? { ...comp, isOn: !comp.isOn } : comp
      ));
    }
  };

  const clearCircuit = () => {
    setComponents([]);
    setWires([]);
    setWireStart(null);
    setTotalVoltage(0);
    setTotalCurrent(0);
    setTotalPower(0);
  };

  const nextChallenge = () => {
    setCurrentChallenge(prev => (prev + 1) % challenges.length);
    clearCircuit();
  };

  const animate = () => {
    calculateCircuitValues();
    drawScene();
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [components, wires, isSimulating, showValues, showMultimeter]);

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
        ⚡ Circuit Builder
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
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" gutterBottom>Components</Typography>
                  <ButtonGroup size="small" sx={{ flexWrap: 'wrap' }}>
                    {(['battery', 'resistor', 'led', 'capacitor', 'switch', 'wire'] as const).map((tool) => (
                      <Button
                        key={tool}
                        variant={selectedTool === tool ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTool(tool)}
                        sx={{ 
                          textTransform: 'capitalize',
                          minWidth: '70px',
                          mb: 0.5
                        }}
                      >
                        {componentLibrary[tool].symbol} {tool}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" gutterBottom>Circuit Analysis</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption">
                      Voltage: {totalVoltage.toFixed(2)}V
                    </Typography>
                    <Typography variant="caption">
                      Current: {totalCurrent.toFixed(3)}A
                    </Typography>
                    <Typography variant="caption">
                      Power: {totalPower.toFixed(2)}W
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" gutterBottom>Controls</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant={isSimulating ? "contained" : "outlined"}
                      startIcon={isSimulating ? <Stop /> : <PlayArrow />}
                      onClick={() => setIsSimulating(!isSimulating)}
                      color={isSimulating ? "error" : "success"}
                      size="small"
                    >
                      {isSimulating ? 'Stop' : 'Simulate'}
                    </Button>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={showValues ? "contained" : "outlined"}
                        onClick={() => setShowValues(!showValues)}
                        size="small"
                      >
                        📊 Values
                      </Button>
                      <Button
                        variant={showMultimeter ? "contained" : "outlined"}
                        onClick={() => setShowMultimeter(!showMultimeter)}
                        size="small"
                      >
                        📟 Meter
                      </Button>
                    </Box>
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
              Click to place {selectedTool} • Double-click switches to toggle • Score: {score}
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
                  onClick={clearCircuit}
                  sx={{ borderColor: '#3f51b5', color: '#3f51b5' }}
                >
                  🧹 Clear Circuit
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔧 Component Guide
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🔋 <strong>Battery:</strong> Voltage source (V)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🔧 <strong>Resistor:</strong> Limits current (Ω)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                💡 <strong>LED:</strong> Light emitting diode
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ⚡ <strong>Capacitor:</strong> Stores charge (μF)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🔀 <strong>Switch:</strong> Controls current flow
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                📏 <strong>Wire:</strong> Connects components
              </Typography>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                Use Ohm's Law: V = I × R
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📚 Circuit Tips
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Connect components with wires
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Check polarity for LEDs and batteries
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Use switches to control circuits
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Monitor current and voltage values
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Tip: Start simulation to see current flow!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};