import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h3" gutterBottom>
        About Obscure Gaming
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          A playful, lightweight platform for casual games
        </Typography>

        <Typography paragraph color="text.secondary">
          Obscure Gaming is a collection of small, focused browser games designed for fast,
          privacy-friendly play without mandatory accounts. The platform emphasizes
          accessibility, low friction, and experimentation: players can open the site and
          start playing instantly.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Key principles</Typography>
          <ul>
            <li>Play-first: most games are playable without signing in.</li>
            <li>Progressive server features: leaderboards, personalized stats and online
              features become available when the server is connected and you sign in.</li>
            <li>Lightweight UX: compact, responsive UI that runs well on phones and laptops.</li>
            <li>Modular architecture: each game is self-contained to make iteration easy.</li>
          </ul>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">For developers</Typography>
          <Typography paragraph color="text.secondary">
            This project uses React + TypeScript and MUI for styling. API calls are proxied
            in development and gated behind a health-check so the UI degrades gracefully when
            server services are still under development.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Want to contribute?</Typography>
          <Typography paragraph color="text.secondary">
            Contributions, new game ideas, and bug reports are welcome — open a PR or issue
            in the repository and we'll triage it.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
