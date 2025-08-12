import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export const ScoringRules: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          🏆 Scoring Rules
        </Typography>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>🎰 Triple Same:</strong> Sum × 10
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>🎲 Straight:</strong> Sum × 4
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>🎯 Triple Different:</strong> Sum × 3
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>👥 Pair:</strong> Sum × 2
          </Typography>
          <Typography variant="body2">
            <strong>🎮 Regular:</strong> Sum × 1
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
