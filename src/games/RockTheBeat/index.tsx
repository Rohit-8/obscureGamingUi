import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { Home, PlayArrow, Pause, VolumeUp, MusicNote } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RockTheBeatGame: React.FC = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [combo, setCombo] = React.useState(0);
  const [difficulty, setDifficulty] = React.useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentBeat, setCurrentBeat] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(120);
  const [activeLanes, setActiveLanes] = React.useState<boolean[]>([false, false, false, false]);

  const beatPatterns = {
    easy: [1, 0, 1, 0, 1, 0, 1, 0],
    medium: [1, 0, 1, 1, 0, 1, 0, 1],
    hard: [1, 1, 0, 1, 1, 0, 1, 0]
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setCombo(0);
    setCurrentBeat(0);
    setTimeLeft(120);
  };

  const stopGame = () => {
    setIsPlaying(false);
  };

  const hitLane = (laneIndex: number) => {
    if (!isPlaying) return;

    // Simulate hitting a beat
    const pattern = beatPatterns[difficulty];
    const expectedBeat = pattern[currentBeat % pattern.length];

    if (expectedBeat === 1) {
      // Correct hit
      setScore(prev => prev + (10 + combo * 2));
      setCombo(prev => prev + 1);

      // Visual feedback
      const newActiveLanes = [...activeLanes];
      newActiveLanes[laneIndex] = true;
      setActiveLanes(newActiveLanes);

      setTimeout(() => {
        setActiveLanes(prev => {
          const updated = [...prev];
          updated[laneIndex] = false;
          return updated;
        });
      }, 200);
    } else {
      // Miss
      setCombo(0);
    }
  };

  // Game loop effect
  React.useEffect(() => {
    if (isPlaying) {
      const gameTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const beatTimer = setInterval(() => {
        setCurrentBeat(prev => prev + 1);
      }, 500); // 120 BPM

      return () => {
        clearInterval(gameTimer);
        clearInterval(beatTimer);
      };
    }
  }, [isPlaying]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🎵 Rock The Beat
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Rhythm game - Hit the beats and rock the music!
        </Typography>
      </Box>

      <Paper sx={{ p: 4, background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
        {/* Game Stats */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
          <Chip
            icon={<MusicNote />}
            label={`Score: ${score}`}
            variant="outlined"
            sx={{ fontSize: '1rem' }}
          />
          <Chip label={`Combo: ${combo}x`} variant="outlined" sx={{ fontSize: '1rem' }} />
          <Chip label={`Time: ${formatTime(timeLeft)}`} variant="outlined" sx={{ fontSize: '1rem' }} />
        </Box>

        {/* Beat Progress */}
        <LinearProgress
          variant="determinate"
          value={(currentBeat % 8) * 12.5}
          sx={{ mb: 4, height: 8, borderRadius: 4 }}
        />

        {/* Game Lanes */}
        <Grid container spacing={2} sx={{ maxWidth: '500px', margin: '0 auto', mb: 4 }}>
          {[0, 1, 2, 3].map((laneIndex) => (
            <Grid item xs={3} key={laneIndex}>
              <Card
                sx={{
                  height: '200px',
                  cursor: 'pointer',
                  backgroundColor: activeLanes[laneIndex]
                    ? 'rgba(126, 231, 199, 0.5)'
                    : 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => hitLane(laneIndex)}
              >
                <CardContent sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {['🎸', '🥁', '🎹', '🎤'][laneIndex]}
                  </Typography>
                  <Typography variant="body2">
                    Lane {laneIndex + 1}
                  </Typography>
                  <Typography variant="caption" sx={{ mt: 1 }}>
                    Click to hit!
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Difficulty Selector */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Difficulty</Typography>
          <ToggleButtonGroup
            value={difficulty}
            exclusive
            onChange={(_, value) => value && setDifficulty(value)}
            disabled={isPlaying}
          >
            <ToggleButton value="easy">Easy</ToggleButton>
            <ToggleButton value="medium">Medium</ToggleButton>
            <ToggleButton value="hard">Hard</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          {!isPlaying ? (
            <Button
              variant="contained"
              onClick={startGame}
              startIcon={<PlayArrow />}
              sx={{
                background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
                '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' },
                fontSize: '1.1rem',
                py: 1.5,
                px: 3,
              }}
            >
              Start Jamming
            </Button>
          ) : (
            <Button variant="outlined" onClick={stopGame} startIcon={<Pause />}>
              Stop
            </Button>
          )}

          <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
            Back to Games
          </Button>
        </Box>

        {/* Game Complete */}
        {!isPlaying && score > 0 && (
          <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
            <Typography variant="h5" sx={{ color: '#7ee7c7', mb: 2 }}>
              🎉 Great Performance!
            </Typography>
            <Typography variant="body1">
              Final Score: {score} points with {combo} max combo!
            </Typography>
          </Box>
        )}

        {/* Instructions */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>How to play:</strong><br />
            • Click the lanes in rhythm with the beat<br />
            • Build combos for higher scores<br />
            • Follow the progress bar for timing<br />
            • Try different difficulties for more challenge
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RockTheBeatGame;
