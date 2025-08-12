import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';

interface ResultDialogProps {
  open: boolean;
  score: number;
  moves: number;
  timeElapsed: number;
  bestScore: number;
  isNewBest: boolean;
  onClose: () => void;
  onNewGame: () => void;
}

export const ResultDialog: React.FC<ResultDialogProps> = ({
  open,
  score,
  moves,
  timeElapsed,
  bestScore,
  isNewBest,
  onClose,
  onNewGame
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
        🎉 Congratulations!
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          You matched all pairs!
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Final Score:</strong> {score}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Moves:</strong> {moves}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Time:</strong> {formatTime(timeElapsed)}
          </Typography>
        </Box>

        {isNewBest && (
          <Typography variant="h6" sx={{ color: '#7ee7c7', fontWeight: 'bold', mb: 2 }}>
            🏆 New Best Score!
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary">
          Best Score: {bestScore}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
        <Button
          variant="contained"
          onClick={() => {
            onNewGame();
            onClose();
          }}
          sx={{
            background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
            '&:hover': {
              background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)',
            },
          }}
        >
          Play Again
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
