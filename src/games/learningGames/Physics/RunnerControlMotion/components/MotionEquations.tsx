import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Divider,
} from '@mui/material';
import { Functions } from '@mui/icons-material';
import { Position, Velocity } from '../../../types';

interface MotionEquationsProps {
  position: Position;
  velocity: Velocity;
  acceleration: Velocity;
  timeElapsed: number;
}

export const MotionEquations: React.FC<MotionEquationsProps> = ({
  position,
  velocity,
  acceleration,
  timeElapsed,
}) => {
  const formatNumber = (num: number, decimals: number = 1) => {
    return num.toFixed(decimals);
  };

  const speed = Math.sqrt(velocity.vx ** 2 + velocity.vy ** 2);
  const accelerationMagnitude = Math.sqrt(acceleration.vx ** 2 + acceleration.vy ** 2);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Functions color="primary" />
        Motion Equations
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Real-time physics calculations based on kinematic equations
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell><strong>Time (t)</strong></TableCell>
              <TableCell>{formatNumber(timeElapsed)} s</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Position (x, y)</strong></TableCell>
              <TableCell>
                ({formatNumber(position.x)}, {formatNumber(position.y)}) px
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Velocity (vₓ, vᵧ)</strong></TableCell>
              <TableCell>
                ({formatNumber(velocity.vx)}, {formatNumber(velocity.vy)}) px/s
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Speed |v|</strong></TableCell>
              <TableCell>{formatNumber(speed)} px/s</TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>Acceleration (aₓ, aᵧ)</strong></TableCell>
              <TableCell>
                ({formatNumber(acceleration.vx)}, {formatNumber(acceleration.vy)}) px/s²
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell><strong>|Acceleration|</strong></TableCell>
              <TableCell>{formatNumber(accelerationMagnitude)} px/s²</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          📚 Kinematic Equations Used:
        </Typography>
        <Box sx={{ fontSize: '0.85rem', color: 'text.secondary', lineHeight: 1.6 }}>
          <div><strong>Position:</strong> x = x₀ + v₀t + ½at²</div>
          <div><strong>Velocity:</strong> v = v₀ + at</div>
          <div><strong>Speed:</strong> |v| = √(vₓ² + vᵧ²)</div>
          <div><strong>Direction:</strong> θ = tan⁻¹(vᵧ/vₓ)</div>
        </Box>
      </Box>
    </Paper>
  );
};