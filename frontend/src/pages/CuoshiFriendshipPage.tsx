import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarRating from '../components/cuoshi/StarRating';
import LevelSelector from '../components/cuoshi/LevelSelector';
import CuoshiGamePage from './CuoshiGamePage';

/**
 * 关卡进度数据结构
 */
interface LevelProgress {
  '9': { completed: boolean; stars: number; correctCount: number };
  '8': { completed: boolean; stars: number; correctCount: number };
  '7': { completed: boolean; stars: number; correctCount: number };
  '6': { completed: boolean; stars: number; correctCount: number };
}

/**
 * 凑十法闯关 - 关卡选择页面
 *
 * 功能：
 * - 显示所有关卡（带解锁状态）
 * - 显示每关的星级评价
 * - 选择关卡开始游戏
 * - 查看通关进度
 */
const CuoshiFriendshipPage: React.FC = () => {
  const navigate = useNavigate();

  // 当前选择的游戏关卡
  const [selectedLevel, setSelectedLevel] = useState<'9' | '8' | '7' | '6' | null>(null);

  // 关卡进度（从 localStorage 读取）
  const [levelProgress, setLevelProgress] = useState<LevelProgress>({
    '9': { completed: false, stars: 0, correctCount: 0 },
    '8': { completed: false, stars: 0, correctCount: 0 },
    '7': { completed: false, stars: 0, correctCount: 0 },
    '6': { completed: false, stars: 0, correctCount: 0 },
  });

  // 从 localStorage 加载进度
  useEffect(() => {
    const saved = localStorage.getItem('cuoshi_progress');
    if (saved) {
      try {
        setLevelProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // 保存进度到 localStorage
  const saveProgress = (progress: LevelProgress) => {
    localStorage.setItem('cuoshi_progress', JSON.stringify(progress));
    setLevelProgress(progress);
  };

  // 处理关卡完成
  const handleLevelComplete = (
    level: '9' | '8' | '7' | '6',
    stars: number,
    correctCount: number
  ) => {
    const newProgress = {
      ...levelProgress,
      [level]: {
        completed: true,
        stars: Math.max(levelProgress[level].stars, stars), // 保留最高星级
        correctCount,
      },
    };
    saveProgress(newProgress);
    setSelectedLevel(null);
  };

  // 处理返回
  const handleBack = () => {
    navigate('/home');
  };

  // 如果正在游戏中，显示游戏页面
  if (selectedLevel) {
    return (
      <CuoshiGamePage
        level={selectedLevel}
        onComplete={handleLevelComplete}
        onBack={() => setSelectedLevel(null)}
      />
    );
  }

  // 计算总进度
  const totalStars = Object.values(levelProgress).reduce(
    (sum, level) => sum + level.stars,
    0
  );
  const completedCount = Object.values(levelProgress).filter((l) => l.completed).length;
  const isAllCompleted = completedCount === 4;

  return (
    <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          返回首页
        </Button>
      </Box>

      {/* 标题区域 */}
      <Card
        sx={{
          mb: 4,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography variant="h2" gutterBottom fontWeight="bold">
            🎯 凑十法闯关
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            看大数，分小数，凑成十，加剩数
          </Typography>

          {/* 总进度 */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {completedCount}/4
              </Typography>
              <Typography variant="body2">已完成关卡</Typography>
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                {totalStars}/12
              </Typography>
              <Typography variant="body2">获得星星</Typography>
            </Box>
          </Box>

          {/* 全通关徽章 */}
          {isAllCompleted && (
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 3,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: '2rem' }} />
              <Typography variant="h6" fontWeight="bold">
                凑十法大师！
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 凑十法口诀卡片 */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'background.default' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
          📖 凑十法口诀
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
            mt: 2,
          }}
        >
          <Chip label="👀 看大数" color="primary" />
          <Chip label="✂️ 分小数" color="primary" />
          <Chip label="🎯 凑成十" color="primary" />
          <Chip label="➕ 加剩数" color="primary" />
        </Box>
      </Paper>

      {/* 关卡选择器 */}
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        🗺️ 选择关卡
      </Typography>
      <LevelSelector
        completedLevels={{
          '9': levelProgress['9'].completed,
          '8': levelProgress['8'].completed,
          '7': levelProgress['7'].completed,
          '6': levelProgress['6'].completed,
        }}
        levelStars={{
          '9': levelProgress['9'].stars,
          '8': levelProgress['8'].stars,
          '7': levelProgress['7'].stars,
          '6': levelProgress['6'].stars,
        }}
        onLevelSelect={setSelectedLevel}
      />

      {/* 通关提示 */}
      {isAllCompleted && (
        <Paper
          elevation={3}
          sx={{
            mt: 4,
            p: 3,
            bgcolor: 'success.light',
            textAlign: 'center',
          }}
        >
          <StarRating stars={3} size="medium" />
          <Typography variant="h6" fontWeight="bold" color="success.dark">
            🎉 恭喜你完成所有关卡！
          </Typography>
          <Typography variant="body2" color="success.dark" sx={{ mt: 1 }}>
            你已经掌握了凑十法的精髓！继续练习保持手感吧！
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default CuoshiFriendshipPage;
