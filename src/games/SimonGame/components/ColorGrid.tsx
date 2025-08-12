import React from 'react';
import { Box } from '@mui/material';
import { ColorButton } from './ColorButton';
import { GameColor, ColorConfig } from '../types';

interface ColorGridProps {
  colorMap: Record<GameColor, ColorConfig>;
  activeColor: GameColor | null;
  onColorClick: (color: GameColor) => void;
  disabled: boolean;
}

export const ColorGrid: React.FC<ColorGridProps> = ({
  colorMap,
  activeColor,
  onColorClick,
  disabled
}) => {
  const colors: GameColor[] = ['red', 'blue', 'green', 'yellow'];

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 3,
      maxWidth: '280px',
      margin: '0 auto',
      mb: 4,
    }}>
      {colors.map((color) => (
        <ColorButton
          key={color}
          color={color}
          colorConfig={colorMap[color]}
          isActive={activeColor === color}
          onClick={onColorClick}
          disabled={disabled}
        />
      ))}
    </Box>
  );
};
