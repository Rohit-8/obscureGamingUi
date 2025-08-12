import { useState, useCallback, useEffect, useRef } from 'react';
import { Question, TriviaGameState } from '../types';

const sampleQuestions: Question[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    category: "geography",
    difficulty: "easy",
    explanation: "Paris has been the capital of France since 987 AD."
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "science",
    difficulty: "easy",
    explanation: "Mars appears red due to iron oxide (rust) on its surface."
  },
  {
    id: 3,
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
    correctAnswer: 2,
    category: "art",
    difficulty: "medium",
    explanation: "Leonardo da Vinci painted the Mona Lisa between 1503-1519."
  },
  {
    id: 4,
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswer: 1,
    category: "nature",
    difficulty: "easy",
    explanation: "Blue whales can reach up to 100 feet in length and weigh up to 200 tons."
  },
  {
    id: 5,
    question: "In which year did World War II end?",
    options: ["1944", "1945", "1946", "1947"],
    correctAnswer: 1,
    category: "history",
    difficulty: "medium",
    explanation: "World War II ended in 1945 with the surrender of Japan in September."
  },
  {
    id: 6,
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    category: "science",
    difficulty: "medium",
    explanation: "Au comes from the Latin word 'aurum' meaning gold."
  },
  {
    id: 7,
    question: "Which Shakespeare play features the characters Romeo and Juliet?",
    options: ["Hamlet", "Macbeth", "Romeo and Juliet", "Othello"],
    correctAnswer: 2,
    category: "literature",
    difficulty: "easy",
    explanation: "Romeo and Juliet is one of Shakespeare's most famous tragedies."
  },
  {
    id: 8,
    question: "What is the fastest land animal?",
    options: ["Lion", "Cheetah", "Leopard", "Tiger"],
    correctAnswer: 1,
    category: "nature",
    difficulty: "easy",
    explanation: "Cheetahs can reach speeds of up to 70 mph."
  }
];

export const useTriviaQuiz = () => {
  const [gameState, setGameState] = useState<TriviaGameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    selectedAnswer: null,
    showResult: false,
    gameComplete: false,
    timeLeft: 30,
    streak: 0,
    category: 'mixed',
    difficulty: 'medium'
  });

  const timerRef = useRef<NodeJS.Timeout>();

  const generateQuestions = useCallback(() => {
    let filteredQuestions = [...sampleQuestions];

    if (gameState.category !== 'mixed') {
      filteredQuestions = sampleQuestions.filter(q => q.category === gameState.category);
    }

    if (gameState.difficulty !== 'medium') {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === gameState.difficulty);
    }

    // If not enough questions, fall back to all questions
    if (filteredQuestions.length < 5) {
      filteredQuestions = [...sampleQuestions];
    }

    // Shuffle and take 8 questions
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5).slice(0, 8);

    setGameState(prev => ({
      ...prev,
      questions: shuffled,
      currentQuestionIndex: 0,
      score: 0,
      selectedAnswer: null,
      showResult: false,
      gameComplete: false,
      timeLeft: 30,
      streak: 0
    }));
  }, [gameState.category, gameState.difficulty]);

  const selectAnswer = useCallback((answerIndex: number) => {
    if (gameState.selectedAnswer !== null || gameState.showResult) return;

    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex }));

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setTimeout(() => {
      setGameState(prev => ({ ...prev, showResult: true }));
    }, 500);
  }, [gameState.selectedAnswer, gameState.showResult]);

  const nextQuestion = useCallback(() => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correctAnswer;
    const newScore = isCorrect ? gameState.score + (gameState.timeLeft > 15 ? 20 : 10) : gameState.score;
    const newStreak = isCorrect ? gameState.streak + 1 : 0;

    if (gameState.currentQuestionIndex >= gameState.questions.length - 1) {
      // Game complete
      setGameState(prev => ({
        ...prev,
        score: newScore,
        streak: newStreak,
        gameComplete: true
      }));
    } else {
      // Next question
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        score: newScore,
        streak: newStreak,
        selectedAnswer: null,
        showResult: false,
        timeLeft: 30
      }));
    }
  }, [gameState.currentQuestionIndex, gameState.questions.length, gameState.selectedAnswer, gameState.score, gameState.streak, gameState.timeLeft]);

  const restartGame = useCallback(() => {
    generateQuestions();
  }, [generateQuestions]);

  const setCategory = useCallback((category: TriviaGameState['category']) => {
    setGameState(prev => ({ ...prev, category }));
  }, []);

  const setDifficulty = useCallback((difficulty: TriviaGameState['difficulty']) => {
    setGameState(prev => ({ ...prev, difficulty }));
  }, []);

  // Timer effect
  useEffect(() => {
    if (!gameState.showResult && !gameState.gameComplete && gameState.questions.length > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            // Time's up, auto-select wrong answer
            setTimeout(() => {
              setGameState(current => ({ ...current, showResult: true }));
            }, 100);
            return { ...prev, timeLeft: 0, selectedAnswer: -1 };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.showResult, gameState.gameComplete, gameState.currentQuestionIndex]);

  // Initialize game
  useEffect(() => {
    generateQuestions();
  }, []);

  return {
    gameState,
    selectAnswer,
    nextQuestion,
    restartGame,
    setCategory,
    setDifficulty
  };
};
