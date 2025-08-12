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
  level: number;
  highScore: number;
  isNewHighScore: boolean;
  onClose: () => void;
  onNewGame: () => void;
}

export const ResultDialog: React.FC<ResultDialogProps> = ({
  open,
  level,
  highScore,
  isNewHighScore,
  onClose,
  onNewGame
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem' }}>
        🎮 Game Over
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          You reached level {level}!
        </Typography>
        {isNewHighScore && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#7ee7c7', fontWeight: 'bold' }}>
              🎉 New High Score!
            </Typography>
          </Box>
        )}
        <Typography variant="body1" color="text.secondary">
          Your high score: {highScore}
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
