import React from 'react';
import { Box } from '@mui/material';
import { Player } from '../types';

interface GameBoardProps {
  board: Player[];
  onCellClick: (index: number) => void;
  isAiThinking: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, isAiThinking }) => {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 2,
      maxWidth: '300px',
      margin: '0 auto',
      mb: 3,
    }}>
      {board.map((cell, index) => (
        <Box
          key={index}
          onClick={() => onCellClick(index)}
          sx={{
            aspectRatio: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
            cursor: cell || isAiThinking ? 'default' : 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: cell || isAiThinking ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              transform: cell || isAiThinking ? 'none' : 'scale(1.05)',
            },
            color: cell === 'X' ? '#60a5fa' : '#7ee7c7',
          }}
        >
          {cell}
        </Box>
      ))}
    </Box>
  );
};
