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
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Home, Refresh, Quiz, Timer } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTriviaQuiz } from './hooks/useTriviaQuiz';

const TriviaQuizGame: React.FC = () => {
  const navigate = useNavigate();
  const { gameState, selectAnswer, nextQuestion, restartGame, setCategory, setDifficulty } = useTriviaQuiz();

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];

  const getOptionColor = (index: number) => {
    if (!gameState.showResult) return 'rgba(255,255,255,0.1)';
    if (index === currentQuestion?.correctAnswer) return 'rgba(76, 175, 80, 0.3)';
    if (index === gameState.selectedAnswer && index !== currentQuestion?.correctAnswer) return 'rgba(244, 67, 54, 0.3)';
    return 'rgba(255,255,255,0.1)';
  };

  const getProgressValue = () => {
    return ((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100;
  };

  if (gameState.questions.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4">Loading questions...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{
          background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}>
          🧠 Trivia Quiz
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Test your knowledge with challenging trivia questions!
        </Typography>
      </Box>

      {!gameState.gameComplete ? (
        <>
          {/* Progress and Stats */}
          <Paper sx={{ p: 3, mb: 3, background: 'rgba(255,255,255,0.02)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  Question {gameState.currentQuestionIndex + 1} of {gameState.questions.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getProgressValue()}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip label={`Score: ${gameState.score}`} variant="outlined" />
              </Grid>
              <Grid item xs={6} sm={3}>
                <Chip
                  icon={<Timer />}
                  label={`${gameState.timeLeft}s`}
                  color={gameState.timeLeft <= 10 ? 'error' : 'default'}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Question */}
          <Paper sx={{ p: 4, mb: 3, background: 'rgba(255,255,255,0.02)' }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              {currentQuestion?.question}
            </Typography>

            <Grid container spacing={2}>
              {currentQuestion?.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    sx={{
                      cursor: gameState.showResult ? 'default' : 'pointer',
                      backgroundColor: getOptionColor(index),
                      border: gameState.selectedAnswer === index ? '2px solid #60a5fa' : '1px solid rgba(255,255,255,0.2)',
                      transition: 'all 0.2s ease',
                      '&:hover': gameState.showResult ? {} : {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => selectAnswer(index)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="body1">
                        {String.fromCharCode(65 + index)}. {option}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {gameState.showResult && (
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                {gameState.selectedAnswer === currentQuestion?.correctAnswer ? (
                  <Typography variant="h6" sx={{ color: '#4caf50', mb: 2 }}>
                    🎉 Correct! +{gameState.timeLeft > 15 ? 20 : 10} points
                  </Typography>
                ) : (
                  <Typography variant="h6" sx={{ color: '#f44336', mb: 2 }}>
                    ❌ Incorrect! The correct answer was {String.fromCharCode(65 + currentQuestion.correctAnswer)}
                  </Typography>
                )}

                {currentQuestion?.explanation && (
                  <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
                    {currentQuestion.explanation}
                  </Typography>
                )}

                <Button
                  variant="contained"
                  onClick={nextQuestion}
                  sx={{
                    background: 'linear-gradient(90deg, #60a5fa, #7ee7c7)',
                    '&:hover': { background: 'linear-gradient(90deg, #4f94d4, #6dd5b4)' }
                  }}
                >
                  {gameState.currentQuestionIndex >= gameState.questions.length - 1 ? 'See Results' : 'Next Question'}
                </Button>
              </Box>
            )}
          </Paper>
        </>
      ) : (
        /* Game Complete */
        <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <Typography variant="h4" gutterBottom>🎊 Quiz Complete!</Typography>
          <Typography variant="h5" sx={{ mb: 2 }}>Final Score: {gameState.score}</Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You got {gameState.questions.filter((q, i) => i < gameState.currentQuestionIndex + 1).reduce((acc, q, i) => {
              return acc + (gameState.selectedAnswer === q.correctAnswer ? 1 : 0);
            }, 0)} out of {gameState.questions.length} questions correct!
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" onClick={restartGame} startIcon={<Refresh />}>
              Play Again
            </Button>
            <Button variant="outlined" onClick={() => navigate('/games')} startIcon={<Home />}>
              Back to Games
            </Button>
          </Box>
        </Paper>
      )}

      {/* Settings Panel */}
      <Paper sx={{ p: 3, background: 'rgba(255,255,255,0.02)' }}>
        <Typography variant="h6" gutterBottom>Game Settings</Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Category</Typography>
          <ToggleButtonGroup
            value={gameState.category}
            exclusive
            onChange={(_, value) => value && setCategory(value)}
            size="small"
          >
            <ToggleButton value="mixed">Mixed</ToggleButton>
            <ToggleButton value="science">Science</ToggleButton>
            <ToggleButton value="history">History</ToggleButton>
            <ToggleButton value="nature">Nature</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" gutterBottom>Difficulty</Typography>
          <ToggleButtonGroup
            value={gameState.difficulty}
            exclusive
            onChange={(_, value) => value && setDifficulty(value)}
            size="small"
          >
            <ToggleButton value="easy">Easy</ToggleButton>
            <ToggleButton value="medium">Medium</ToggleButton>
            <ToggleButton value="hard">Hard</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>
    </Container>
  );
};

export default TriviaQuizGame;
