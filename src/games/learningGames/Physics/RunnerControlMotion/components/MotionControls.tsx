import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Slider,
  Grid,
  Chip,
} from '@mui/material';
import { Speed, TrendingUp } from '@mui/icons-material';
import { Velocity } from '../../../types';

interface MotionControlsProps {
  velocity: Velocity;
  acceleration: Velocity;
  onVelocityChange: (velocity: Velocity) => void;
  onAccelerationChange: (acceleration: Velocity) => void;
  disabled?: boolean;
}

export const MotionControls: React.FC<MotionControlsProps> = ({
  velocity,
  acceleration,
  onVelocityChange,
  onAccelerationChange,
  disabled = false,
}) => {
  const handleVelocityXChange = (_: Event, value: number | number[]) => {
    onVelocityChange({
      ...velocity,
      vx: Array.isArray(value) ? value[0] : value,
    });
  };

  const handleVelocityYChange = (_: Event, value: number | number[]) => {
    onVelocityChange({
      ...velocity,
      vy: Array.isArray(value) ? value[0] : value,
    });
  };

  const handleAccelerationXChange = (_: Event, value: number | number[]) => {
    onAccelerationChange({
      ...acceleration,
      vx: Array.isArray(value) ? value[0] : value,
    });
  };

  const handleAccelerationYChange = (_: Event, value: number | number[]) => {
    onAccelerationChange({
      ...acceleration,
      vy: Array.isArray(value) ? value[0] : value,
    });
  };

  const speed = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2);
  const accelerationMagnitude = Math.sqrt(acceleration.vx ** 2 + acceleration.vy ** 2);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed color="primary" />
        Motion Controls
      </Typography>

      <Grid container spacing={2}>
        {/* Current Values Display */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              icon={<Speed />}
              label={`Speed: ${speed.toFixed(1)} px/s`}
              color="primary"
              size="small"
            />
            <Chip
              icon={<TrendingUp />}
              label={`Accel: ${accelerationMagnitude.toFixed(1)} px/s²`}
              color="secondary"
              size="small"
            />
          </Box>
        </Grid>

        {/* Velocity Controls */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Velocity (px/s)
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Horizontal Velocity: {velocity.vx.toFixed(1)} px/s
          </Typography>
          <Slider
            value={velocity.vx}
            onChange={handleVelocityXChange}
            min={-200}
            max={200}
            step={5}
            disabled={disabled}
            valueLabelDisplay="auto"
            color="primary"
            marks={[
              { value: -200, label: '-200' },
              { value: 0, label: '0' },
              { value: 200, label: '200' },
            ]}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Vertical Velocity: {velocity.vy.toFixed(1)} px/s
          </Typography>
          <Slider
            value={velocity.vy}
            onChange={handleVelocityYChange}
            min={-200}
            max={200}
            step={5}
            disabled={disabled}
            valueLabelDisplay="auto"
            color="primary"
            marks={[
              { value: -200, label: '-200' },
              { value: 0, label: '0' },
              { value: 200, label: '200' },
            ]}
          />
        </Grid>

        {/* Acceleration Controls */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
            Acceleration (px/s²)
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Horizontal Acceleration: {acceleration.vx.toFixed(1)} px/s²
          </Typography>
          <Slider
            value={acceleration.vx}
            onChange={handleAccelerationXChange}
            min={-100}
            max={100}
            step={2}
            disabled={disabled}
            valueLabelDisplay="auto"
            color="secondary"
            marks={[
              { value: -100, label: '-100' },
              { value: 0, label: '0' },
              { value: 100, label: '100' },
            ]}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Vertical Acceleration: {acceleration.vy.toFixed(1)} px/s²
          </Typography>
          <Slider
            value={acceleration.vy}
            onChange={handleAccelerationYChange}
            min={-100}
            max={100}
            step={2}
            disabled={disabled}
            valueLabelDisplay="auto"
            color="secondary"
            marks={[
              { value: -100, label: '-100' },
              { value: 0, label: '0' },
              { value: 100, label: '100' },
            ]}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};