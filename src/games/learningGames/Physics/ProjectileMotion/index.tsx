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
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  SportsSoccer, 
  Launch, 
  Timeline,
  Settings,
  Refresh,
  PlayArrow,
  Pause,
  Info,
  Calculate
} from '@mui/icons-material';

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  active: boolean;
  color: string;
  id: string;
}

interface Target {
  x: number;
  y: number;
  width: number;
  height: number;
  hit: boolean;
}

interface LaunchData {
  angle: number;
  velocity: number;
  maxHeight: number;
  range: number;
  flightTime: number;
  hit: boolean;
}

export const ProjectileMotion: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [launchAngle, setLaunchAngle] = useState(45);
  const [launchVelocity, setLaunchVelocity] = useState(25);
  const [gravity, setGravity] = useState(9.81);
  const [airResistance, setAirResistance] = useState(0);
  const [windSpeed, setWindSpeed] = useState(0);
  const [launcherHeight, setLauncherHeight] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showTrajectoryPrediction, setShowTrajectoryPrediction] = useState(true);
  const [showVelocityVectors, setShowVelocityVectors] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [launchHistory, setLaunchHistory] = useState<LaunchData[]>([]);
  const [score, setScore] = useState(0);
  const [successfulHits, setSuccessfulHits] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;
  const GROUND_LEVEL = CANVAS_HEIGHT - 50;
  const LAUNCHER_X = 100;
  const SCALE = 5; // pixels per meter

  const initializeTargets = () => {
    const newTargets: Target[] = [];
    for (let i = 0; i < 3; i++) {
      newTargets.push({
        x: 300 + i * 200,
        y: GROUND_LEVEL - 60 - Math.random() * 100,
        width: 40,
        height: 60,
        hit: false
      });
    }
    setTargets(newTargets);
  };

  const calculateTrajectory = (
    angle: number, 
    velocity: number, 
    startHeight: number = 0
  ): { x: number; y: number }[] => {
    const trajectory: { x: number; y: number }[] = [];
    const angleRad = (angle * Math.PI) / 180;
    const vx0 = velocity * Math.cos(angleRad);
    const vy0 = velocity * Math.sin(angleRad);
    
    const dt = 0.1; // time step
    let t = 0;
    let x = 0;
    let y = startHeight;
    
    while (y >= 0 && x < CANVAS_WIDTH / SCALE && t < 20) {
      // Including air resistance and wind
      const vx = vx0 - airResistance * vx0 * t + windSpeed;
      const vy = vy0 - gravity * t - airResistance * vy0 * t;
      
      x = vx0 * t - 0.5 * airResistance * vx0 * t * t + windSpeed * t;
      y = startHeight + vy0 * t - 0.5 * gravity * t * t - 0.5 * airResistance * vy0 * t * t;
      
      trajectory.push({ 
        x: LAUNCHER_X + x * SCALE, 
        y: GROUND_LEVEL - y * SCALE 
      });
      
      t += dt;
    }
    
    return trajectory;
  };

  const calculateOptimalAngle = (): number => {
    // For maximum range without air resistance: 45° at same level
    // With height difference, optimal angle is less than 45°
    const h = launcherHeight;
    const v = launchVelocity;
    const g = gravity;
    
    if (h === 0) return 45;
    
    // Approximation for optimal angle with height
    const optAngle = Math.atan(v / Math.sqrt(v * v + 2 * g * h)) * 180 / Math.PI;
    return optAngle;
  };

  const launchProjectile = () => {
    const angleRad = (launchAngle * Math.PI) / 180;
    const vx = launchVelocity * Math.cos(angleRad);
    const vy = launchVelocity * Math.sin(angleRad);
    
    const newProjectile: Projectile = {
      x: LAUNCHER_X,
      y: GROUND_LEVEL - launcherHeight * SCALE,
      vx: vx * SCALE,
      vy: -vy * SCALE, // Negative because canvas y increases downward
      trail: [],
      active: true,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      id: `projectile-${Date.now()}`
    };
    
    setProjectiles(prev => [...prev, newProjectile]);
    setScore(prev => prev + 5);
    
    // Calculate theoretical values for analysis
    const maxHeight = (vy * vy) / (2 * gravity) + launcherHeight;
    const flightTime = (vy + Math.sqrt(vy * vy + 2 * gravity * launcherHeight)) / gravity;
    const range = vx * flightTime;
    
    const launchData: LaunchData = {
      angle: launchAngle,
      velocity: launchVelocity,
      maxHeight,
      range,
      flightTime,
      hit: false
    };
    
    setLaunchHistory(prev => [...prev, launchData]);
  };

  const updateProjectiles = () => {
    if (!isRunning) return;

    setProjectiles(prevProjectiles => {
      return prevProjectiles.map(projectile => {
        if (!projectile.active) return projectile;

        let newProjectile = { ...projectile };
        
        // Add current position to trail
        newProjectile.trail = [...projectile.trail, { x: projectile.x, y: projectile.y }];
        if (newProjectile.trail.length > 50) {
          newProjectile.trail = newProjectile.trail.slice(-50);
        }
        
        // Update position
        newProjectile.x += newProjectile.vx * 0.016; // 60 FPS
        newProjectile.y += newProjectile.vy * 0.016;
        
        // Update velocity with gravity and air resistance
        newProjectile.vy += gravity * SCALE * 0.016;
        
        // Air resistance (simplified)
        if (airResistance > 0) {
          const speed = Math.sqrt(newProjectile.vx ** 2 + newProjectile.vy ** 2);
          const dragForce = airResistance * speed * 0.016;
          
          newProjectile.vx *= (1 - dragForce / speed);
          newProjectile.vy *= (1 - dragForce / speed);
        }
        
        // Wind effect
        newProjectile.vx += windSpeed * SCALE * 0.016;
        
        // Check ground collision
        if (newProjectile.y >= GROUND_LEVEL) {
          newProjectile.active = false;
          newProjectile.y = GROUND_LEVEL;
        }
        
        // Check canvas boundaries
        if (newProjectile.x > CANVAS_WIDTH || newProjectile.x < 0) {
          newProjectile.active = false;
        }
        
        // Check target collisions
        targets.forEach((target, targetIndex) => {
          if (target.hit) return;
          
          if (newProjectile.x >= target.x && 
              newProjectile.x <= target.x + target.width &&
              newProjectile.y >= target.y && 
              newProjectile.y <= target.y + target.height) {
            
            newProjectile.active = false;
            
            // Mark target as hit
            setTargets(prev => prev.map((t, i) => 
              i === targetIndex ? { ...t, hit: true } : t
            ));
            
            // Update launch history
            setLaunchHistory(prev => prev.map((launch, i) => 
              i === prev.length - 1 ? { ...launch, hit: true } : launch
            ));
            
            setScore(prev => prev + 50);
            setSuccessfulHits(prev => prev + 1);
          }
        });
        
        return newProjectile;
      });
    });
  };

  const drawLauncher = (ctx: CanvasRenderingContext2D) => {
    const launcherLength = 60;
    const angleRad = (launchAngle * Math.PI) / 180;
    
    // Launcher base
    ctx.fillStyle = '#666666';
    ctx.fillRect(LAUNCHER_X - 20, GROUND_LEVEL - launcherHeight * SCALE - 10, 40, 20);
    
    // Launcher barrel
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(LAUNCHER_X, GROUND_LEVEL - launcherHeight * SCALE);
    ctx.lineTo(
      LAUNCHER_X + launcherLength * Math.cos(angleRad),
      GROUND_LEVEL - launcherHeight * SCALE - launcherLength * Math.sin(angleRad)
    );
    ctx.stroke();
    
    // Angle indicator
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(LAUNCHER_X, GROUND_LEVEL - launcherHeight * SCALE, 40, 0, -angleRad, true);
    ctx.stroke();
    
    // Angle text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${launchAngle}°`, LAUNCHER_X + 50, GROUND_LEVEL - launcherHeight * SCALE - 20);
  };

  const drawProjectiles = (ctx: CanvasRenderingContext2D) => {
    projectiles.forEach(projectile => {
      // Draw trail
      if (projectile.trail.length > 1) {
        ctx.strokeStyle = projectile.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        
        ctx.beginPath();
        ctx.moveTo(projectile.trail[0].x, projectile.trail[0].y);
        
        for (let i = 1; i < projectile.trail.length; i++) {
          ctx.lineTo(projectile.trail[i].x, projectile.trail[i].y);
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      
      // Draw projectile
      ctx.fillStyle = projectile.color;
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw velocity vector
      if (showVelocityVectors && projectile.active) {
        const velocityScale = 0.1;
        const endX = projectile.x + projectile.vx * velocityScale;
        const endY = projectile.y + projectile.vy * velocityScale;
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(projectile.x, projectile.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(projectile.vy, projectile.vx);
        const arrowLength = 10;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowLength * Math.cos(angle - Math.PI/6),
                  endY - arrowLength * Math.sin(angle - Math.PI/6));
        ctx.lineTo(endX - arrowLength * Math.cos(angle + Math.PI/6),
                  endY - arrowLength * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
      }
    });
  };

  const drawTargets = (ctx: CanvasRenderingContext2D) => {
    targets.forEach(target => {
      ctx.fillStyle = target.hit ? '#4caf50' : '#f44336';
      ctx.fillRect(target.x, target.y, target.width, target.height);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(target.x, target.y, target.width, target.height);
      
      // Target symbol
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(target.hit ? '✓' : '🎯', 
                  target.x + target.width/2, 
                  target.y + target.height/2 + 5);
    });
  };

  const drawTrajectoryPrediction = (ctx: CanvasRenderingContext2D) => {
    if (!showTrajectoryPrediction) return;

    const prediction = calculateTrajectory(launchAngle, launchVelocity, launcherHeight);
    
    if (prediction.length > 1) {
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(prediction[0].x, prediction[0].y);
      
      for (let i = 1; i < prediction.length; i++) {
        ctx.lineTo(prediction[i].x, prediction[i].y);
      }
      
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawGround = (ctx: CanvasRenderingContext2D) => {
    // Ground
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(0, GROUND_LEVEL, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_LEVEL);
    
    // Ground line
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_LEVEL);
    ctx.lineTo(CANVAS_WIDTH, GROUND_LEVEL);
    ctx.stroke();
    
    // Distance markers
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    for (let x = 100; x < CANVAS_WIDTH; x += 100) {
      const distance = (x - LAUNCHER_X) / SCALE;
      if (distance > 0) {
        ctx.fillText(`${distance.toFixed(0)}m`, x, GROUND_LEVEL + 20);
        
        // Marker line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, GROUND_LEVEL);
        ctx.lineTo(x, GROUND_LEVEL + 10);
        ctx.stroke();
      }
    }
  };

  const drawPhysicsInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(10, 10, 300, 140);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 300, 140);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Projectile Motion Analysis', 20, 30);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Launch Angle: ${launchAngle}°`, 20, 50);
    ctx.fillText(`Initial Velocity: ${launchVelocity} m/s`, 20, 65);
    ctx.fillText(`Gravity: ${gravity} m/s²`, 20, 80);
    ctx.fillText(`Air Resistance: ${airResistance.toFixed(2)}`, 20, 95);
    ctx.fillText(`Wind Speed: ${windSpeed} m/s`, 20, 110);
    ctx.fillText(`Launcher Height: ${launcherHeight} m`, 20, 125);
    
    // Optimal angle suggestion
    const optimalAngle = calculateOptimalAngle();
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`Optimal Angle: ${optimalAngle.toFixed(1)}°`, 20, 140);
  };

  const updateVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground
    drawGround(ctx);

    // Draw trajectory prediction
    drawTrajectoryPrediction(ctx);

    // Draw targets
    drawTargets(ctx);

    // Draw launcher
    drawLauncher(ctx);

    // Draw projectiles
    drawProjectiles(ctx);

    // Draw physics info
    drawPhysicsInfo(ctx);
  };

  const toggleSimulation = () => {
    setIsRunning(!isRunning);
  };

  const clearProjectiles = () => {
    setProjectiles([]);
    setIsRunning(false);
  };

  const resetLab = () => {
    setProjectiles([]);
    setLaunchHistory([]);
    setScore(0);
    setSuccessfulHits(0);
    setIsRunning(false);
    initializeTargets();
  };

  useEffect(() => {
    initializeTargets();
  }, []);

  useEffect(() => {
    updateVisualization();
  }, [projectiles, targets, launchAngle, launchVelocity, showTrajectoryPrediction, showVelocityVectors, launcherHeight]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateProjectiles();
      updateVisualization();
    }, 16); // ~60 FPS

    return () => clearInterval(interval);
  }, [isRunning, projectiles, targets, gravity, airResistance, windSpeed]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        🚀 Projectile Motion Lab
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(139, 195, 74, 0.05) 100%)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Launch /> Launch Parameters
              </Typography>
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Launch Angle: {launchAngle}°</Typography>
                  <Slider
                    value={launchAngle}
                    onChange={(_, value) => setLaunchAngle(value as number)}
                    min={0}
                    max={90}
                    step={1}
                    valueLabelDisplay="auto"
                    disabled={isRunning}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Initial Velocity: {launchVelocity} m/s</Typography>
                  <Slider
                    value={launchVelocity}
                    onChange={(_, value) => setLaunchVelocity(value as number)}
                    min={5}
                    max={50}
                    step={1}
                    valueLabelDisplay="auto"
                    disabled={isRunning}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Gravity: {gravity} m/s²</Typography>
                  <Slider
                    value={gravity}
                    onChange={(_, value) => setGravity(value as number)}
                    min={1}
                    max={20}
                    step={0.1}
                    valueLabelDisplay="auto"
                    disabled={isRunning}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Launcher Height: {launcherHeight} m</Typography>
                  <Slider
                    value={launcherHeight}
                    onChange={(_, value) => setLauncherHeight(value as number)}
                    min={0}
                    max={20}
                    step={1}
                    valueLabelDisplay="auto"
                    disabled={isRunning}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={3} alignItems="center" sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Air Resistance: {airResistance.toFixed(2)}</Typography>
                  <Slider
                    value={airResistance}
                    onChange={(_, value) => setAirResistance(value as number)}
                    min={0}
                    max={0.1}
                    step={0.01}
                    valueLabelDisplay="auto"
                    disabled={isRunning}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" gutterBottom>Wind Speed: {windSpeed} m/s</Typography>
                  <Slider
                    value={windSpeed}
                    onChange={(_, value) => setWindSpeed(value as number)}
                    min={-10}
                    max={10}
                    step={0.5}
                    valueLabelDisplay="auto"
                    disabled={isRunning}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showTrajectoryPrediction}
                        onChange={(e) => setShowTrajectoryPrediction(e.target.checked)}
                      />
                    }
                    label="Trajectory Prediction"
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
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip 
                        icon={<SportsSoccer />} 
                        label={`Score: ${score}`} 
                        color="primary" 
                        size="small"
                      />
                      <Chip 
                        label={`Hits: ${successfulHits}`} 
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
                  startIcon={<Launch />}
                  onClick={launchProjectile}
                  disabled={isRunning}
                  sx={{
                    background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
                    fontWeight: 'bold',
                  }}
                >
                  🚀 Launch
                </Button>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <Pause /> : <PlayArrow />}
                  onClick={toggleSimulation}
                  sx={{
                    background: isRunning ? 
                      'linear-gradient(45deg, #f44336, #ff9800)' :
                      'linear-gradient(45deg, #2196f3, #03a9f4)',
                    fontWeight: 'bold',
                  }}
                >
                  {isRunning ? '⏸️ Pause' : '▶️ Start'} Physics
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearProjectiles}
                  sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                >
                  🧹 Clear Projectiles
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetLab}
                  sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                >
                  🔄 Reset Lab
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Calculate />}
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                >
                  📊 Analysis
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={() => setShowHelp(true)}
                  sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                >
                  ❓ Help
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Canvas */}
        <Grid item xs={12} lg={showAnalysis ? 8 : 12}>
          <Paper sx={{ 
            p: 2,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                border: '1px solid rgba(76, 175, 80, 0.3)',
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

        {/* Analysis Panel */}
        {showAnalysis && (
          <Grid item xs={12} lg={4}>
            <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Launch Analysis
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Current Setup:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Optimal Angle: {calculateOptimalAngle().toFixed(1)}°
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Predicted Range: {((launchVelocity ** 2 * Math.sin(2 * launchAngle * Math.PI / 180)) / gravity).toFixed(1)}m
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Max Height: {((launchVelocity * Math.sin(launchAngle * Math.PI / 180)) ** 2 / (2 * gravity) + launcherHeight).toFixed(1)}m
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  📈 Launch History
                </Typography>
                
                <TableContainer component={Paper} sx={{ maxHeight: 300, background: 'rgba(255,255,255,0.05)' }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Angle</TableCell>
                        <TableCell>Velocity</TableCell>
                        <TableCell>Range</TableCell>
                        <TableCell>Hit</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {launchHistory.slice(-10).map((launch, index) => (
                        <TableRow key={index}>
                          <TableCell>{launch.angle}°</TableCell>
                          <TableCell>{launch.velocity}m/s</TableCell>
                          <TableCell>{launch.range.toFixed(1)}m</TableCell>
                          <TableCell>
                            {launch.hit ? '✅' : '❌'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Physics Formulas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📐 Physics Formulas
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Range:</strong> R = (v²sin(2θ))/g
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Max Height:</strong> H = (v²sin²(θ))/(2g)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Flight Time:</strong> t = (2vsin(θ))/g
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Horizontal Velocity:</strong> vₓ = vcos(θ)
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Vertical Velocity:</strong> vᵧ = vsin(θ) - gt
              </Typography>
              
              <Alert severity="info">
                Optimal angle for maximum range is 45° (without air resistance)
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Game Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎯 Game Status
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Active Projectiles:</strong> {projectiles.filter(p => p.active).length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Targets Hit:</strong> {targets.filter(t => t.hit).length}/{targets.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Total Launches:</strong> {launchHistory.length}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Success Rate:</strong> {launchHistory.length > 0 ? ((successfulHits / launchHistory.length) * 100).toFixed(1) : 0}%
              </Typography>
              
              <Alert severity={isRunning ? "success" : "warning"}>
                {isRunning ? 
                  "🚀 Physics simulation running! Watch projectile motion." :
                  "🎯 Adjust parameters and launch projectiles to hit targets!"
                }
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md">
        <DialogTitle>🚀 Projectile Motion Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Learn projectile motion physics through interactive simulation!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Key Concepts:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🎯 <strong>Launch Angle:</strong> Determines trajectory shape (45° is optimal for max range)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡ <strong>Initial Velocity:</strong> Affects both range and maximum height</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌍 <strong>Gravity:</strong> Constant downward acceleration (9.81 m/s² on Earth)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>💨 <strong>Air Resistance:</strong> Opposes motion, reduces range and height</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🌬️ <strong>Wind:</strong> Horizontal force affecting trajectory</Typography>
          
          <Typography variant="h6" gutterBottom>How to Play:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>1️⃣ Adjust launch angle and velocity</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>2️⃣ Consider environmental factors (gravity, wind, air resistance)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>3️⃣ Use trajectory prediction to aim</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>4️⃣ Launch projectiles and hit targets</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>5️⃣ Analyze results to understand physics principles</Typography>
          
          <Alert severity="success">
            Experiment with different parameters to master projectile motion!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};