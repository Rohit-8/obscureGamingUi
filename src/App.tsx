import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GameCatalog from './pages/GameCatalog';
import GameDetail from './pages/GameDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import OnlinePlayers from './pages/OnlinePlayers';

// Import all games - using the new index.tsx structure
import SudokuGame from './games/Sudoku';
import TicTacToeGame from './games/TicTacToe';
import WhackAMoleGame from './games/WhackAMole';
import SimonGame from './games/SimonGame';
import RockTheBeatGame from './games/RockTheBeat';
import DiceGame from './games/DiceGame';
import PhysicsInteractiveGame from './games/PhysicsInteractive';
import MindfulFractalGame from './games/MindfulFractal';
import MemoryMatchingGame from './games/MemoryMatching';
import WordSearchGame from './games/WordSearch';
import MazeGame from './games/MazeGame';
import TowerDefenseGame from './games/TowerDefense';
import TriviaQuizGame from './games/TriviaQuiz';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
    },
    secondary: {
      main: '#7ee7c7',
    },
    background: {
      default: '#0b1220',
      paper: '#0f1724',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Arial',
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/games" element={<ProtectedRoute><GameCatalog /></ProtectedRoute>} />
                <Route path="/games/:gameId" element={<ProtectedRoute><GameDetail /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                <Route path="/online-players" element={<ProtectedRoute><OnlinePlayers /></ProtectedRoute>} />

                {/* Game routes */}
                <Route path="/play/sudoku" element={<ProtectedRoute><SudokuGame /></ProtectedRoute>} />
                <Route path="/play/tictactoe" element={<ProtectedRoute><TicTacToeGame /></ProtectedRoute>} />
                <Route path="/play/whackamole" element={<ProtectedRoute><WhackAMoleGame /></ProtectedRoute>} />
                <Route path="/play/simon" element={<ProtectedRoute><SimonGame /></ProtectedRoute>} />
                <Route path="/play/rockthebeat" element={<ProtectedRoute><RockTheBeatGame /></ProtectedRoute>} />
                <Route path="/play/dice" element={<ProtectedRoute><DiceGame /></ProtectedRoute>} />
                <Route path="/play/physics" element={<ProtectedRoute><PhysicsInteractiveGame /></ProtectedRoute>} />
                <Route path="/play/mindful" element={<ProtectedRoute><MindfulFractalGame /></ProtectedRoute>} />
                <Route path="/play/memory" element={<ProtectedRoute><MemoryMatchingGame /></ProtectedRoute>} />
                <Route path="/play/wordsearch" element={<ProtectedRoute><WordSearchGame /></ProtectedRoute>} />
                <Route path="/play/maze" element={<ProtectedRoute><MazeGame /></ProtectedRoute>} />
                <Route path="/play/tower" element={<ProtectedRoute><TowerDefenseGame /></ProtectedRoute>} />
                <Route path="/play/trivia" element={<ProtectedRoute><TriviaQuizGame /></ProtectedRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
