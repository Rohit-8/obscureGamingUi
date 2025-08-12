import React from 'react';
import { Grid, Box } from '@mui/material';
import { Card } from '../types';

interface MemoryCardProps {
  card: Card;
  onClick: (cardId: number) => void;
  disabled: boolean;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ card, onClick, disabled }) => {
  return (
    <Box
      onClick={() => !disabled && onClick(card.id)}
      sx={{
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        backgroundColor: card.isMatched
          ? 'rgba(126, 231, 199, 0.3)'
          : card.isFlipped
            ? 'rgba(96, 165, 250, 0.3)'
            : 'rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: 2,
        cursor: disabled || card.isFlipped || card.isMatched ? 'default' : 'pointer',
        transition: 'all 0.3s ease',
        transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)',
        transformStyle: 'preserve-3d',
        '&:hover': {
          backgroundColor: disabled || card.isFlipped || card.isMatched
            ? undefined
            : 'rgba(255,255,255,0.2)',
          transform: disabled || card.isFlipped || card.isMatched
            ? undefined
            : 'rotateY(180deg) scale(1.05)',
        },
      }}
    >
      {card.isFlipped || card.isMatched ? card.value : '❓'}
    </Box>
  );
};

interface GameGridProps {
  cards: Card[];
  onCardClick: (cardId: number) => void;
  disabled: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({ cards, onCardClick, disabled }) => {
  return (
    <Grid container spacing={2} sx={{ maxWidth: '400px', margin: '0 auto', mb: 3 }}>
      {cards.map((card) => (
        <Grid item xs={3} key={card.id}>
          <MemoryCard
            card={card}
            onClick={onCardClick}
            disabled={disabled}
          />
        </Grid>
      ))}
    </Grid>
  );
};
