/**
 * 错题复习页面
 *
 * 功能：
 * 1. 展示今日待复习的错题
 * 2. 用户作答后记录复习结果
 * 3. 根据艾宾浩斯曲线更新复习计划
 */

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
  LinearProgress,
  Alert,
  Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useGame } from '../contexts/GameContext';
import { MistakeRecord } from '../types';
import { getTodayString } from '../utils/mistakeAnalyzer';

export const MistakeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { mistakes, recordReview, getReviewQueue, refreshMistakeBook } = useGame();

  const [reviewQueue, setReviewQueue] = useState<MistakeRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // 加载待复习队列
  useEffect(() => {
    const queue = getReviewQueue();
    setReviewQueue(queue.slice(0, 5)); // 每次最多复习 5 题
  }, [mistakes, getReviewQueue]);

  const currentMistake = reviewQueue[currentIndex];

  // 处理提交答案
  const handleSubmit = () => {
    if (!currentMistake || !userAnswer) return;

    const answer = parseFloat(userAnswer);
    const correct = answer === currentMistake.correctAnswer;

    setIsCorrect(correct);
    setShowResult(true);

    // 记录复习结果
    recordReview(currentMistake.id, correct);

    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  // 下一题
  const handleNext = () => {
    setReviewedCount(prev => prev + 1);
    setUserAnswer('');
    setShowResult(false);

    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // 复习完成
      refreshMistakeBook();
    }
  };

  // 跳过
  const handleSkip = () => {
    setUserAnswer('');
    setShowResult(false);

    if (currentIndex < reviewQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      refreshMistakeBook();
    }
  };

  // 复习完成页面
  if (currentIndex >= reviewQueue.length && reviewQueue.length > 0) {
    const accuracy = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0;

    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              🎉 复习完成！
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              今日任务已完成
            </Typography>

            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Grid item>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`答对：${correctCount}题`}
                  color="success"
                  size="large"
                />
              </Grid>
              <Grid item>
                <Chip
                  label={`准确率：${accuracy}%`}
                  color={accuracy >= 80 ? 'success' : 'warning'}
                  size="large"
                />
              </Grid>
            </Grid>

            <Alert severity="success" sx={{ mb: 3 }}>
              {accuracy === 100
                ? '太棒了！全部答对！🌟'
                : accuracy >= 80
                ? '做得很好！继续保持！👍'
                : '加油！明天继续努力！💪'}
            </Alert>

            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/profile')}
              startIcon={<ArrowBackIcon />}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 没有待复习题目
  if (reviewQueue.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h3" sx={{ mb: 2 }}>
              ✨ 太棒了！
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              今日没有需要复习的题目
            </Typography>
            <Alert severity="success" sx={{ mb: 3 }}>
              所有错题都已掌握，继续加油！
            </Alert>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/profile')}
              startIcon={<ArrowBackIcon />}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // 复习题目页面
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      {/* 进度条 */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            复习进度
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentIndex + 1} / {reviewQueue.length}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / reviewQueue.length) * 100}
        />
      </Box>

      <Card elevation={3}>
        <CardContent sx={{ p: 3 }}>
          {/* 题目卡片 */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              bgcolor: 'primary.50',
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
              {currentMistake?.expression} = ?
            </Typography>

            {/* 上次错误答案提示 */}
            <Chip
              icon={<ErrorIcon />}
              label={`上次回答：${currentMistake?.userAnswer}`}
              color="warning"
              size="small"
              sx={{ mb: 1 }}
            />

            {/* 复习次数提示 */}
            <Chip
              icon={<AutoFixHighIcon />}
              label={`第${currentMistake?.reviewCount! + 1}次复习`}
              color="info"
              size="small"
              sx={{ ml: 1 }}
            />
          </Paper>

          {/* 答案输入 */}
          <TextField
            fullWidth
            variant="outlined"
            size="large"
            type="number"
            placeholder="请输入答案"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showResult}
            sx={{ mb: 2 }}
            autoFocus
            InputProps={{
              sx: { fontSize: '1.5rem', textAlign: 'center' }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !showResult && userAnswer) {
                handleSubmit();
              } else if (e.key === 'Enter' && showResult) {
                handleNext();
              }
            }}
          />

          {/* 提交按钮 */}
          {!showResult ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!userAnswer}
            >
              提交答案
            </Button>
          ) : (
            <>
              {/* 结果反馈 */}
              <Alert
                severity={isCorrect ? 'success' : 'info'}
                sx={{ mb: 2 }}
              >
                {isCorrect
                  ? '答对了！真棒！🎉'
                  : `正确答案是：${currentMistake?.correctAnswer}`}
              </Alert>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleNext}
              >
                {currentIndex < reviewQueue.length - 1 ? '下一题' : '完成'}
              </Button>
            </>
          )}

          {/* 跳过按钮 */}
          {!showResult && (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleSkip}
              sx={{ mt: 1 }}
            >
              跳过
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 复习提示 */}
      <Alert severity="info" sx={{ mt: 2 }}>
        💡 提示：根据艾宾浩斯遗忘曲线，定期复习可以帮助你更好地记忆哦！
      </Alert>
    </Container>
  );
};

export default MistakeReviewPage;
