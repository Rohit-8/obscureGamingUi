import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { Player } from '../types';

interface ResultDialogProps {
  open: boolean;
  winner: Player | 'draw' | null;
  onClose: () => void;
  onNewGame: () => void;
}

export const ResultDialog: React.FC<ResultDialogProps> = ({
  open,
  winner,
  onClose,
  onNewGame
}) => {
  const getResultMessage = () => {
    if (winner === 'draw') return '🤝 It\'s a Draw!';
    if (winner === 'X') return '🎉 Player X Wins!';
    if (winner === 'O') return '🎉 Player O Wins!';
    return '';
  };

  const getResultEmoji = () => {
    if (winner === 'draw') return '🤝';
    return '🎉';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
        {getResultEmoji()} Game Over
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {getResultMessage()}
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
          New Game
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
