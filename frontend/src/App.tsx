import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GameProvider, useGame } from './contexts/GameContext';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import PracticeGamePage from './pages/PracticeGamePage';
import GameResultPage from './pages/GameResultPage';
import ScorePage from './pages/ScorePage';
import ProfilePage from './pages/ProfilePage';
import WelcomePage from './pages/WelcomePage';

// 创建主题（儿童友好的颜色）
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // 绿色 - 积极
    },
    secondary: {
      main: '#FF9800', // 橙色 - 活力
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h1: { fontSize: '2.5rem' },
    h2: { fontSize: '2rem' },
    h3: { fontSize: '1.75rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '12px 24px',
        },
      },
    },
  },
});

// 路由守卫：需要登录才能访问的页面
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useGame();

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// 首页路由：如果已登录则跳转到主页
const HomeRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useGame();

  if (currentUser) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameProvider>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <HomeRoute>
                  <WelcomePage />
                </HomeRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <PracticePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice-game"
              element={
                <ProtectedRoute>
                  <PracticeGamePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-result"
              element={
                <ProtectedRoute>
                  <GameResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/scores"
              element={
                <ProtectedRoute>
                  <ScorePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </GameProvider>
    </ThemeProvider>
  );
}

export default App;
