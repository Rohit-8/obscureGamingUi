import React from 'react';
import { Box, Typography, Paper, Alert, Button } from '@mui/material';
import { Construction } from '@mui/icons-material';

interface ComingSoonGameProps {
  title: string;
  description: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics';
}

export const ComingSoonGame: React.FC<ComingSoonGameProps> = ({ title, description, subject }) => {
  const getSubjectColor = () => {
    switch (subject) {
      case 'Physics':
        return '#2196f3';
      case 'Chemistry':
        return '#4caf50';
      case 'Mathematics':
        return '#ff9800';
      default:
        return '#9c27b0';
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
        <Construction sx={{ fontSize: 60, color: getSubjectColor(), mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{
          background: `linear-gradient(45deg, ${getSubjectColor()}, ${getSubjectColor()}88)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {subject} Interactive Game
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.6 }}>
          {description}
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          This game is currently under development. We're creating an immersive and educational experience 
          that will help you understand {subject.toLowerCase()} concepts through interactive gameplay.
        </Alert>
        <Button 
          variant="outlined" 
          onClick={() => window.history.back()}
          sx={{ 
            borderColor: getSubjectColor(), 
            color: getSubjectColor(),
            '&:hover': {
              borderColor: getSubjectColor(),
              backgroundColor: `${getSubjectColor()}11`,
            }
          }}
        >
          Back to Game Selection
        </Button>
      </Paper>
    </Box>
  );
};

// Individual game exports
export const LensMirrorPlayground = () => (
  <ComingSoonGame 
    title="Lens & Mirror Playground"
    description="Place mirrors and lenses to guide light beams to targets. Simulates refraction, reflection, and image formation with realistic optics physics."
    subject="Physics"
  />
);

export const CircuitBuilder = () => (
  <ComingSoonGame 
    title="Circuit Builder"
    description="Drag-and-drop wires, resistors, batteries to complete functioning circuits. Real-time current flow visualization with brightness indicators."
    subject="Physics"
  />
);

export const HeatFlowSimulator = () => (
  <ComingSoonGame 
    title="Heat Flow Simulator"
    description="Simulate heat transfer between materials using conduction, convection, and radiation. Observe temperature changes and energy conservation."
    subject="Physics"
  />
);

export const ProjectileAdventure = () => (
  <ComingSoonGame 
    title="Projectile Adventure"
    description="Launch objects at different angles and speeds to hit moving targets. Visualizes trajectory, time of flight, range with real physics."
    subject="Physics"
  />
);

export const ChargeFieldExplorer = () => (
  <ComingSoonGame 
    title="Charge Field Explorer"
    description="Position charges to visualize electric field lines and potentials. Place test charges to meet specific field conditions."
    subject="Physics"
  />
);

export const LightMaze = () => (
  <ComingSoonGame 
    title="Light Maze"
    description="Solve puzzles by bending light with lenses and mirrors through complex mazes. Includes dispersion and curved mirror effects."
    subject="Physics"
  />
);

export const AtomBuilder = () => (
  <ComingSoonGame 
    title="Atom Builder & Radioactive Decay"
    description="Build stable atoms from protons, neutrons, and electrons. Simulate radioactive decay, observe half-life and decay chains."
    subject="Physics"
  />
);