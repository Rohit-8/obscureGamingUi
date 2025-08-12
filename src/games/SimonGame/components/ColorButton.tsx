import React from 'react';
import { Box } from '@mui/material';
import { GameColor, ColorConfig } from '../types';

interface ColorButtonProps {
  color: GameColor;
  colorConfig: ColorConfig;
  isActive: boolean;
  onClick: (color: GameColor) => void;
  disabled: boolean;
}

export const ColorButton: React.FC<ColorButtonProps> = ({
  color,
  colorConfig,
  isActive,
  onClick,
  disabled
}) => {
  return (
    <Box
      onClick={() => !disabled && onClick(color)}
      sx={{
        width: 120,
        height: 120,
        backgroundColor: isActive ? colorConfig.active : colorConfig.bg,
        border: '3px solid rgba(255,255,255,0.3)',
        borderRadius: 2,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        filter: isActive ? 'brightness(1.3)' : 'brightness(0.8)',
        '&:hover': {
          filter: disabled ? 'brightness(0.8)' : 'brightness(1.1)',
          transform: disabled ? 'scale(1)' : 'scale(1.02)',
        },
        boxShadow: isActive ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
      }}
    />
  );
};
