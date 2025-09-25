import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  ButtonGroup,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { 
  ElectricalServices, 
  PowerOff, 
  DeleteOutline, 
  Refresh,
  FlashOn,
  Settings,
  Info
} from '@mui/icons-material';

interface CircuitComponent {
  id: string;
  type: 'battery' | 'resistor' | 'led' | 'switch' | 'capacitor' | 'wire';
  x: number;
  y: number;
  value?: number;
  connected: boolean;
  rotation: number;
  isOn?: boolean;
}

interface Connection {
  from: string;
  to: string;
  fromPort: 'input' | 'output';
  toPort: 'input' | 'output';
}

export const CircuitBuilder: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('wire');
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [voltage, setVoltage] = useState(9);
  const [current, setCurrent] = useState(0);
  const [totalResistance, setTotalResistance] = useState(0);
  const [powerConsumption, setPowerConsumption] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [score, setScore] = useState(0);
  const [completedCircuits, setCompletedCircuits] = useState(0);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const COMPONENT_SIZE = 40;

  const componentTypes = [
    { type: 'battery', name: '🔋 Battery', color: '#ff6b35' },
    { type: 'resistor', name: '🔌 Resistor', color: '#4ecdc4' },
    { type: 'led', name: '💡 LED', color: '#ffe66d' },
    { type: 'switch', name: '🔘 Switch', color: '#a8e6cf' },
    { type: 'capacitor', name: '⚡ Capacitor', color: '#ff8b94' },
    { type: 'wire', name: '➖ Wire', color: '#95e1d3' },
  ];

  const calculateCircuitValues = () => {
    if (!simulationRunning) return;

    // Simple circuit analysis
    const batteries = components.filter(c => c.type === 'battery');
    const resistors = components.filter(c => c.type === 'resistor');
    const leds = components.filter(c => c.type === 'led');

    let totalVoltage = batteries.reduce((sum, battery) => sum + (battery.value || 9), 0);
    let totalRes = resistors.reduce((sum, resistor) => sum + (resistor.value || 100), 0);
    totalRes += leds.reduce((sum, led) => sum + 50, 0); // LEDs have ~50Ω resistance

    const calculatedCurrent = totalRes > 0 ? totalVoltage / totalRes : 0;
    const power = totalVoltage * calculatedCurrent;

    setVoltage(totalVoltage);
    setTotalResistance(totalRes);
    setCurrent(calculatedCurrent);
    setPowerConsumption(power);
  };

  const drawComponent = (ctx: CanvasRenderingContext2D, component: CircuitComponent) => {
    const { x, y, type, isOn, value } = component;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(component.rotation * Math.PI / 180);

    // Component background
    ctx.fillStyle = component.connected && simulationRunning ? 
      (isOn ? '#00ff00' : '#ffff00') : '#333333';
    ctx.fillRect(-COMPONENT_SIZE/2, -COMPONENT_SIZE/2, COMPONENT_SIZE, COMPONENT_SIZE);

    // Component border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-COMPONENT_SIZE/2, -COMPONENT_SIZE/2, COMPONENT_SIZE, COMPONENT_SIZE);

    // Component-specific drawings
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    switch (type) {
      case 'battery':
        ctx.fillText('🔋', 0, -5);
        ctx.font = '10px Arial';
        ctx.fillText(`${value || 9}V`, 0, 10);
        break;
      case 'resistor':
        ctx.fillText('🔌', 0, -5);
        ctx.font = '10px Arial';
        ctx.fillText(`${value || 100}Ω`, 0, 10);
        break;
      case 'led':
        const ledColor = (component.connected && simulationRunning && current > 0.01) ? '#ffff00' : '#666666';
        ctx.fillStyle = ledColor;
        ctx.fillText('💡', 0, 0);
        break;
      case 'switch':
        ctx.fillStyle = isOn ? '#00ff00' : '#ff0000';
        ctx.fillText('🔘', 0, 0);
        break;
      case 'capacitor':
        ctx.fillText('⚡', 0, -5);
        ctx.font = '10px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${value || 10}µF`, 0, 10);
        break;
      case 'wire':
        ctx.strokeStyle = component.connected && simulationRunning ? '#00ff00' : '#666666';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-COMPONENT_SIZE/2, 0);
        ctx.lineTo(COMPONENT_SIZE/2, 0);
        ctx.stroke();
        break;
    }

    // Connection points
    if (type !== 'wire') {
      ctx.fillStyle = component.connected ? '#00ff00' : '#ff0000';
      ctx.beginPath();
      ctx.arc(-COMPONENT_SIZE/2 + 5, 0, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(COMPONENT_SIZE/2 - 5, 0, 3, 0, 2 * Math.PI);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawConnections = (ctx: CanvasRenderingContext2D) => {
    connections.forEach(connection => {
      const fromComponent = components.find(c => c.id === connection.from);
      const toComponent = components.find(c => c.id === connection.to);
      
      if (fromComponent && toComponent) {
        ctx.strokeStyle = simulationRunning && current > 0.01 ? '#00ff00' : '#666666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fromComponent.x, fromComponent.y);
        ctx.lineTo(toComponent.x, toComponent.y);
        ctx.stroke();

        // Draw current flow animation
        if (simulationRunning && current > 0.01) {
          const time = Date.now() / 200;
          const flowX = fromComponent.x + (toComponent.x - fromComponent.x) * (0.5 + 0.3 * Math.sin(time));
          const flowY = fromComponent.y + (toComponent.y - fromComponent.y) * (0.5 + 0.3 * Math.sin(time));
          
          ctx.fillStyle = '#ffff00';
          ctx.beginPath();
          ctx.arc(flowX, flowY, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    const gridSize = 40;
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

  const drawCircuitInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 250, 120);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 250, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Circuit Analysis', 20, 30);

    ctx.font = '12px Arial';
    ctx.fillText(`Voltage: ${voltage.toFixed(2)}V`, 20, 50);
    ctx.fillText(`Current: ${current.toFixed(3)}A`, 20, 65);
    ctx.fillText(`Resistance: ${totalResistance.toFixed(1)}Ω`, 20, 80);
    ctx.fillText(`Power: ${powerConsumption.toFixed(2)}W`, 20, 95);
    ctx.fillText(`Status: ${simulationRunning ? 'Running' : 'Stopped'}`, 20, 110);

    // Legend
    ctx.fillStyle = '#ffff00';
    ctx.font = '10px Arial';
    ctx.fillText('🟡 Current Flow  🟢 Connected  🔴 Disconnected', 20, 125);
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

    // Draw connections
    drawConnections(ctx);

    // Draw components
    components.forEach(component => {
      drawComponent(ctx, component);
    });

    // Draw circuit info
    drawCircuitInfo(ctx);
  };

  const addComponent = (type: string) => {
    const newComponent: CircuitComponent = {
      id: `component-${Date.now()}`,
      type: type as any,
      x: Math.random() * (CANVAS_WIDTH - COMPONENT_SIZE) + COMPONENT_SIZE/2,
      y: Math.random() * (CANVAS_HEIGHT - COMPONENT_SIZE) + COMPONENT_SIZE/2,
      value: type === 'battery' ? 9 : type === 'resistor' ? 100 : type === 'capacitor' ? 10 : undefined,
      connected: false,
      rotation: 0,
      isOn: type === 'switch' ? false : true,
    };

    setComponents(prev => [...prev, newComponent]);
    setScore(prev => prev + 10);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    // Check if clicking on component
    const clickedComponent = components.find(component => {
      const dx = scaledX - component.x;
      const dy = scaledY - component.y;
      return Math.abs(dx) <= COMPONENT_SIZE/2 && Math.abs(dy) <= COMPONENT_SIZE/2;
    });

    if (clickedComponent) {
      if (clickedComponent.type === 'switch') {
        // Toggle switch
        setComponents(prev => prev.map(c => 
          c.id === clickedComponent.id ? { ...c, isOn: !c.isOn } : c
        ));
      }
    } else if (selectedTool !== 'wire') {
      // Add new component
      addComponent(selectedTool);
    }
  };

  const startSimulation = () => {
    setSimulationRunning(true);
    // Check for complete circuits
    const hasClosedCircuit = checkCircuitContinuity();
    if (hasClosedCircuit) {
      setCompletedCircuits(prev => prev + 1);
      setScore(prev => prev + 50);
    }
  };

  const stopSimulation = () => {
    setSimulationRunning(false);
    setCurrent(0);
  };

  const checkCircuitContinuity = (): boolean => {
    // Simple check for at least one battery and one load
    const hasBattery = components.some(c => c.type === 'battery');
    const hasLoad = components.some(c => c.type === 'resistor' || c.type === 'led');
    
    if (hasBattery && hasLoad) {
      setComponents(prev => prev.map(c => ({ ...c, connected: true })));
      return true;
    }
    
    return false;
  };

  const clearCircuit = () => {
    setComponents([]);
    setConnections([]);
    setSimulationRunning(false);
    setCurrent(0);
    setVoltage(0);
    setTotalResistance(0);
    setPowerConsumption(0);
  };

  useEffect(() => {
    updateVisualization();
    calculateCircuitValues();
  }, [components, connections, simulationRunning, current]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (simulationRunning) {
        updateVisualization();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [simulationRunning]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 87, 34, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #ff9800, #ff5722)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        ⚡ Circuit Builder Lab
      </Typography>

      <Grid container spacing={3}>
        {/* Component Palette */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15) 0%, rgba(255, 87, 34, 0.05) 100%)',
            border: '1px solid rgba(255, 152, 0, 0.3)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ElectricalServices /> Component Palette
              </Typography>
              <ButtonGroup variant="outlined" sx={{ mb: 2, flexWrap: 'wrap' }}>
                {componentTypes.map((component) => (
                  <Button
                    key={component.type}
                    variant={selectedTool === component.type ? "contained" : "outlined"}
                    onClick={() => setSelectedTool(component.type)}
                    sx={{
                      borderColor: component.color,
                      color: selectedTool === component.type ? '#fff' : component.color,
                      '&:hover': { backgroundColor: `${component.color}20` }
                    }}
                  >
                    {component.name}
                  </Button>
                ))}
              </ButtonGroup>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<FlashOn />}
                  onClick={startSimulation}
                  disabled={simulationRunning}
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                    fontWeight: 'bold',
                  }}
                >
                  ▶️ Start Simulation
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PowerOff />}
                  onClick={stopSimulation}
                  disabled={!simulationRunning}
                  sx={{
                    background: 'linear-gradient(45deg, #f44336, #ff9800)',
                    fontWeight: 'bold',
                  }}
                >
                  ⏹️ Stop
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={clearCircuit}
                  sx={{ borderColor: '#ff9800', color: '#ff9800' }}
                >
                  🗑️ Clear
                </Button>
                <IconButton
                  onClick={() => setShowHelp(true)}
                  sx={{ color: '#ff9800' }}
                >
                  <Info />
                </IconButton>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Chip 
                    icon={<ElectricalServices />} 
                    label={`Score: ${score}`} 
                    color="primary" 
                  />
                  <Chip 
                    label={`Circuits: ${completedCircuits}`} 
                    color="success" 
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Circuit Canvas */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(255, 152, 0, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              style={{
                border: '1px solid rgba(255, 152, 0, 0.3)',
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

        {/* Circuit Analysis Panel */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 2, background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Circuit Analysis
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Total Voltage:</strong> {voltage.toFixed(2)}V
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Current:</strong> {current.toFixed(3)}A
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Total Resistance:</strong> {totalResistance.toFixed(1)}Ω
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Power Consumption:</strong> {powerConsumption.toFixed(2)}W
              </Typography>
              
              <Alert 
                severity={simulationRunning ? "success" : "info"} 
                sx={{ mb: 2 }}
              >
                {simulationRunning ? 
                  "⚡ Circuit is running! Current flowing through components." :
                  "🔌 Click components to add them, then start simulation!"
                }
              </Alert>

              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                🔋 Ohm's Law: V = I × R
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📏 Power: P = V × I
              </Typography>
              <Typography variant="body2">
                ⚡ Current flows from positive to negative terminal
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎮 How to Play
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                1️⃣ Select components from the palette
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                2️⃣ Click on canvas to place components
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                3️⃣ Click switches to toggle them on/off
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                4️⃣ Start simulation to see current flow
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                5️⃣ Watch LEDs light up and analyze circuits!
              </Typography>
              
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                💡 Tip: Build complete circuits with batteries and loads to see current flow!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md">
        <DialogTitle>
          ⚡ Circuit Builder Guide
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Learn electronics by building interactive circuits!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Components:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔋 <strong>Battery:</strong> Provides voltage (energy source)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔌 <strong>Resistor:</strong> Limits current flow, creates voltage drop</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>💡 <strong>LED:</strong> Light emitting diode, lights up with current</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔘 <strong>Switch:</strong> Controls circuit on/off (click to toggle)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡ <strong>Capacitor:</strong> Stores electrical energy</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>➖ <strong>Wire:</strong> Connects components with no resistance</Typography>
          
          <Typography variant="h6" gutterBottom>Circuit Laws:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡ <strong>Ohm's Law:</strong> V = I × R (Voltage = Current × Resistance)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔄 <strong>Power Law:</strong> P = V × I (Power = Voltage × Current)</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🌊 <strong>Current Flow:</strong> From positive to negative terminal</Typography>
          
          <Alert severity="success">
            Build working circuits to earn points and learn electronics fundamentals!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};