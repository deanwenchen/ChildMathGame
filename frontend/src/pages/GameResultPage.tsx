import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  useTheme
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimerIcon from '@mui/icons-material/Timer';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { useGame } from '../contexts/GameContext';

const GameResultPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { currentUser, submitScore } = useGame();

  const [result, setResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedResult = sessionStorage.getItem('gameResult');
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      navigate('/practice');
    }
  }, []);

  // 获取颜色根据分数
  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.primary.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // 获取勋章
  const getMedalIcon = (score: number) => {
    if (score >= 90) return '🥇';
    if (score >= 80) return '🥈';
    if (score >= 70) return '🥉';
    return '⭐';
  };

  // 保存成绩
  const handleSaveScore = async () => {
    if (!currentUser || !result) return;

    setIsSubmitting(true);
    try {
      await submitScore({
        user_id: currentUser.id,
        difficulty: result.difficulty,
        operation_type: result.operation,
        total_questions: result.totalQuestions,
        correct_count: result.correctCount,
        score: result.score,
        time_spent: result.timeSpent
      });

      navigate('/scores');
    } catch (error) {
      console.error('保存成绩失败:', error);
      alert('保存成绩失败，请重试');
      setIsSubmitting(false);
    }
  };

  // 不保存直接返回
  const handleSkipSave = () => {
    navigate('/');
  };

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ p: 4, bgcolor: getScoreColor(result.score), color: 'white' }}>
        {/* 标题 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mx: 'auto',
              mb: 2,
              fontSize: '4rem'
            }}
          >
            {getMedalIcon(result.score)}
          </Avatar>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            游戏结束！
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {result.achievement}
          </Typography>
        </Box>

        {/* 成绩卡片 */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <CardContent>
            <Grid container spacing={3}>
              {/* 总分 */}
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    你的得分
                  </Typography>
                  <Typography
                    variant="h1"
                    fontWeight="bold"
                    sx={{ fontSize: '4rem', mt: 1 }}
                  >
                    {result.score}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mt: 1 }}>
                    满分100分
                  </Typography>
                </Box>
              </Grid>

              {/* 详细统计 */}
              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {result.correctCount}/{result.totalQuestions}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  答对题目
                </Typography>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <TimerIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {result.timeSpent}秒
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  总用时
                </Typography>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <SchoolIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {result.difficulty === 'easy' ? '简单' : result.difficulty === 'medium' ? '中等' : '困难'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  难度级别
                </Typography>
              </Grid>

              <Grid item xs={6} sx={{ textAlign: 'center' }}>
                <StarIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  {Math.round((result.correctCount / result.totalQuestions) * 100)}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  正确率
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSaveScore}
            disabled={isSubmitting}
            sx={{
              px: 4,
              py: 1.5,
              bgcolor: 'white',
              color: getScoreColor(result.score),
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
          >
            {isSubmitting ? '保存中...' : '💾 保存成绩'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={handleSkipSave}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: 'white',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            🏠 返回首页
          </Button>
        </Box>

        {/* 小提示 */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            保存成绩后可以在"我的成绩"页面查看历史记录和进步轨迹哦！
          </Typography>
        </Box>
      </Card>
    </Container>
  );
};

export default GameResultPage;
