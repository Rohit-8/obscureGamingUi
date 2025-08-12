export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

export interface TriviaGameState {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  selectedAnswer: number | null;
  showResult: boolean;
  gameComplete: boolean;
  timeLeft: number;
  streak: number;
  category: 'mixed' | 'science' | 'history' | 'sports' | 'entertainment';
  difficulty: 'easy' | 'medium' | 'hard';
}
