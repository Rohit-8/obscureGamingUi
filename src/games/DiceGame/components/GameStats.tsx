import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface GameStatsProps {
  score: number;
  bestScore: number;
  rollsLeft: number;
  currentRoundScore: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  score,
  bestScore,
  rollsLeft,
  currentRoundScore
}) => {
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 Game Stats
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Current Score: {score}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Best Score: {bestScore}
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Rolls Left: {rollsLeft}
        </Typography>
        {currentRoundScore > 0 && (
          <Typography variant="body2" sx={{ color: '#7ee7c7', fontWeight: 'bold' }}>
            Last Roll: +{currentRoundScore}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
