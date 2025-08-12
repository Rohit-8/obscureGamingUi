import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';

const GameDetail: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Game Details for {gameId}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page would show detailed information about the selected game.
        </Typography>
      </Box>
    </Container>
  );
};

export default GameDetail;
