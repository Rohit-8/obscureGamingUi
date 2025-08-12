import React from 'react';
import {
  Box,
  Button,
  Slider,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  FormControlLabel,
  Paper,
  Grid
} from '@mui/material';
import { PlayArrow, Stop, Clear } from '@mui/icons-material';
import { PhysicsSettings, SimulationType } from '../types';

interface ControlPanelProps {
  isRunning: boolean;
  simulationType: SimulationType;
  settings: PhysicsSettings;
  showTrails: boolean;
  showVectors: boolean;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onSimulationTypeChange: (type: SimulationType) => void;
  onSettingsChange: (settings: Partial<PhysicsSettings>) => void;
  onToggleTrails: () => void;
  onToggleVectors: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isRunning,
  simulationType,
  settings,
  showTrails,
  showVectors,
  onStart,
  onStop,
  onClear,
  onSimulationTypeChange,
  onSettingsChange,
  onToggleTrails,
  onToggleVectors
}) => {
  return (
    <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
      <Typography variant="h6" gutterBottom>Physics Controls</Typography>

      {/* Simulation Controls */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Simulation</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant={isRunning ? 'outlined' : 'contained'}
            onClick={isRunning ? onStop : onStart}
            startIcon={isRunning ? <Stop /> : <PlayArrow />}
            sx={{ flex: 1 }}
          >
            {isRunning ? 'Stop' : 'Start'}
          </Button>
          <Button variant="outlined" onClick={onClear} startIcon={<Clear />}>
            Clear
          </Button>
        </Box>
      </Box>

      {/* Simulation Type */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Simulation Type</Typography>
        <ToggleButtonGroup
          value={simulationType}
          exclusive
          onChange={(_, value) => value && onSimulationTypeChange(value)}
          size="small"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
        >
          <ToggleButton value="gravity">Gravity</ToggleButton>
          <ToggleButton value="collision">Collision</ToggleButton>
          <ToggleButton value="orbit">Orbit</ToggleButton>
          <ToggleButton value="pendulum">Pendulum</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Physics Settings */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2">Gravity: {settings.gravity.toFixed(2)}</Typography>
          <Slider
            value={settings.gravity}
            min={0}
            max={2}
            step={0.1}
            onChange={(_, value) => onSettingsChange({ gravity: value as number })}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Bounce: {settings.bounce.toFixed(2)}</Typography>
          <Slider
            value={settings.bounce}
            min={0}
            max={1}
            step={0.1}
            onChange={(_, value) => onSettingsChange({ bounce: value as number })}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Friction: {settings.friction.toFixed(3)}</Typography>
          <Slider
            value={settings.friction}
            min={0.9}
            max={1}
            step={0.001}
            onChange={(_, value) => onSettingsChange({ friction: value as number })}
            size="small"
          />
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2">Air Resistance: {settings.airResistance.toFixed(3)}</Typography>
          <Slider
            value={settings.airResistance}
            min={0.99}
            max={1}
            step={0.001}
            onChange={(_, value) => onSettingsChange({ airResistance: value as number })}
            size="small"
          />
        </Grid>
      </Grid>

      {/* Visual Options */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Visual Options</Typography>
        <FormControlLabel
          control={<Switch checked={showTrails} onChange={onToggleTrails} />}
          label="Show Trails"
        />
        <FormControlLabel
          control={<Switch checked={showVectors} onChange={onToggleVectors} />}
          label="Show Velocity Vectors"
        />
      </Box>

      {/* Instructions */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Instructions:</strong><br />
          • Click on the canvas to add balls<br />
          • Try different simulation types<br />
          • Adjust physics parameters in real-time<br />
          • Watch how different settings affect motion
        </Typography>
      </Box>
    </Paper>
  );
};
