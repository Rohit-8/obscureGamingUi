import React from 'react';
import { Box, Grid } from '@mui/material';
import { SudokuGrid, SudokuCell } from '../types';

interface SudokuBoardProps {
  grid: SudokuGrid;
  initialGrid: SudokuGrid;
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  grid,
  initialGrid,
  selectedCell,
  onCellClick
}) => {
  const getCellStyle = (row: number, col: number) => {
    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
    const isPrefilled = initialGrid[row][col] !== null;
    const isInSameRow = selectedCell?.row === row;
    const isInSameCol = selectedCell?.col === col;
    const isInSameBox = selectedCell &&
      Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
      Math.floor(selectedCell.col / 3) === Math.floor(col / 3);

    return {
      width: 40,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      fontWeight: isPrefilled ? 'bold' : 'normal',
      color: isPrefilled ? '#fff' : '#7ee7c7',
      backgroundColor: isSelected
        ? 'rgba(96, 165, 250, 0.5)'
        : isInSameRow || isInSameCol || isInSameBox
          ? 'rgba(255, 255, 255, 0.1)'
          : 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRight: col % 3 === 2 ? '3px solid rgba(255, 255, 255, 0.4)' : undefined,
      borderBottom: row % 3 === 2 ? '3px solid rgba(255, 255, 255, 0.4)' : undefined,
      cursor: isPrefilled ? 'default' : 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: isPrefilled
          ? undefined
          : 'rgba(255, 255, 255, 0.15)',
      }
    };
  };

  return (
    <Box sx={{ display: 'inline-block', border: '2px solid rgba(255, 255, 255, 0.3)' }}>
      {grid.map((row, rowIndex) => (
        <Box key={rowIndex} sx={{ display: 'flex' }}>
          {row.map((cell, colIndex) => (
            <Box
              key={`${rowIndex}-${colIndex}`}
              onClick={() => onCellClick(rowIndex, colIndex)}
              sx={getCellStyle(rowIndex, colIndex)}
            >
              {cell || ''}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};
