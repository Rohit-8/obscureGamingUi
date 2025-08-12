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

interface CongratsDialogProps {
  open: boolean;
  time: number;
  mistakes: number;
  difficulty: string;
  onClose: () => void;
  onNewGame: () => void;
}

export const CongratsDialog: React.FC<CongratsDialogProps> = ({
  open,
  time,
  mistakes,
  difficulty,
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
          You solved the Sudoku puzzle!
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Difficulty:</strong> {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Time:</strong> {formatTime(time)}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Mistakes:</strong> {mistakes}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Great job on completing this challenging puzzle!
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
          New Puzzle
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
