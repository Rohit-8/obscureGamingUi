import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { HealthProvider } from './hooks/useHealth';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import GameCatalog from './pages/GameCatalog';
import GameDetail from './pages/GameDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import OnlinePlayers from './pages/OnlinePlayers';
import About from './pages/About';

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
        <HealthProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box component="main" sx={{ flexGrow: 1 }}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Landing and games are public - games do not require backend */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/games" element={<GameCatalog />} />
                  <Route path="/games/:gameId" element={<GameDetail />} />
                  <Route path="/about" element={<About />} />

                  {/* Backend-dependent routes (require auth + backend) */}
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  <Route path="/online-players" element={<ProtectedRoute><OnlinePlayers /></ProtectedRoute>} />

                  {/* Game routes (public) */}
                  <Route path="/play/sudoku" element={<SudokuGame />} />
                  <Route path="/play/tictactoe" element={<TicTacToeGame />} />
                  <Route path="/play/whackamole" element={<WhackAMoleGame />} />
                  <Route path="/play/simon" element={<SimonGame />} />
                  <Route path="/play/rockthebeat" element={<RockTheBeatGame />} />
                  <Route path="/play/dice" element={<DiceGame />} />
                  <Route path="/play/physics" element={<PhysicsInteractiveGame />} />
                  <Route path="/play/mindful" element={<MindfulFractalGame />} />
                  <Route path="/play/memory" element={<MemoryMatchingGame />} />
                  <Route path="/play/wordsearch" element={<WordSearchGame />} />
                  <Route path="/play/maze" element={<MazeGame />} />
                  <Route path="/play/tower" element={<TowerDefenseGame />} />
                  <Route path="/play/trivia" element={<TriviaQuizGame />} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </HealthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
