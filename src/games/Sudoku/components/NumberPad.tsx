import React from 'react';
import { Box, Button, Grid } from '@mui/material';

interface NumberPadProps {
  onNumberSelect: (num: number) => void;
  onClear: () => void;
  disabled: boolean;
}

export const NumberPad: React.FC<NumberPadProps> = ({ onNumberSelect, onClear, disabled }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={1} sx={{ maxWidth: '300px', margin: '0 auto' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Grid item xs={4} key={num}>
            <Button
              variant="outlined"
              onClick={() => onNumberSelect(num)}
              disabled={disabled}
              sx={{
                width: '100%',
                height: '50px',
                fontSize: '1.2rem',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#7ee7c7',
                '&:hover': {
                  borderColor: '#7ee7c7',
                  backgroundColor: 'rgba(126, 231, 199, 0.1)',
                },
              }}
            >
              {num}
            </Button>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="outlined"
            onClick={onClear}
            disabled={disabled}
            sx={{
              width: '100%',
              height: '50px',
              fontSize: '1rem',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#ff6b6b',
              '&:hover': {
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
              },
            }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};
