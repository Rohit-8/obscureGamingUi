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
  Science, 
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

interface Particle {
  id: string;
  type: 'proton' | 'neutron' | 'electron';
  x: number;
  y: number;
  vx: number;
  vy: number;
  orbitalRadius?: number;
  orbitalAngle?: number;
  energy?: number;
  shell?: number;
  subshell?: string;
}

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  massNumber: number;
  electronConfig: string;
  shells: number[];
}

interface NuclearReaction {
  type: 'alpha' | 'beta' | 'gamma' | 'fusion' | 'fission';
  energy: number;
  products: string[];
}

export const AtomicStructure: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [protonCount, setProtonCount] = useState(1);
  const [neutronCount, setNeutronCount] = useState(1);
  const [electronCount, setElectronCount] = useState(1);
  const [selectedParticle, setSelectedParticle] = useState<'proton' | 'neutron' | 'electron'>('proton');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showElectronClouds, setShowElectronClouds] = useState(true);
  const [showEnergyLevels, setShowEnergyLevels] = useState(true);
  const [showNuclearForces, setShowNuclearForces] = useState(false);
  const [viewMode, setViewMode] = useState<'classical' | 'quantum' | 'hybrid'>('classical');
  const [nuclearReactions, setNuclearReactions] = useState<NuclearReaction[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1.0);
  const [zoom, setZoom] = useState(1.0);
  const [score, setScore] = useState(0);
  const [atomsBuilt, setAtomsBuilt] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedIsotope, setSelectedIsotope] = useState<string>('H-1');

  const CANVAS_WIDTH = 900;
  const CANVAS_HEIGHT = 600;
  const NUCLEUS_RADIUS = 20;
  const ORBITAL_RADII = [80, 120, 160, 200, 240];
  const SHELL_CAPACITY = [2, 8, 18, 32, 32];

  const elements: Element[] = [
    { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, massNumber: 1, electronConfig: '1s¹', shells: [1] },
    { symbol: 'He', name: 'Helium', atomicNumber: 2, massNumber: 4, electronConfig: '1s²', shells: [2] },
    { symbol: 'Li', name: 'Lithium', atomicNumber: 3, massNumber: 7, electronConfig: '1s² 2s¹', shells: [2, 1] },
    { symbol: 'Be', name: 'Beryllium', atomicNumber: 4, massNumber: 9, electronConfig: '1s² 2s²', shells: [2, 2] },
    { symbol: 'B', name: 'Boron', atomicNumber: 5, massNumber: 11, electronConfig: '1s² 2s² 2p¹', shells: [2, 3] },
    { symbol: 'C', name: 'Carbon', atomicNumber: 6, massNumber: 12, electronConfig: '1s² 2s² 2p²', shells: [2, 4] },
    { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, massNumber: 14, electronConfig: '1s² 2s² 2p³', shells: [2, 5] },
    { symbol: 'O', name: 'Oxygen', atomicNumber: 8, massNumber: 16, electronConfig: '1s² 2s² 2p⁴', shells: [2, 6] },
    { symbol: 'F', name: 'Fluorine', atomicNumber: 9, massNumber: 19, electronConfig: '1s² 2s² 2p⁵', shells: [2, 7] },
    { symbol: 'Ne', name: 'Neon', atomicNumber: 10, massNumber: 20, electronConfig: '1s² 2s² 2p⁶', shells: [2, 8] },
  ];

  const isotopes = [
    'H-1', 'H-2', 'H-3', 'He-3', 'He-4', 'Li-6', 'Li-7', 'C-12', 'C-13', 'C-14',
    'N-14', 'N-15', 'O-16', 'O-17', 'O-18', 'U-235', 'U-238', 'Pu-239'
  ];

  const generateAtomFromElement = (element: Element) => {
    const newParticles: Particle[] = [];
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // Generate protons in nucleus
    for (let i = 0; i < element.atomicNumber; i++) {
      const angle = (i / element.atomicNumber) * 2 * Math.PI;
      const radius = NUCLEUS_RADIUS * 0.6;
      newParticles.push({
        id: `proton-${i}`,
        type: 'proton',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      });
    }

    // Generate neutrons in nucleus
    const neutrons = element.massNumber - element.atomicNumber;
    for (let i = 0; i < neutrons; i++) {
      const angle = (i / neutrons) * 2 * Math.PI + Math.PI / neutrons;
      const radius = NUCLEUS_RADIUS * 0.7;
      newParticles.push({
        id: `neutron-${i}`,
        type: 'neutron',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      });
    }

    // Generate electrons in shells
    let electronIndex = 0;
    element.shells.forEach((shellElectrons, shellIndex) => {
      const orbitalRadius = ORBITAL_RADII[shellIndex];
      for (let i = 0; i < shellElectrons; i++) {
        const angle = (i / shellElectrons) * 2 * Math.PI;
        const speed = 0.02 + shellIndex * 0.01;
        newParticles.push({
          id: `electron-${electronIndex}`,
          type: 'electron',
          x: centerX + Math.cos(angle) * orbitalRadius,
          y: centerY + Math.sin(angle) * orbitalRadius,
          vx: -Math.sin(angle) * speed,
          vy: Math.cos(angle) * speed,
          orbitalRadius,
          orbitalAngle: angle,
          energy: -13.6 / ((shellIndex + 1) ** 2), // Simplified energy levels
          shell: shellIndex + 1,
          subshell: getSubshell(shellIndex, i),
        });
        electronIndex++;
      }
    });

    setParticles(newParticles);
    setProtonCount(element.atomicNumber);
    setNeutronCount(neutrons);
    setElectronCount(element.atomicNumber);
    setCurrentElement(element);
  };

  const getSubshell = (shell: number, position: number): string => {
    const subshells = [
      ['s'],
      ['s', 'p'],
      ['s', 'p', 'd'],
      ['s', 'p', 'd', 'f'],
      ['s', 'p', 'd', 'f'],
    ];
    
    if (shell === 0) return 's';
    if (shell === 1) return position < 2 ? 's' : 'p';
    // Simplified for demonstration
    return 's';
  };

  const addParticle = () => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    
    if (selectedParticle === 'proton') {
      const angle = Math.random() * 2 * Math.PI;
      const radius = NUCLEUS_RADIUS * 0.6;
      const newParticle: Particle = {
        id: `proton-${Date.now()}`,
        type: 'proton',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
      setParticles(prev => [...prev, newParticle]);
      setProtonCount(prev => prev + 1);
      setScore(prev => prev + 5);
    } else if (selectedParticle === 'neutron') {
      const angle = Math.random() * 2 * Math.PI;
      const radius = NUCLEUS_RADIUS * 0.7;
      const newParticle: Particle = {
        id: `neutron-${Date.now()}`,
        type: 'neutron',
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
      };
      setParticles(prev => [...prev, newParticle]);
      setNeutronCount(prev => prev + 1);
      setScore(prev => prev + 5);
    } else if (selectedParticle === 'electron') {
      const shell = Math.floor(electronCount / 2); // Simplified shell assignment
      const orbitalRadius = ORBITAL_RADII[Math.min(shell, ORBITAL_RADII.length - 1)];
      const angle = Math.random() * 2 * Math.PI;
      const speed = 0.02 + shell * 0.01;
      
      const newParticle: Particle = {
        id: `electron-${Date.now()}`,
        type: 'electron',
        x: centerX + Math.cos(angle) * orbitalRadius,
        y: centerY + Math.sin(angle) * orbitalRadius,
        vx: -Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed,
        orbitalRadius,
        orbitalAngle: angle,
        energy: -13.6 / ((shell + 1) ** 2),
        shell: shell + 1,
      };
      setParticles(prev => [...prev, newParticle]);
      setElectronCount(prev => prev + 1);
      setScore(prev => prev + 10);
    }
    
    updateCurrentElement();
  };

  const removeParticle = () => {
    const particlesToRemove = particles.filter(p => p.type === selectedParticle);
    if (particlesToRemove.length > 0) {
      const particleToRemove = particlesToRemove[particlesToRemove.length - 1];
      setParticles(prev => prev.filter(p => p.id !== particleToRemove.id));
      
      if (selectedParticle === 'proton') {
        setProtonCount(prev => Math.max(0, prev - 1));
      } else if (selectedParticle === 'neutron') {
        setNeutronCount(prev => Math.max(0, prev - 1));
      } else if (selectedParticle === 'electron') {
        setElectronCount(prev => Math.max(0, prev - 1));
      }
      
      updateCurrentElement();
    }
  };

  const updateCurrentElement = () => {
    const element = elements.find(e => e.atomicNumber === protonCount);
    setCurrentElement(element || null);
    if (element) {
      setAtomsBuilt(prev => prev + 1);
      setScore(prev => prev + 25);
    }
  };

  const updateParticles = () => {
    if (!isAnimating) return;

    setParticles(prevParticles => 
      prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalRadius) {
          // Update electron orbital motion
          const centerX = CANVAS_WIDTH / 2;
          const centerY = CANVAS_HEIGHT / 2;
          const angularSpeed = particle.vx ? Math.sqrt(particle.vx ** 2 + particle.vy ** 2) : 0.02;
          
          let newAngle = particle.orbitalAngle || 0;
          newAngle += angularSpeed * animationSpeed;
          
          return {
            ...particle,
            x: centerX + Math.cos(newAngle) * particle.orbitalRadius,
            y: centerY + Math.sin(newAngle) * particle.orbitalRadius,
            orbitalAngle: newAngle,
          };
        } else if (particle.type === 'proton' || particle.type === 'neutron') {
          // Nuclear particles have small random motion
          return {
            ...particle,
            x: particle.x + (Math.random() - 0.5) * 0.5 * animationSpeed,
            y: particle.y + (Math.random() - 0.5) * 0.5 * animationSpeed,
          };
        }
        return particle;
      })
    );
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const colors = {
      proton: '#ff4444',
      neutron: '#888888',
      electron: '#4444ff',
    };

    const sizes = {
      proton: 6,
      neutron: 6,
      electron: 3,
    };

    ctx.fillStyle = colors[particle.type];
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, sizes[particle.type] * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Add glow effect
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, sizes[particle.type] * zoom * 2
    );
    gradient.addColorStop(0, colors[particle.type] + '80');
    gradient.addColorStop(1, colors[particle.type] + '00');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, sizes[particle.type] * zoom * 2, 0, 2 * Math.PI);
    ctx.fill();

    // Add charge symbols
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (particle.type === 'proton') {
      ctx.fillText('+', particle.x, particle.y);
    } else if (particle.type === 'electron') {
      ctx.fillText('-', particle.x, particle.y);
    }
  };

  const drawOrbitalShells = (ctx: CanvasRenderingContext2D) => {
    if (!showEnergyLevels) return;

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    ORBITAL_RADII.forEach((radius, index) => {
      ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * zoom, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Shell labels
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `n=${index + 1}`,
        centerX + radius * zoom * 0.707,
        centerY - radius * zoom * 0.707
      );
    });
  };

  const drawElectronClouds = (ctx: CanvasRenderingContext2D) => {
    if (!showElectronClouds || viewMode === 'classical') return;

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const electrons = particles.filter(p => p.type === 'electron');

    electrons.forEach(electron => {
      if (electron.orbitalRadius) {
        // Draw probability cloud
        const cloudRadius = electron.orbitalRadius * 0.3;
        const gradient = ctx.createRadialGradient(
          centerX, centerY, electron.orbitalRadius - cloudRadius,
          centerX, centerY, electron.orbitalRadius + cloudRadius
        );
        gradient.addColorStop(0, 'rgba(68, 68, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(68, 68, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(68, 68, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, electron.orbitalRadius + cloudRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY, electron.orbitalRadius - cloudRadius, 0, 2 * Math.PI);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
    });
  };

  const drawNucleus = (ctx: CanvasRenderingContext2D) => {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;

    // Draw nucleus boundary
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, NUCLEUS_RADIUS * zoom, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw nuclear forces if enabled
    if (showNuclearForces) {
      const nuclearParticles = particles.filter(p => p.type === 'proton' || p.type === 'neutron');
      
      nuclearParticles.forEach((p1, i) => {
        nuclearParticles.slice(i + 1).forEach(p2 => {
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          if (distance < NUCLEUS_RADIUS * 1.5) {
            ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });
    }
  };

  const drawAtomInfo = (ctx: CanvasRenderingContext2D) => {
    // Info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(10, 10, 280, 180);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 280, 180);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Atomic Structure Builder', 20, 30);

    ctx.font = '12px Arial';
    ctx.fillText(`Protons: ${protonCount}`, 20, 50);
    ctx.fillText(`Neutrons: ${neutronCount}`, 20, 65);
    ctx.fillText(`Electrons: ${electronCount}`, 20, 80);
    ctx.fillText(`Mass Number: ${protonCount + neutronCount}`, 20, 95);

    if (currentElement) {
      ctx.fillText(`Element: ${currentElement.name} (${currentElement.symbol})`, 20, 115);
      ctx.fillText(`Electron Config: ${currentElement.electronConfig}`, 20, 130);
      
      const charge = protonCount - electronCount;
      if (charge !== 0) {
        ctx.fillText(`Charge: ${charge > 0 ? '+' : ''}${charge}`, 20, 145);
      }
    } else {
      ctx.fillText('Unknown Element', 20, 115);
    }

    // Energy levels info
    if (showEnergyLevels) {
      ctx.fillText('Energy Levels (eV):', 20, 165);
      const electrons = particles.filter(p => p.type === 'electron');
      const totalEnergy = electrons.reduce((sum, e) => sum + (e.energy || 0), 0);
      ctx.fillText(`Total: ${totalEnergy.toFixed(2)} eV`, 150, 165);
    }
  };

  const drawIsotopeSelector = (ctx: CanvasRenderingContext2D) => {
    // Isotope info panel
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(CANVAS_WIDTH - 200, 10, 180, 100);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_WIDTH - 200, 10, 180, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Current Isotope', CANVAS_WIDTH - 190, 30);

    ctx.font = '12px Arial';
    ctx.fillText(`Selected: ${selectedIsotope}`, CANVAS_WIDTH - 190, 50);
    
    if (currentElement) {
      const stability = neutronCount === protonCount ? 'Stable' : 
                       Math.abs(neutronCount - protonCount) <= 2 ? 'Semi-stable' : 'Unstable';
      ctx.fillText(`Stability: ${stability}`, CANVAS_WIDTH - 190, 70);
      
      if (stability === 'Unstable') {
        ctx.fillStyle = '#ff4444';
        ctx.fillText('⚡ Radioactive', CANVAS_WIDTH - 190, 90);
      }
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

    // Draw quantum electron clouds first (behind everything)
    drawElectronClouds(ctx);

    // Draw orbital shells
    drawOrbitalShells(ctx);

    // Draw nucleus
    drawNucleus(ctx);

    // Draw all particles
    particles.forEach(particle => drawParticle(ctx, particle));

    // Draw UI elements
    drawAtomInfo(ctx);
    drawIsotopeSelector(ctx);
  };

  const loadIsotope = (isotope: string) => {
    const [elementSymbol, massStr] = isotope.split('-');
    const mass = parseInt(massStr);
    
    const element = elements.find(e => e.symbol === elementSymbol);
    if (element) {
      const neutrons = mass - element.atomicNumber;
      const modifiedElement = { ...element, massNumber: mass };
      generateAtomFromElement(modifiedElement);
      setSelectedIsotope(isotope);
      setScore(prev => prev + 15);
    }
  };

  const simulateDecay = () => {
    if (neutronCount > protonCount + 2) {
      // Beta decay: neutron -> proton + electron + antineutrino
      setNeutronCount(prev => prev - 1);
      setProtonCount(prev => prev + 1);
      setElectronCount(prev => prev + 1);
      
      setNuclearReactions(prev => [...prev, {
        type: 'beta',
        energy: 1.5, // MeV
        products: ['proton', 'electron', 'antineutrino']
      }]);
      
      setScore(prev => prev + 30);
    }
  };

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const resetAtom = () => {
    setParticles([]);
    setProtonCount(1);
    setNeutronCount(1);
    setElectronCount(1);
    setCurrentElement(null);
    setNuclearReactions([]);
    generateAtomFromElement(elements[0]); // Start with Hydrogen
  };

  useEffect(() => {
    generateAtomFromElement(elements[0]); // Start with Hydrogen
  }, []);

  useEffect(() => {
    updateVisualization();
  }, [particles, showElectronClouds, showEnergyLevels, showNuclearForces, viewMode, zoom]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateParticles();
    }, 50);

    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed]);

  return (
    <Box sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%)', 
      minHeight: '100vh' 
    }}>
      <Typography variant="h3" gutterBottom sx={{
        background: 'linear-gradient(45deg, #f44336, #ff9800)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        mb: 4,
        fontWeight: 'bold',
      }}>
        ⚛️ Atomic Structure Builder
      </Typography>

      <Grid container spacing={3}>
        {/* Controls */}
        <Grid item xs={12}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.15) 0%, rgba(255, 152, 0, 0.05) 100%)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
          }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Particle Type</InputLabel>
                    <Select
                      value={selectedParticle}
                      onChange={(e) => setSelectedParticle(e.target.value as any)}
                    >
                      <MenuItem value="proton">🔴 Proton</MenuItem>
                      <MenuItem value="neutron">⚪ Neutron</MenuItem>
                      <MenuItem value="electron">🔵 Electron</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <ButtonGroup variant="contained" size="small">
                    <Button onClick={addParticle} startIcon={<Add />}>
                      Add
                    </Button>
                    <Button onClick={removeParticle} startIcon={<Remove />}>
                      Remove
                    </Button>
                  </ButtonGroup>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>View Mode</InputLabel>
                    <Select
                      value={viewMode}
                      onChange={(e) => setViewMode(e.target.value as any)}
                    >
                      <MenuItem value="classical">Classical</MenuItem>
                      <MenuItem value="quantum">Quantum</MenuItem>
                      <MenuItem value="hybrid">Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Isotope</InputLabel>
                    <Select
                      value={selectedIsotope}
                      onChange={(e) => loadIsotope(e.target.value)}
                    >
                      {isotopes.map(isotope => (
                        <MenuItem key={isotope} value={isotope}>{isotope}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" gutterBottom>Animation Speed: {animationSpeed.toFixed(1)}x</Typography>
                  <Slider
                    value={animationSpeed}
                    onChange={(_, value) => setAnimationSpeed(value as number)}
                    min={0.1}
                    max={3.0}
                    step={0.1}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Typography variant="body2" gutterBottom>Zoom: {zoom.toFixed(1)}x</Typography>
                  <Slider
                    value={zoom}
                    onChange={(_, value) => setZoom(value as number)}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    size="small"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showElectronClouds}
                      onChange={(e) => setShowElectronClouds(e.target.checked)}
                    />
                  }
                  label="Electron Clouds"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showEnergyLevels}
                      onChange={(e) => setShowEnergyLevels(e.target.checked)}
                    />
                  }
                  label="Energy Levels"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showNuclearForces}
                      onChange={(e) => setShowNuclearForces(e.target.checked)}
                    />
                  }
                  label="Nuclear Forces"
                />

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip 
                    icon={<Science />} 
                    label={`Score: ${score}`} 
                    color="primary" 
                    size="small"
                  />
                  <Chip 
                    label={`Atoms Built: ${atomsBuilt}`} 
                    color="success" 
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={isAnimating ? <Pause /> : <PlayArrow />}
                  onClick={toggleAnimation}
                  sx={{
                    background: isAnimating ? 
                      'linear-gradient(45deg, #f44336, #ff9800)' :
                      'linear-gradient(45deg, #4caf50, #8bc34a)',
                    fontWeight: 'bold',
                  }}
                >
                  {isAnimating ? '⏸️ Pause' : '▶️ Start'} Animation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetAtom}
                  sx={{ borderColor: '#f44336', color: '#f44336' }}
                >
                  🔄 Reset Atom
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FlashOn />}
                  onClick={simulateDecay}
                  sx={{ borderColor: '#ff9800', color: '#ff9800' }}
                >
                  ⚡ Simulate Decay
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Info />}
                  onClick={() => setShowHelp(true)}
                  sx={{ borderColor: '#f44336', color: '#f44336' }}
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
            border: '2px solid rgba(244, 67, 54, 0.3)',
            borderRadius: 3,
          }}>
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              style={{
                border: '1px solid rgba(244, 67, 54, 0.3)',
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

        {/* Element Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🧪 Current Element
              </Typography>
              {currentElement ? (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {currentElement.symbol}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    {currentElement.name}
                  </Typography>
                  <Typography variant="body2">
                    Atomic Number: {currentElement.atomicNumber}
                  </Typography>
                  <Typography variant="body2">
                    Mass Number: {protonCount + neutronCount}
                  </Typography>
                  <Typography variant="body2">
                    Electron Configuration: {currentElement.electronConfig}
                  </Typography>
                  <Typography variant="body2">
                    Charge: {protonCount - electronCount > 0 ? '+' : ''}{protonCount - electronCount}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Build an atom to see element information
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Nuclear Reactions */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
            border: '1px solid rgba(244, 67, 54, 0.2)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ⚡ Nuclear Reactions
              </Typography>
              {nuclearReactions.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
                  {nuclearReactions.map((reaction, index) => (
                    <Alert key={index} severity="info" sx={{ mb: 1 }}>
                      <Typography variant="body2">
                        {reaction.type.toUpperCase()} decay: {reaction.energy} MeV
                      </Typography>
                      <Typography variant="caption">
                        Products: {reaction.products.join(', ')}
                      </Typography>
                    </Alert>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No nuclear reactions yet. Try simulating decay for unstable isotopes!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Dialog */}
      <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md">
        <DialogTitle>⚛️ Atomic Structure Guide</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Build atoms and explore nuclear physics through interactive simulation!
          </Typography>
          
          <Typography variant="h6" gutterBottom>Building Atoms:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔴 <strong>Protons:</strong> Define the element (atomic number)</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚪ <strong>Neutrons:</strong> Affect mass and stability</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>🔵 <strong>Electrons:</strong> Occupy energy shells, determine charge</Typography>
          
          <Typography variant="h6" gutterBottom>View Modes:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🎯 <strong>Classical:</strong> Electrons in defined orbits</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌊 <strong>Quantum:</strong> Probability clouds and wave functions</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>⚖️ <strong>Hybrid:</strong> Both classical and quantum representations</Typography>
          
          <Typography variant="h6" gutterBottom>Features:</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>⚡ <strong>Nuclear Decay:</strong> Simulate radioactive processes</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🌀 <strong>Isotopes:</strong> Different neutron configurations</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>🔋 <strong>Energy Levels:</strong> Electron shell energies</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>💫 <strong>Nuclear Forces:</strong> Strong force interactions</Typography>
          
          <Alert severity="success">
            Try building different elements and isotopes to earn points!
          </Alert>
        </DialogContent>
      </Dialog>
    </Box>
  );
};