import React from 'react';
import { Box } from '@mui/material';
import { Die } from '../types';

const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

interface DiceDisplayProps {
  dice: Die[];
}

export const DiceDisplay: React.FC<DiceDisplayProps> = ({ dice }) => {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      gap: 3,
      mb: 4
    }}>
      {dice.map((die, index) => (
        <Box
          key={index}
          sx={{
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4rem',
            border: '3px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
            backgroundColor: die.isRolling
              ? 'rgba(96, 165, 250, 0.3)'
              : 'rgba(255,255,255,0.1)',
            transform: die.isRolling ? 'rotate(360deg)' : 'none',
            transition: 'all 0.1s ease',
          }}
        >
          {diceEmojis[die.value - 1]}
        </Box>
      ))}
    </Box>
  );
};
